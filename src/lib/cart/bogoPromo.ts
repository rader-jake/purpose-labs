import "server-only";
import { addCartItem, removeCartItem, getCart, StoreApiError } from "./storeApi";
import type { CartTokens } from "./storeApi";
import type { Cart, CartItem } from "./types";

/**
 * Product IDs excluded from BOGO:
 * - 94: Recon Water (bac water)
 * - 837, 840, 842, 846, 848: bundles
 * - 801, 806: spray products
 */
const BOGO_EXCLUDED_IDS = new Set([94, 837, 840, 842, 846, 848, 801, 806]);

/**
 * Item data key used to mark a free BOGO item.
 * We embed this in the item name check since Store API
 * doesn't expose custom item_data we set via PHP.
 */
const BOGO_LABEL = "[BOGO-FREE]";

function isFreeBogoItem(item: CartItem): boolean {
  return item.name.includes(BOGO_LABEL) || item.totals.line_total === "0" && item.totals.line_subtotal !== "0";
}

function isPaidBogoItem(item: CartItem): boolean {
  return !BOGO_EXCLUDED_IDS.has(item.id) && !isFreeBogoItem(item);
}

/**
 * Buy 2 Get 1 Free — same product.
 *
 * For each qualifying paid product, the number of free units earned is:
 *   freeQty = Math.floor(paidQuantity / 2)
 *
 * Examples:
 *   qty 1 → 0 free
 *   qty 2 → 1 free
 *   qty 3 → 1 free
 *   qty 4 → 2 free
 *
 * - Adds free items (with correct quantity) when earned
 * - Removes or re-adds free items when quantity changes
 * - Removes orphaned free items when paid item is removed
 */
export async function syncBogoPromo(
  cart: Cart,
  tokens: CartTokens
): Promise<{ cart: Cart; tokens: CartTokens }> {
  let currentCart = cart;
  let currentTokens = tokens;

  try {
    const paidItems = currentCart.items.filter(isPaidBogoItem);
    const freeItems = currentCart.items.filter(isFreeBogoItem);

    // Build a map of product_id -> free item for quick lookup
    const freeByProductId = new Map<number, CartItem>();
    for (const item of freeItems) {
      freeByProductId.set(item.id, item);
    }

    // Build a map of product_id -> paid quantity
    const paidQtyById = new Map<number, number>();
    for (const item of paidItems) {
      paidQtyById.set(item.id, (paidQtyById.get(item.id) ?? 0) + item.quantity);
    }

    // Remove orphaned or excess free items
    for (const [pid, freeItem] of freeByProductId) {
      const paidQty = paidQtyById.get(pid) ?? 0;
      const earnedFreeQty = Math.floor(paidQty / 2);
      // Remove if no free items earned, or quantity mismatch (will re-add below)
      if (earnedFreeQty === 0 || freeItem.quantity !== earnedFreeQty) {
        try {
          const result = await removeCartItem(currentTokens, freeItem.key);
          currentCart = result.data as Cart;
          currentTokens = result.tokens;
          freeByProductId.delete(pid);
        } catch (err) {
          if (err instanceof StoreApiError) {
            console.warn("[bogoPromo] failed to remove free item:", err.message);
          }
        }
      }
    }

    // Add free items where earned and not already present (with correct qty)
    for (const [pid, paidQty] of paidQtyById) {
      const earnedFreeQty = Math.floor(paidQty / 2);
      if (earnedFreeQty === 0) continue;
      if (freeByProductId.has(pid)) continue; // already correct (wasn't removed above)

      try {
        const result = await addCartItem(currentTokens, pid, earnedFreeQty);
        currentCart = result.data as Cart;
        currentTokens = result.tokens;
        // PHP hook (woocommerce_before_calculate_totals) zeros the price on the WP side.
      } catch (err) {
        if (err instanceof StoreApiError) {
          console.warn("[bogoPromo] failed to add free item for product", pid, ":", err.message);
        }
      }
    }

    // Refresh cart to get accurate totals after mutations
    const refreshed = await getCart(currentTokens);
    return { cart: refreshed.data as Cart, tokens: refreshed.tokens };
  } catch (err) {
    console.warn("[bogoPromo] sync error:", err);
    return { cart: currentCart, tokens: currentTokens };
  }
}
