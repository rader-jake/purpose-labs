"use client";

// src/components/BulkDiscountTiers.tsx
//
// Mirrors the real WooCommerce bulk-discount logic (pl_get_bulk_discount_tiers
// in the PHP backend) — 3-6 units 3%, 7-12 units 5%, 13+ units 8%. If those
// numbers ever change on the WordPress side, update here too — this is the
// same "duplicated business logic, must stay manually synced" situation as
// the free-shipping threshold in the cart, flagged for the same reason.
//
// Verified against the live Store API (not assumed): a 3-unit cart produced
// a -3% fee, 7 units produced -5%, and both 14 and 15 units produced -8%,
// confirmed via the cart's own `fees` array in an earlier phase. These three
// numbers match that observed behavior exactly.

const TIERS = [
  { label: "3–6 Units", minQty: 3, discountPct: 3 },
  { label: "7–12 Units", minQty: 7, discountPct: 5, bestValue: true },
  { label: "13+ Units", minQty: 13, discountPct: 8 },
];

export function BulkDiscountTiers({
  onSelectQuantity,
}: {
  onSelectQuantity: (qty: number) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {TIERS.map((tier) => (
        <button
          key={tier.label}
          onClick={() => onSelectQuantity(tier.minQty)}
          className="relative rounded-lg border px-3 py-3 text-center transition-colors duration-200 hover:border-current"
          style={{
            borderColor: "rgba(255, 255, 255, 0.25)",
            color: "var(--pl-ivory)",
          }}
        >
          {tier.bestValue && (
            <span
              className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em]"
              style={{
                backgroundColor: "var(--pl-ivory)",
                color: "var(--pl-navy)",
              }}
            >
              Best Value
            </span>
          )}
          <p className="text-xs font-medium">{tier.label}</p>
          <p className="text-xs opacity-70">{tier.discountPct}% off</p>
        </button>
      ))}
    </div>
  );
}
