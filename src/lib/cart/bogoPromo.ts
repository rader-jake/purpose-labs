import "server-only";
import { applyCoupon, removeCoupon, getCart, StoreApiError } from "./storeApi";
import type { CartTokens } from "./storeApi";
import type { Cart } from "./types";

/**
 * Product IDs excluded from B2G1:
 * - 94: Recon Water (bac water)
 * - 837, 840, 842, 846, 848: bundles
 * - 801, 806: spray products
 */
const B2G1_EXCLUDED_IDS = new Set([94, 837, 840, 842, 846, 848, 801, 806]);

const B2G1_COUPON = "pl-auto-b2g1";

/**
 * Buy 2 Get 1 Free — coupon-based.
 *
 * Applies a 33.33% discount coupon when the cart contains any qualifying
 * product with qty >= 2. Removes it when no qualifying product has qty >= 2.
 *
 * The 33.33% discount on a 3-unit order = 1 unit free (effective price of 2 units for 3).
 */
export async function syncBogoPromo(
  cart: Cart,
  tokens: CartTokens
): Promise<{ cart: Cart; tokens: CartTokens }> {
  const hasQualifying = cart.items.some(
    (item) => !B2G1_EXCLUDED_IDS.has(item.id) && item.quantity >= 2
  );

  const alreadyApplied = cart.coupons.some((c) => c.code === B2G1_COUPON);

  try {
    if (hasQualifying && !alreadyApplied) {
      const result = await applyCoupon(tokens, B2G1_COUPON);
      return { cart: result.data as Cart, tokens: result.tokens };
    }
    if (!hasQualifying && alreadyApplied) {
      const result = await removeCoupon(tokens, B2G1_COUPON);
      return { cart: result.data as Cart, tokens: result.tokens };
    }
  } catch (err) {
    if (err instanceof StoreApiError) {
      console.warn("[bogoPromo] coupon sync skipped:", err.message);
    }
    try {
      const refreshed = await getCart(tokens);
      return { cart: refreshed.data as Cart, tokens: refreshed.tokens };
    } catch {
      // ignore
    }
  }

  return { cart, tokens };
}
