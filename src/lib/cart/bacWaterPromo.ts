import "server-only";
import { addCartItem, applyCoupon, removeCoupon, removeCartItem, getCart, StoreApiError } from "./storeApi";
import type { CartTokens } from "./storeApi";
import type { Cart } from "./types";

// Product IDs that do NOT qualify for free recon solution
const BAC_WATER_ID = 94;
// Excluded: bac water itself, sprays, spray bundle
// NOTE: BOGO-free items (_pl_sibogo_free) still qualify — the customer DID buy a vial.
const EXCLUDED_IDS = new Set([94, 801, 806, 840]);
const PROMO_COUPON = "pl-auto-bacwater";

/**
 * After every cart mutation:
 * 1. Auto-add 1 free bac water (product 94) when qualifying items are present
 * 2. Auto-remove it when no qualifying items remain
 * 3. Apply/remove the pl-auto-bacwater coupon to make it free
 *
 * "Qualifying" = any product that isn't recon solution itself or the spray products/bundle.
 * The coupon limits discount to 1 item, so only the auto-added unit is free.
 * Customer can hit + on the FREE row to add paid extras (handled by CartDrawer).
 */
export async function syncBacWaterPromo(
  cart: Cart,
  tokens: CartTokens
): Promise<{ cart: Cart; tokens: CartTokens }> {
  // Count only PAID bac water items (qty > 0, not filtered by flag since Store API doesn't expose pl_free_bac)
  // We manage exactly 1 auto-added bac water item. Any bac water already in cart counts.
  const hasQualifyingItem = cart.items.some(
    (item) => !EXCLUDED_IDS.has(item.id)
  );

  const bacWaterItem = cart.items.find((item) => item.id === BAC_WATER_ID);
  const promoAlreadyApplied = cart.coupons.some((c) => c.code === PROMO_COUPON);

  let current = cart;
  let currentTokens = tokens;

  try {
    if (hasQualifyingItem) {
      // Auto-add bac water if not already in cart
      if (!bacWaterItem) {
        const result = await addCartItem(currentTokens, BAC_WATER_ID, 1);
        current = result.data as Cart;
        currentTokens = result.tokens;
      }
      // Apply coupon if not already applied
      if (!promoAlreadyApplied) {
        const result = await applyCoupon(currentTokens, PROMO_COUPON);
        current = result.data as Cart;
        currentTokens = result.tokens;
      }
    } else {
      // No qualifying items — remove coupon first, then remove bac water
      if (promoAlreadyApplied) {
        const result = await removeCoupon(currentTokens, PROMO_COUPON);
        current = result.data as Cart;
        currentTokens = result.tokens;
      }
      if (bacWaterItem) {
        const result = await removeCartItem(currentTokens, bacWaterItem.key);
        current = result.data as Cart;
        currentTokens = result.tokens;
      }
    }
  } catch (err) {
    if (err instanceof StoreApiError) {
      console.warn("[bacWaterPromo] sync skipped:", err.message);
    }
    try {
      const refreshed = await getCart(currentTokens);
      return { cart: refreshed.data as Cart, tokens: refreshed.tokens };
    } catch {
      // ignore
    }
  }

  return { cart: current, tokens: currentTokens };
}
