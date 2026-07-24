// src/components/PaymentIcons.tsx
//
// PLACEHOLDER — plain text labels, not real Visa/Mastercard/Amex/Discover
// logos. Those are trademarked brand assets; don't hand-recreate them.
// Before shipping, swap this for a proper icon set (e.g. the "payment-icons"
// or "react-payment-icons" npm packages) or official brand SVGs pulled
// directly from each card network's own brand resource page.

const METHODS = ["VISA", "MASTERCARD", "AMEX", "DISCOVER"];

export function PaymentIcons() {
  return (
    <div className="flex flex-wrap gap-2">
      {METHODS.map((method) => (
        <span
          key={method}
          className="rounded border px-2.5 py-1 text-[9px] font-semibold tracking-[0.04em]"
          style={{
            borderColor: "rgba(255, 255, 255, 0.25)",
            color: "var(--pl-ivory)",
          }}
        >
          {method}
        </span>
      ))}
    </div>
  );
}
