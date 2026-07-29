"use client";

import { useState } from "react";
import type { AddressInput } from "@/lib/cart/types";
import type { PaymentStepProps } from "@/lib/payment/types";

export interface TagadaPaymentStepProps extends PaymentStepProps {
  billingAddress: AddressInput;
  shippingAddress: AddressInput;
}

/**
 * Real Tagada integration. Submits the actual WooCommerce order (POST
 * /wc/store/v1/checkout via our /api/checkout proxy, payment_method:
 * "tagada") and redirects the browser to Tagada's hosted payment page at
 * the response's payment_result.redirect_url — verified directly against
 * the live site that this creates a real "pending" order before any
 * payment happens.
 *
 * There's no real onSuccess path here: a successful submission ends in a
 * full-page navigation away from this component, before payment is even
 * attempted, so onSuccess (required by PaymentStepProps) is accepted but
 * never called. Only onError fires, for a failed checkout submission.
 *
 * Button reads "Continue to Payment" rather than the amount — checkout is
 * now a single consolidated page with the order total always visible in
 * its own summary section just above this, so repeating it here would be
 * redundant. amountCents is still accepted (required by PaymentStepProps,
 * shared with PaymentStepStub) even though this component doesn't display
 * it.
 */
export function TagadaPaymentStep({
  billingAddress,
  shippingAddress,
  onError,
}: TagadaPaymentStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handlePay() {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing_address: billingAddress,
          shipping_address: shippingAddress,
          payment_method: "tagada",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof data?.message === "string" ? data.message : "Checkout failed. Please try again."
        );
      }
      const redirectUrl = data?.payment_result?.redirect_url;
      if (typeof redirectUrl !== "string" || !redirectUrl) {
        throw new Error("Payment could not be started. Please try again.");
      }
      window.location.assign(redirectUrl);
    } catch (err) {
      setIsSubmitting(false);
      onError({ message: err instanceof Error ? err.message : "Checkout failed. Please try again." });
    }
  }

  return (
    <div
      className="flex flex-col gap-4 rounded-lg border p-6"
      style={{ borderColor: "var(--pl-border)", backgroundColor: "var(--pl-ivory-soft)" }}
    >
      <p
        className="text-sm leading-relaxed"
        style={{ color: "var(--pl-text-secondary)", fontFamily: "var(--pl-font-body)" }}
      >
        You&rsquo;ll be redirected to our secure payment page to complete your order.
      </p>

      <button
        onClick={handlePay}
        disabled={isSubmitting}
        className="w-full rounded-full px-6 py-4 text-xs font-semibold uppercase tracking-[0.1em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          backgroundColor: "var(--pl-navy)",
          color: "var(--pl-ivory)",
          fontFamily: "var(--pl-font-body)",
        }}
      >
        {isSubmitting ? "Redirecting…" : "Continue to Payment"}
      </button>
    </div>
  );
}
