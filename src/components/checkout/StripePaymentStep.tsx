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

function CheckoutForm({ amountCents, onSuccess, onError }: PaymentStepProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

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
      <PaymentElement />

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
