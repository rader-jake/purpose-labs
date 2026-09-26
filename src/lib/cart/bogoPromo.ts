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
 * After every cart mutation, ensure each qualifying paid item
 * has exactly one free duplicate in the cart.
 *
 * - Adds free items for paid items that don't have one
 * - Removes orphaned free items whose paid counterpart is gone
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

    // Remove orphaned free items (product not in paid items anymore)
    const paidProductIds = new Set(paidItems.map((i) => i.id));
    for (const [pid, freeItem] of freeByProductId) {
      if (!paidProductIds.has(pid)) {
        try {
          const result = await removeCartItem(currentTokens, freeItem.key);
          currentCart = result.data as Cart;
          currentTokens = result.tokens;
          freeByProductId.delete(pid);
        } catch (err) {
          if (err instanceof StoreApiError) {
            console.warn("[bogoPromo] failed to remove orphaned free item:", err.message);
          }
        }
      }
    }

    // Add free items for paid items that don't have one
    for (const paidItem of paidItems) {
      if (!freeByProductId.has(paidItem.id)) {
        try {
          const result = await addCartItem(currentTokens, paidItem.id, paidItem.quantity);
          currentCart = result.data as Cart;
          currentTokens = result.tokens;
          // The PHP snippet on WP side will mark it as pl_free and zero the price.
          // If PHP hook fires, we're done. If not (Store API bypass), the item
          // will be added at full price — we can't zero it client-side here.
          // The PHP snippet handles zeroing via woocommerce_before_calculate_totals.
        } catch (err) {
          if (err instanceof StoreApiError) {
            console.warn("[bogoPromo] failed to add free item for product", paidItem.id, ":", err.message);
          }
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
