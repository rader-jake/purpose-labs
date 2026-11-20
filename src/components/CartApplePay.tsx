"use client";

import { useState, useEffect } from "react";
import { loadStripe, PaymentRequest } from "@stripe/stripe-js";

const LEGAL_VERSION = "2026.07.22-1";

export function CartApplePay({
  totalCents,
  onSuccess,
}: {
  totalCents: number;
  onSuccess?: () => void;
}) {
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [prReady, setPrReady] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [attested, setAttested] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) return;
    if (totalCents <= 0) return;

    let cancelled = false;

    async function init() {
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
        { stripeAccount: "acct_1U2yBlPzodzW27XV" }
      );
      if (!stripe || cancelled) return;

      const pr = stripe.paymentRequest({
        country: "US",
        currency: "usd",
        total: { label: "Purpose Labs", amount: totalCents },
        requestPayerName: true,
        requestPayerEmail: true,
        requestShipping: true,
        shippingOptions: [
          {
            id: "standard",
            label: "Standard Shipping",
            detail: "",
            amount: 0,
          },
        ],
      });

      pr.on("paymentmethod", async (ev) => {
        setIsProcessing(true);
        setError(null);
        try {
          const cartToken =
            typeof localStorage !== "undefined"
              ? localStorage.getItem("wc/cartToken")
              : null;

          // Create payment intent
          const intentRes = await fetch("/api/checkout/beacon-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amountCents: totalCents,
              currencyCode: "usd",
              cart_token: cartToken,
            }),
          });

          if (!intentRes.ok) {
            ev.complete("fail");
            setError("Could not create payment intent.");
            return;
          }

          const intentData = await intentRes.json();
          const clientSecret = intentData?.client_secret;
          if (!clientSecret) {
            ev.complete("fail");
            setError("Payment could not be started. Please try again.");
            return;
          }

          // Confirm the payment
          const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
            clientSecret,
            { payment_method: ev.paymentMethod.id },
            { handleActions: false }
          );

          if (stripeError) {
            ev.complete("fail");
            setError(stripeError.message ?? "Payment failed.");
            return;
          }

          ev.complete("success");

          // Handle 3DS if needed
          if (paymentIntent?.status === "requires_action") {
            const { error } = await stripe.confirmCardPayment(clientSecret);
            if (error) {
              setError(error.message ?? "Payment failed.");
              return;
            }
          }

          const paymentIntentId = paymentIntent?.id;

          // Create WooCommerce order
          const shipping = ev.shippingAddress;
          const nameParts = (ev.payerName ?? "").split(" ");
          const firstName = nameParts[0] ?? "";
          const lastName = nameParts.slice(1).join(" ") ?? "";

          const walletRes = await fetch("/api/checkout/beacon-wallet-order", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              payment_intent_id: paymentIntentId,
              cart_token: cartToken,
              billing_address: {
                first_name: firstName,
                last_name: lastName,
                email: ev.payerEmail ?? "",
                address_1: ev.paymentMethod.billing_details?.address?.line1 ?? "",
                address_2: ev.paymentMethod.billing_details?.address?.line2 ?? "",
                city: ev.paymentMethod.billing_details?.address?.city ?? "",
                state: ev.paymentMethod.billing_details?.address?.state ?? "",
                postcode: ev.paymentMethod.billing_details?.address?.postal_code ?? "",
                country: ev.paymentMethod.billing_details?.address?.country ?? "US",
                phone: "",
              },
              shipping_address: shipping
                ? {
                    first_name: firstName,
                    last_name: lastName,
                    address_1: shipping.addressLine?.[0] ?? "",
                    address_2: shipping.addressLine?.[1] ?? "",
                    city: shipping.city ?? "",
                    state: shipping.region ?? "",
                    postcode: shipping.postalCode ?? "",
                    country: shipping.country ?? "US",
                    phone: "",
                  }
                : undefined,
              amount_minor: totalCents,
              currency: "usd",
            }),
          });

          if (!walletRes.ok) {
            setError("Order creation failed. Contact support.");
            return;
          }

          setShowModal(false);
          onSuccess?.();
          window.location.href = `/checkout/order-received/stripe-redirect?payment_intent=${paymentIntentId}`;
        } catch {
          ev.complete("fail");
          setError("An unexpected error occurred.");
        } finally {
          setIsProcessing(false);
        }
      });

      pr.canMakePayment().then((result) => {
        if (cancelled) return;
        if (result?.applePay) {
          setPaymentRequest(pr);
          setPrReady(true);
        }
      });
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [totalCents, onSuccess]);

  if (!prReady || !paymentRequest) return null;

  function handleApplePayClick() {
    setAttested(false);
    setError(null);
    setShowModal(true);
  }

  function handlePay() {
    if (!attested || !paymentRequest) return;
    setShowModal(false);
    paymentRequest.show();
  }

  return (
    <>
      {/* Apple Pay button */}
      <button
        onClick={handleApplePayClick}
        className="flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold transition-colors duration-200 mb-3"
        style={{
          backgroundColor: "#000",
          color: "#fff",
          fontFamily: "var(--pl-font-body)",
          WebkitAppearance: "none",
        }}
      >
        <AppleIcon />
        Buy with Apple Pay
      </button>

      {/* Attestation modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            className="w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6"
            style={{ backgroundColor: "var(--pl-white)" }}
          >
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: "var(--pl-navy)", fontFamily: "var(--pl-font-display)" }}
            >
              Age &amp; Use Confirmation
            </h3>
            <p
              className="text-sm mb-5"
              style={{ color: "var(--pl-slate)", fontFamily: "var(--pl-font-body)" }}
            >
              Purpose Labs products are for research use only.
            </p>

            <label className="flex items-start gap-3 cursor-pointer mb-6">
              <input
                type="checkbox"
                checked={attested}
                onChange={(e) => setAttested(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--pl-navy)]"
              />
              <span
                className="text-sm"
                style={{ color: "var(--pl-navy)", fontFamily: "var(--pl-font-body)" }}
              >
                I am 21 years of age or older and confirm these products are for{" "}
                <strong>research use only</strong>. I am not purchasing for human
                consumption.
              </span>
            </label>

            {error && (
              <p className="text-xs mb-4" style={{ color: "#dc2626", fontFamily: "var(--pl-font-body)" }}>
                {error}
              </p>
            )}

            <button
              onClick={handlePay}
              disabled={!attested || isProcessing}
              className="flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold transition-opacity duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#000", color: "#fff", fontFamily: "var(--pl-font-body)" }}
            >
              <AppleIcon />
              {isProcessing ? "Processing…" : "Pay with Apple Pay"}
            </button>

            <button
              onClick={() => setShowModal(false)}
              className="mt-3 w-full text-center text-xs underline-offset-2 hover:opacity-70"
              style={{ color: "var(--pl-muted)", fontFamily: "var(--pl-font-body)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function AppleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 814 1000"
      width="14"
      height="14"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.3-150.3-93.8c-50.4-63.1-91.1-166.3-91.1-264.9C0 388.6 71.4 268.9 160.5 215.6c54.8-33.1 118.4-50.9 183.5-50.9 60.6 0 118.4 21.4 157.6 44.9 36.4 22.1 68.3 50.3 97.6 50.3 26.4 0 68.1-27.5 101.9-50.9 48.3-33.1 97.3-52.2 150-52.2l-7.3 2.3zm-80.3-86.3c-33.1 36.4-82.3 61.6-132.8 61.6-7.9 0-16.5-.6-24.4-2.6C562.9 193.8 599 115.2 599 72c0-7.3-.6-14.6-1.9-21.9C538.1 61.9 466.4 100.4 420.3 165c-22.1 29.9-39.5 68.7-39.5 109.5 0 8.6.6 17.2 2.6 24.4 7.9.6 15.9.6 23.2.6 51.6 0 118.5-27.5 158.3-77.8 21.4 61.6 73.4 108 134.6 108 7.3 0 14-1.3 21.3-2.3l-11-62.8z" />
    </svg>
  );
}
