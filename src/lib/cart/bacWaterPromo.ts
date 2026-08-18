import "server-only";
import { applyCoupon, removeCoupon, getCart, StoreApiError } from "./storeApi";
import type { CartTokens } from "./storeApi";
import type { Cart } from "./types";

// Product IDs that do NOT qualify for free bac water
const BAC_WATER_ID = 94;
const EXCLUDED_IDS = new Set([94, 801, 806, 840]);
const PROMO_COUPON = "pl-auto-bacwater";

/**
 * After every cart mutation, silently ensure the pl-auto-bacwater coupon
 * is applied if the cart contains qualifying products, and removed if not.
 *
 * "Qualifying" = any product that isn't bac water itself, the spray products,
 * or the spray bundle (IDs 94, 801, 806, 840).
 *
 * Returns the updated cart (post-coupon) and final tokens.
 */
export async function syncBacWaterPromo(
  cart: Cart,
  tokens: CartTokens
): Promise<{ cart: Cart; tokens: CartTokens }> {
  const hasQualifyingItem = cart.items.some(
    (item) => item.id !== BAC_WATER_ID && !EXCLUDED_IDS.has(item.id)
  );

  const promoAlreadyApplied = cart.coupons.some((c) => c.code === PROMO_COUPON);

  try {
    if (hasQualifyingItem && !promoAlreadyApplied) {
      const result = await applyCoupon(tokens, PROMO_COUPON);
      return { cart: result.data as Cart, tokens: result.tokens };
    }
    if (!hasQualifyingItem && promoAlreadyApplied) {
      const result = await removeCoupon(tokens, PROMO_COUPON);
      return { cart: result.data as Cart, tokens: result.tokens };
    }
  } catch (err) {
    // Non-fatal — if the coupon doesn't apply (e.g. already applied, expired),
    // just log and continue. Never surface this error to the customer.
    if (err instanceof StoreApiError) {
      console.warn("[bacWaterPromo] coupon sync skipped:", err.message);
    }
    // Refresh cart to get accurate state after any partial change
    try {
      const refreshed = await getCart(tokens);
      return { cart: refreshed.data as Cart, tokens: refreshed.tokens };
    } catch {
      // ignore
    }
  }

  return { cart, tokens };
}
