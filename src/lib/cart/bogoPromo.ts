import "server-only";
import { addCartItem, applyCoupon, removeCartItem, getCart, StoreApiError } from "./storeApi";
import type { CartTokens } from "./storeApi";
import type { Cart, CartItem } from "./types";

const WC_BASE = "https://joshuar120.sg-host.com/wp-json/wc/v3";
const WC_AUTH = "Basic " + Buffer.from("Info@purposelabs.shop:KH5x vzQv rq6Y 9ccl peq7 NbCs").toString("base64");

async function createBogoFreeCoupon(productId: number): Promise<string> {
  const couponCode = `pl-bogo-${productId}-${Date.now()}`;
  const res = await fetch(`${WC_BASE}/coupons`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: WC_AUTH },
    body: JSON.stringify({
      code: couponCode,
      discount_type: "percent",
      amount: "100",
      product_ids: [productId],
      usage_limit: 1,
      usage_limit_per_user: 1,
      limit_usage_to_x_items: 1,
      individual_use: false,
    }),
  });
  if (!res.ok) throw new Error("Failed to create BOGO coupon");
  const data = await res.json() as { code: string };
  return data.code;
}

/**
 * Product IDs excluded from BOGO:
 * - 94: Recon Water (bac water)
 * - 837, 840, 842, 846, 848: bundles
 */
const BOGO_EXCLUDED_IDS = new Set([94, 837, 840, 842, 846, 848]);

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
          // Create a real 100% coupon restricted to this product (1 item max).
          // This is the authoritative free-item mechanism — WC knows it's free via coupon,
          // and snippet 350 skips pl-bogo-* coupons from percent discount calculations.
          const bogoCoupon = await createBogoFreeCoupon(paidItem.id);
          const { tokens: afterAddTokens } = await addCartItem(currentTokens, paidItem.id, 1);
          currentTokens = afterAddTokens;
          const { data: afterCouponData, tokens: afterCouponTokens } = await applyCoupon(currentTokens, bogoCoupon);
          currentCart = afterCouponData as Cart;
          currentTokens = afterCouponTokens;
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
