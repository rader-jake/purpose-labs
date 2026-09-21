/**
 * Affiliate ID → WooCommerce coupon code mapping.
 * Add new affiliates here as they join.
 * Key = Affiliatly affiliate ID (from ?aff= URL param)
 * Value = their WooCommerce coupon code
 */
export const AFFILIATE_COUPON_MAP: Record<string, string> = {
  "78": "odalys",
  // Add more: "123": "couponcode",
};

export function getCouponForAffiliate(affId: string | null | undefined): string | null {
  if (!affId) return null;
  return AFFILIATE_COUPON_MAP[affId] ?? null;
}
