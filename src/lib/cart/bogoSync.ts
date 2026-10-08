import "server-only";
import { removeCartItem, removeCoupon, updateCartItem } from "./storeApi";
import type { CartTokens } from "./storeApi";
import { planBogoClaims } from "./bogoRules";
import { syncBacWaterPromo } from "./bacWaterPromo";
import type { Cart } from "./types";

interface SyncOptions {
  /**
   * Product whose line the customer just changed. If that line's own free
   * pick is no longer backed, drop the claim but keep the unit the customer
   * deliberately left in the cart (it simply becomes a normal paid unit).
   */
  changedProductId?: number;
}

// Removing one unearned pick can expose another (units of a pick are also
// counted as "held"), so re-plan until the cart is stable.
const MAX_PASSES = 6;

/**
 * Removes every free-pick claim the cart no longer supports — the coupon and
 * the free unit itself — so a free item can never outlive its qualifying
 * purchase. Safe to call on any cart; does nothing when every claim is valid.
 */
export async function syncBogoClaims(
  cart: Cart,
  tokens: CartTokens,
  options: SyncOptions = {}
): Promise<{ cart: Cart; tokens: CartTokens }> {
  let current = cart;
  let currentTokens = tokens;

  for (let pass = 0; pass < MAX_PASSES; pass++) {
    const { rejected } = planBogoClaims(current);
    if (rejected.length === 0) break;

    for (const { claim, reason } of rejected) {
      try {
        const result = await removeCoupon(currentTokens, claim.code);
        current = result.data as Cart;
        currentTokens = result.tokens;
      } catch (err) {
        console.warn("[bogoSync] failed to remove claim coupon", claim.code, err);
        return { cart: current, tokens: currentTokens };
      }

      // "missing" = the unit is already gone, and any unit still in the cart
      // belongs to another valid claim or to a paid purchase.
      if (reason === "missing" || claim.productId === options.changedProductId) continue;

      const line = current.items.find((item) => item.id === claim.productId);
      if (!line) continue;
      try {
        const result =
          line.quantity > 1
            ? await updateCartItem(currentTokens, line.key, line.quantity - 1)
            : await removeCartItem(currentTokens, line.key);
        current = result.data as Cart;
        currentTokens = result.tokens;
      } catch (err) {
        console.warn("[bogoSync] failed to remove unearned free item", claim.productId, err);
        return { cart: current, tokens: currentTokens };
      }
    }
  }

  return { cart: current, tokens: currentTokens };
}

/**
 * Run after every cart mutation: prune unearned BOGO picks first (they change
 * what counts as a qualifying item), then reconcile the free bac water coupon.
 */
export async function finalizeCart(
  cart: Cart,
  tokens: CartTokens,
  options: SyncOptions = {}
): Promise<{ cart: Cart; tokens: CartTokens }> {
  const afterBogo = await syncBogoClaims(cart, tokens, options);
  return syncBacWaterPromo(afterBogo.cart, afterBogo.tokens);
}
