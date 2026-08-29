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

const ATTESTATION_STATEMENTS: { key: string; label: string }[] = [
  { key: "attest_age_21", label: "I confirm I am at least 21 years of age." },
  { key: "attest_research_use_only", label: "I confirm these products are for research use only (RUO), not for human or animal consumption." },
  { key: "attest_experienced_researcher", label: "I confirm I am an experienced researcher qualified to handle these materials." },
  { key: "attest_b2b_transaction", label: "I confirm this is a business-to-business transaction between research entities." },
  { key: "attest_lawful_receipt", label: "I confirm lawful receipt of these materials is permitted in my jurisdiction." },
];

const BUYER_TYPE_OPTIONS = [
  { value: "laboratory", label: "Laboratory" },
  { value: "academic", label: "Academic institution" },
  { value: "business", label: "Business" },
  { value: "other_organization", label: "Other" },
];

const LEGAL_VERSION = "2026.07.22-1";

function TermsAccordion() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next && content === null) {
      setLoading(true);
      try {
        const res = await fetch("https://purposelabs.shop/?beacon_sc_checkout_terms=1");
        const html = await res.text();
        // Extract the main content text from the page body
        const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        const stripped = match
          ? match[1].replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, "\n").trim()
          : "Terms not available. Please visit purposelabs.shop for full terms.";
        setContent(stripped.slice(0, 3000));
      } catch {
        setContent("Could not load terms. Visit purposelabs.shop/?beacon_sc_checkout_terms=1");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div
      style={{
        border: "1px solid var(--pl-border)",
        borderRadius: "8px",
        overflow: "hidden",
        fontFamily: "var(--pl-font-body)",
      }}
    >
      <button
        type="button"
        onClick={handleToggle}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "var(--pl-font-body)",
          fontWeight: 600,
          fontSize: "13px",
          color: "var(--pl-navy)",
          textAlign: "left",
        }}
      >
        Read Checkout Terms &amp; Attestation Agreement
        <span style={{ fontSize: "18px", lineHeight: 1, color: "var(--pl-navy)" }}>
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--pl-border)",
            backgroundColor: "#f8f9fb",
            fontSize: "11px",
            color: "var(--pl-text-secondary)",
            lineHeight: "1.6",
            maxHeight: "260px",
            overflowY: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          {loading ? "Loading…" : (content ?? "")}
        </div>
      )}
    </div>
  );
}

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

export function BeaconPaymentStep(props: BeaconPaymentStepProps) {
  const stripePromise = useMemo<Promise<Stripe | null> | null>(() => {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) return null;
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

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  color: "var(--pl-navy)",
  marginBottom: "4px",
  fontFamily: "var(--pl-font-body)",
};

const errorStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#c0392b",
  marginTop: "2px",
};

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

  const [buyerType, setBuyerType] = useState("");
  const [attested, setAttested] = useState(false);
  const [attestTs, setAttestTs] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleAttestChange(checked: boolean) {
    setAttested(checked);
    if (checked) {
      setAttestTs(new Date().toISOString());
    } else {
      setAttestTs("");
    }
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!buyerType) errs.buyerType = "Please select a purchaser type.";
    if (!attested) errs.attest = "You must confirm the attestation statements.";
    return errs;
  }

  async function handlePay() {
    if (!stripe || !elements) return;
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      const cartToken = typeof localStorage !== "undefined" ? localStorage.getItem("wc/cartToken") : null;

      // Sync attestation data to Store API before charging
      const extensionData = {
        legal_version: LEGAL_VERSION,
        attest_all: "1",
        attest_ts_all: attestTs,
        buyer_type: buyerType,
        attest_age_21: "1",
        attest_research_use_only: "1",
        attest_experienced_researcher: "1",
        attest_b2b_transaction: "1",
        attest_lawful_receipt: "1",
        attest_ts_age_21: attestTs,
        attest_ts_research_use_only: attestTs,
        attest_ts_experienced_researcher: attestTs,
        attest_ts_b2b_transaction: attestTs,
        attest_ts_lawful_receipt: attestTs,
      };

      const extHeaders: Record<string, string> = { "Content-Type": "application/json" };
      if (cartToken) extHeaders["Cart-Token"] = cartToken;

      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_WC_URL ?? ""}/wp-json/wc/store/v1/cart/extensions`,
          {
            method: "POST",
            credentials: "include",
            headers: extHeaders,
            body: JSON.stringify({ namespace: "beacon-checkout", data: extensionData }),
          }
        );
      } catch (extErr) {
        console.warn("[Beacon] cart/extensions sync failed (non-fatal):", extErr);
      }

      // Create PaymentIntent
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

      // Sync order with extensions in checkout body
      const walletOrderResponse = await fetch("/api/checkout/beacon-wallet-order", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          cart_token: cartToken,
          payment_method: "beacon_checkout",
          extensions: {
            "beacon-checkout": {
              legal_version: LEGAL_VERSION,
              attest_all: "1",
              attest_ts_all: attestTs,
              buyer_type: buyerType,
            },
          },
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
      className="flex flex-col gap-5 rounded-lg border p-6"
      style={{ borderColor: "var(--pl-border)", backgroundColor: "var(--pl-ivory-soft)" }}
    >
      {/* Purchaser Type */}
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
        {errors.buyerType && <p style={errorStyle}>{errors.buyerType}</p>}
      </div>

      {/* Card Element */}
      <div className="rounded-md border p-3" style={{ borderColor: "var(--pl-border)", backgroundColor: "#fff" }}>
        <CardElement options={cardElementOptions} />
      </div>

      {/* Confirm-all checkbox */}
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={attested}
          onChange={(e) => handleAttestChange(e.target.checked)}
          className="mt-1"
        />
        <span
          className="flex flex-col gap-1 text-xs leading-relaxed"
          style={{ color: "var(--pl-text-secondary)", fontFamily: "var(--pl-font-body)" }}
        >
          <span className="font-medium" style={{ color: "var(--pl-navy)" }}>
            By checking this box, I confirm all of the following:
          </span>
          {ATTESTATION_STATEMENTS.map((s) => (
            <span key={s.key}>&bull; {s.label}</span>
          ))}
        </span>
      </label>
      {errors.attest && <p style={{ ...errorStyle, marginTop: "-12px" }}>{errors.attest}</p>}

      {/* Terms accordion */}
      <TermsAccordion />

      <button
        onClick={handlePay}
        disabled={!stripe || isSubmitting}
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
