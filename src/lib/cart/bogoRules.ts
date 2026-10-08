import { BOGO_PRODUCT_IDS, BOGO_PRODUCTS, getBogoGroup, type BogoProduct } from "./bogoProducts";
import type { CartCoupon, CartItem } from "./types";

// Single source of truth for BOGO entitlement. Pure — used by the server
// (to validate claims and prune unearned ones after every cart mutation)
// and by the drawer (to decide what to offer), so the two cannot disagree.
//
// Model: every eligible unit in the cart is either paid or a claimed free
// pick, and a claim is only valid while it is backed by a paid unit of the
// same or higher tier. Free picks are claimed as `pl-bogo-<productId>-<ts>`
// coupons; newer claims are dropped first when the cart no longer supports
// them.

export interface BogoCartLike {
  items: Pick<CartItem, "id" | "quantity">[];
  coupons: Pick<CartCoupon, "code">[];
}

export const BOGO_COUPON_PREFIX = "pl-bogo-";

// Coupons that gift one GHK-Cu 50mg (see CartContext). That unit is not
// paid-backed, so it must not count toward — or be rejected by — BOGO.
const GIFT_COUPON_CODES = new Set(["rpep", "freeghk"]);
export const GIFT_PRODUCT_ID = 831;

export interface BogoClaim {
  code: string;
  productId: number;
  ts: number;
}

export type BogoRejectionReason = "missing" | "unbacked" | "tier";

export interface BogoPlan {
  accepted: BogoClaim[];
  rejected: { claim: BogoClaim; reason: BogoRejectionReason }[];
  /** Eligible units in the cart, excluding the gifted unit. */
  eligibleUnits: number;
  /** Accepted claims that are backed by a paid unit (excludes the gift). */
  paidBackedClaims: number;
}

export function parseBogoClaim(code: string): BogoClaim | null {
  const match = /^pl-bogo-(\d+)-(\d+)$/.exec(code);
  return match ? { code, productId: Number(match[1]), ts: Number(match[2]) } : null;
}

export function getBogoClaims(cart: Pick<BogoCartLike, "coupons">): BogoClaim[] {
  return cart.coupons
    .map((coupon) => parseBogoClaim(coupon.code))
    .filter((claim): claim is BogoClaim => claim !== null)
    .sort((a, b) => a.ts - b.ts);
}

export function planBogoClaims(cart: BogoCartLike): BogoPlan {
  const heldUnits = new Map<number, number>();
  for (const item of cart.items) {
    if (!BOGO_PRODUCT_IDS.has(item.id)) continue;
    heldUnits.set(item.id, (heldUnits.get(item.id) ?? 0) + item.quantity);
  }
  const totalHeld = [...heldUnits.values()].reduce((sum, n) => sum + n, 0);

  let giftAvailable = cart.coupons.some((c) => GIFT_COUPON_CODES.has(c.code.toLowerCase()));
  let giftUnits = 0;
  let paidBackedClaims = 0;
  const claimedUnits = new Map<number, number>();
  const accepted: BogoClaim[] = [];
  const rejected: BogoPlan["rejected"] = [];

  for (const claim of getBogoClaims(cart)) {
    const productId = claim.productId;
    const alreadyClaimed = claimedUnits.get(productId) ?? 0;

    if ((heldUnits.get(productId) ?? 0) - alreadyClaimed < 1) {
      rejected.push({ claim, reason: "missing" });
      continue;
    }

    if (productId === GIFT_PRODUCT_ID && giftAvailable) {
      giftAvailable = false;
      giftUnits += 1;
      claimedUnits.set(productId, alreadyClaimed + 1);
      accepted.push(claim);
      continue;
    }

    const claimsIfAccepted = paidBackedClaims + 1;
    if (totalHeld - giftUnits - claimsIfAccepted < claimsIfAccepted) {
      rejected.push({ claim, reason: "unbacked" });
      continue;
    }

    claimedUnits.set(productId, alreadyClaimed + 1);
    let highestPaidTier = 0;
    for (const [id, held] of heldUnits) {
      if (held - (claimedUnits.get(id) ?? 0) > 0) {
        highestPaidTier = Math.max(highestPaidTier, getBogoGroup(id) ?? 0);
      }
    }
    if ((getBogoGroup(productId) ?? 0) > highestPaidTier) {
      claimedUnits.set(productId, alreadyClaimed);
      rejected.push({ claim, reason: "tier" });
      continue;
    }

    paidBackedClaims = claimsIfAccepted;
    accepted.push(claim);
  }

  return { accepted, rejected, eligibleUnits: totalHeld - giftUnits, paidBackedClaims };
}

export type BogoClaimCheck = { ok: true } | { ok: false; reason: string };

const REJECTION_MESSAGES: Record<BogoRejectionReason, string> = {
  missing: "That free vial isn't available right now.",
  unbacked: "Add a qualifying paid item to unlock a free vial.",
  tier: "A free vial must be the same tier or lower than a paid item in your cart.",
};

/** Would claiming a free unit of `productId` be valid for this cart right now? */
export function canClaimBogo(cart: BogoCartLike, productId: number): BogoClaimCheck {
  if (!BOGO_PRODUCT_IDS.has(productId)) {
    return { ok: false, reason: "That product isn't part of the BOGO offer." };
  }

  const probeCode = `${BOGO_COUPON_PREFIX}${productId}-${Number.MAX_SAFE_INTEGER}`;
  const hasLine = cart.items.some((item) => item.id === productId);
  const items = hasLine
    ? cart.items.map((item) => (item.id === productId ? { ...item, quantity: item.quantity + 1 } : item))
    : [...cart.items, { id: productId, quantity: 1 }];

  const plan = planBogoClaims({ items, coupons: [...cart.coupons, { code: probeCode }] });
  const verdict = plan.rejected.find((r) => r.claim.code === probeCode);
  return verdict ? { ok: false, reason: REJECTION_MESSAGES[verdict.reason] } : { ok: true };
}

export interface BogoOffer {
  remaining: number;
  eligibleProducts: BogoProduct[];
}

export function getBogoOffer(cart: BogoCartLike): BogoOffer {
  const eligibleProducts = BOGO_PRODUCTS.filter((product) => canClaimBogo(cart, product.id).ok);
  if (eligibleProducts.length === 0) return { remaining: 0, eligibleProducts };

  const plan = planBogoClaims(cart);
  // Units in the cart that aren't free picks are paid; each paid unit earns
  // one pick, and picks already claimed are in the cart as units too.
  const remaining = Math.max(0, plan.eligibleUnits - 2 * plan.paidBackedClaims);
  return { remaining, eligibleProducts: remaining > 0 ? eligibleProducts : [] };
}
