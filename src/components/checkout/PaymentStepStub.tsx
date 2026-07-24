"use client";

import { useState } from "react";
import type { PaymentStepProps } from "@/lib/payment/types";
import { formatMoney } from "@/lib/cart/money";

/**
 * Placeholder payment step. Tagada Pay isn't live yet, and the site's
 * current gateway (ByteNFT/Cash App) is being retired — so this
 * deliberately implements neither. It satisfies PaymentStepProps so a real
 * adapter (e.g. TagadaPaymentStep) can be dropped in at the call site in
 * checkout/page.tsx later without touching the rest of the flow.
 *
 * The "simulate" button exists only so the cart → review → confirmation
 * flow can be tested end to end before a real processor exists. Remove it
 * when wiring in the real adapter.
 */
export function PaymentStepStub({ amountCents, onSuccess }: PaymentStepProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  function handleMockPayment() {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess({ transactionId: `mock_${Date.now()}` });
    }, 600);
  }

  return (
    <div
      className="flex flex-col gap-4 rounded-lg border p-6"
      style={{ borderColor: "var(--pl-border)", backgroundColor: "var(--pl-ivory-soft)" }}
    >
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "var(--pl-muted)" }} />
        <p
          className="text-xs font-semibold uppercase tracking-[0.08em]"
          style={{ color: "var(--pl-muted)", fontFamily: "var(--pl-font-body)" }}
        >
          Payment integration pending
        </p>
      </div>

      <p
        className="text-sm leading-relaxed"
        style={{ color: "var(--pl-text-secondary)", fontFamily: "var(--pl-font-body)" }}
      >
        Tagada Pay isn&rsquo;t connected yet. This step is a placeholder so
        the rest of checkout can be built and tested end to end.
      </p>

      <button
        disabled
        className="w-full cursor-not-allowed rounded-full px-6 py-4 text-xs font-semibold uppercase tracking-[0.1em] opacity-50"
        style={{
          backgroundColor: "var(--pl-navy)",
          color: "var(--pl-ivory)",
          fontFamily: "var(--pl-font-body)",
        }}
      >
        Pay {formatMoney(amountCents)}
      </button>

      <button
        onClick={handleMockPayment}
        disabled={isProcessing}
        className="w-full rounded-full border px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          borderColor: "var(--pl-border)",
          color: "var(--pl-slate)",
          fontFamily: "var(--pl-font-body)",
        }}
      >
        {isProcessing ? "Simulating…" : "Simulate successful payment (testing only)"}
      </button>
    </div>
  );
}
