"use client";

import { useMemo, useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import type { AddressInput } from "@/lib/cart/types";
import type { PaymentStepProps } from "@/lib/payment/types";

export interface BeaconPaymentStepProps extends PaymentStepProps {
  billingAddress: AddressInput;
  shippingAddress: AddressInput;
}

const ATTESTATION_STATEMENTS = [
  "I confirm I am at least 21 years of age.",
  "I confirm these products are for research use only (RUO), not for human or animal consumption.",
  "I confirm I am an experienced researcher qualified to handle these materials.",
  "I confirm this is a business-to-business transaction between research entities.",
  "I confirm lawful receipt of these materials is permitted in my jurisdiction.",
];

const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      fontFamily: "var(--pl-font-body), sans-serif",
      color: "var(--pl-navy)",
      "::placeholder": { color: "var(--pl-muted)" },
    },
  },
};

/**
 * Real Beacon Stripe Checkout integration — confirmed via live testing to
 * be an embedded Stripe Elements/PaymentIntent flow (not a redirect_url
 * pattern like Tagada). Two things are confirmed NOT working yet, reported
 * here rather than silently worked around:
 *
 * 1. POST beacon-checkout/v1/payment-intent (proxied via
 *    /api/checkout/beacon-intent) fails with beacon_sc_bad_nonce
 *    regardless of how the Store API Cart-Token/Nonce pair or the admin
 *    gateway api_key are forwarded — see src/lib/cart/beaconApi.ts for the
 *    full list of what was tried. This blocks step 1 of the submit flow
 *    below (PaymentIntent creation) from ever succeeding as currently
 *    built.
 * 2. No Stripe publishable key exists anywhere in the discoverable Beacon
 *    gateway config (only Beacon's own secret api_key/callback_secret,
 *    both explicitly password-typed). NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
 *    must be supplied once one is obtained — until then this component
 *    can't initialize Stripe.js at all, and renders a clear "not
 *    configured" state instead of crashing.
 */
export function BeaconPaymentStep(props: BeaconPaymentStepProps) {
  const stripePromise = useMemo<Promise<Stripe | null> | null>(() => {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) return null;
    // Beacon confirmed payment-intent creates the PaymentIntent under their
    // connected account, not the platform account the publishable key's own
    // dashboard belongs to — Stripe scopes PaymentIntent lookups per
    // account, so confirming one created on a connected account requires
    // the matching stripeAccount here (Stripe Connect "direct charge"
    // pattern), or the confirm call 404s with "No such payment_intent".
    return loadStripe(publishableKey, { stripeAccount: "acct_1U2yBlPzodzW27XV" });
  }, []);

  if (!stripePromise) {
    return (
      <div
        className="flex flex-col gap-2 rounded-lg border p-6"
        style={{ borderColor: "var(--pl-border)", backgroundColor: "var(--pl-ivory-soft)" }}
      >
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--pl-text-secondary)", fontFamily: "var(--pl-font-body)" }}
        >
          Card payment isn&rsquo;t configured yet (missing Stripe publishable key). Please contact support to
          complete your order.
        </p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <BeaconPaymentForm {...props} />
    </Elements>
  );
}

function BeaconPaymentForm({
  amountCents,
  currencyCode,
  billingAddress,
  shippingAddress,
  onSuccess,
  onError,
}: BeaconPaymentStepProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [attested, setAttested] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handlePay() {
    if (!stripe || !elements) return;
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setIsSubmitting(true);
    try {
      const cartToken = typeof localStorage !== "undefined" ? localStorage.getItem("wc/cartToken") : null;
      const intentResponse = await fetch("/api/checkout/beacon-intent", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents, currencyCode, cart_token: cartToken }),
      });
      const intentData = await intentResponse.json();
      if (!intentResponse.ok) {
        throw new Error(
          typeof intentData?.message === "string" ? intentData.message : "Could not start payment. Please try again."
        );
      }
      const clientSecret = intentData?.client_secret;
      if (typeof clientSecret !== "string" || !clientSecret) {
        throw new Error("Payment could not be started. Please try again.");
      }

      const confirmResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${billingAddress.first_name} ${billingAddress.last_name}`.trim(),
            email: billingAddress.email,
            address: {
              line1: billingAddress.address_1,
              line2: billingAddress.address_2 || undefined,
              city: billingAddress.city,
              state: billingAddress.state,
              postal_code: billingAddress.postcode,
              country: billingAddress.country || "US",
            },
          },
        },
      });
      if (confirmResult.error) {
        throw new Error(confirmResult.error.message ?? "Card was declined. Please try again.");
      }
      const paymentIntentId = confirmResult.paymentIntent?.id;
      if (!paymentIntentId) {
        throw new Error("Payment could not be confirmed. Please try again.");
      }

      // Call Beacon wallet-order to sync the completed payment into WooCommerce
      const walletOrderResponse = await fetch("/api/checkout/beacon-wallet-order", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          cart_token: cartToken,
          billing_address: {
            first_name: billingAddress.first_name,
            last_name: billingAddress.last_name,
            email: billingAddress.email,
            address_1: billingAddress.address_1,
            address_2: billingAddress.address_2 || "",
            city: billingAddress.city,
            state: billingAddress.state,
            postcode: billingAddress.postcode,
            country: billingAddress.country || "US",
            phone: billingAddress.phone || "",
          },
          shipping_address: {
            first_name: shippingAddress.first_name,
            last_name: shippingAddress.last_name,
            address_1: shippingAddress.address_1,
            address_2: shippingAddress.address_2 || "",
            city: shippingAddress.city,
            state: shippingAddress.state,
            postcode: shippingAddress.postcode,
            country: shippingAddress.country || "US",
            phone: shippingAddress.phone || "",
          },
          amount_minor: amountCents,
          currency: currencyCode.toLowerCase(),
        }),
      });
      const walletOrderData = await walletOrderResponse.json();
      if (!walletOrderResponse.ok) {
        // Payment succeeded but order sync failed — still treat as success
        // since money was collected, but log it
        console.error("[Beacon wallet-order] sync failed:", walletOrderData);
      }

      const orderId = walletOrderData?.order_id ?? paymentIntentId;
      onSuccess({ transactionId: String(orderId) });
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
      <div className="rounded-md border p-3" style={{ borderColor: "var(--pl-border)" }}>
        <CardElement options={cardElementOptions} />
      </div>

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={attested}
          onChange={(e) => setAttested(e.target.checked)}
          className="mt-1"
        />
        <span
          className="flex flex-col gap-1 text-xs leading-relaxed"
          style={{ color: "var(--pl-text-secondary)", fontFamily: "var(--pl-font-body)" }}
        >
          <span className="font-medium" style={{ color: "var(--pl-navy)" }}>
            By checking this box, I confirm all of the following:
          </span>
          {ATTESTATION_STATEMENTS.map((statement) => (
            <span key={statement}>&bull; {statement}</span>
          ))}
        </span>
      </label>

      <button
        onClick={handlePay}
        disabled={!attested || !stripe || isSubmitting}
        className="w-full rounded-full px-6 py-4 text-xs font-semibold uppercase tracking-[0.1em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          backgroundColor: "var(--pl-navy)",
          color: "var(--pl-ivory)",
          fontFamily: "var(--pl-font-body)",
        }}
      >
        {isSubmitting ? "Processing…" : "Pay Now"}
      </button>
    </div>
  );
}
