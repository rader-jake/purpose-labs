"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { PaymentStepProps } from "@/lib/payment/types";
import { formatMoney } from "@/lib/cart/money";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const ATTESTATION_STATEMENTS = [
  "I confirm I am at least 21 years of age.",
  "I confirm these products are for research use only (RUO), not for human or animal consumption.",
  "I confirm I am an experienced researcher qualified to handle these materials.",
  "I confirm this is a business-to-business transaction between research entities.",
  "I confirm lawful receipt of these materials is permitted in my jurisdiction.",
];

const BUYER_TYPE_OPTIONS = [
  { value: "laboratory", label: "Laboratory" },
  { value: "academic", label: "Academic institution" },
  { value: "business", label: "Business" },
  { value: "other_organization", label: "Other" },
];

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  color: "var(--pl-navy)",
  marginBottom: "4px",
  fontFamily: "var(--pl-font-body)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "6px",
  border: "1px solid var(--pl-border)",
  backgroundColor: "#fff",
  color: "var(--pl-navy)",
  fontFamily: "var(--pl-font-body)",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

function CheckoutForm({ amountCents, onSuccess, onError }: PaymentStepProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [buyerType, setBuyerType] = useState("");
  const [attested, setAttested] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!buyerType) errs.buyerType = "Please select a purchaser type.";
    if (!attested) errs.attest = "You must confirm the attestation statements.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});
    setIsProcessing(true);
    setErrorMsg(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation`,
      },
      redirect: "if_required",
    });

    if (error) {
      const msg = error.message ?? "Payment failed. Please try again.";
      setErrorMsg(msg);
      onError({ message: msg });
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess({ transactionId: paymentIntent.id });
    } else {
      setIsProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Purchaser type */}
      <div>
        <label style={labelStyle}>Purchaser type *</label>
        <select
          value={buyerType}
          onChange={(e) => setBuyerType(e.target.value)}
          style={{ ...inputStyle, appearance: "auto" }}
        >
          <option value="" disabled>Choose one…</option>
          {BUYER_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {formErrors.buyerType && <p className="text-xs text-red-600 mt-1">{formErrors.buyerType}</p>}
      </div>

      <PaymentElement />

      {/* Attestation */}
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={attested}
          onChange={(e) => setAttested(e.target.checked)}
          className="mt-1"
        />
        <span className="flex flex-col gap-1 text-xs leading-relaxed" style={{ color: "var(--pl-text-secondary)", fontFamily: "var(--pl-font-body)" }}>
          <span className="font-medium" style={{ color: "var(--pl-navy)" }}>By checking this box, I confirm all of the following:</span>
          {ATTESTATION_STATEMENTS.map((s, i) => <span key={i}>&bull; {s}</span>)}
        </span>
      </label>
      {formErrors.attest && <p className="text-xs text-red-600 mt-[-8px]">{formErrors.attest}</p>}

      {errorMsg && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full rounded-full px-6 py-4 text-xs font-semibold uppercase tracking-[0.1em] transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: "var(--pl-navy)",
          color: "var(--pl-ivory)",
          fontFamily: "var(--pl-font-body)",
        }}
      >
        {isProcessing ? "Processing…" : `Pay ${formatMoney(amountCents)}`}
      </button>
    </form>
  );
}

export function StripePaymentStep(props: PaymentStepProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/checkout/stripe-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amountCents: props.amountCents,
        currencyCode: props.currencyCode,
      }),
    })
      .then((r) => r.json())
      .then((data: { clientSecret?: string; message?: string }) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setFetchError(data.message ?? "Could not initialize payment.");
        }
      })
      .catch(() => setFetchError("Could not initialize payment. Please refresh."));
  }, [props.amountCents, props.currencyCode]);

  if (fetchError) {
    return (
      <div className="rounded-lg border p-6" style={{ borderColor: "var(--pl-border)" }}>
        <p className="text-sm text-red-600">{fetchError}</p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="rounded-lg border p-6 text-center" style={{ borderColor: "var(--pl-border)" }}>
        <p className="text-sm" style={{ color: "var(--pl-muted)" }}>Loading payment…</p>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#1B2A4A",
            borderRadius: "8px",
            fontFamily: "Montserrat, sans-serif",
          },
        },
      }}
    >
      <CheckoutForm {...props} />
    </Elements>
  );
}
