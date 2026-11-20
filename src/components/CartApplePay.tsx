"use client";

import { useState, useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import type { PaymentRequest } from "@stripe/stripe-js";
import { useCart } from "@/lib/cart/CartContext";

// Use platform Stripe key (no connected account) — same as StripePaymentStep
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function CartApplePay({ totalCents }: { totalCents: number }) {
  const { cart } = useCart();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [prReady, setPrReady] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [attested, setAttested] = useState(false);
  const [postPayError, setPostPayError] = useState<string | null>(null);
  const attestTsRef = useRef("");

  useEffect(() => {
    if (totalCents <= 0) return;
    let cancelled = false;

    stripePromise.then((stripe) => {
      if (!stripe || cancelled) return;

      const pr = stripe.paymentRequest({
        country: "US",
        currency: "usd",
        total: { label: "Purpose Labs", amount: totalCents },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      pr.on("paymentmethod", async (ev) => {
        try {
          // 1. Create Stripe payment intent via the standard (non-Beacon) endpoint
          const intentRes = await fetch("/api/checkout/stripe-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amountCents: totalCents, currencyCode: "usd" }),
          });

          if (!intentRes.ok) {
            ev.complete("fail");
            setPostPayError("Could not start payment. Please try checkout instead.");
            return;
          }

          const { clientSecret } = await intentRes.json();
          if (!clientSecret) {
            ev.complete("fail");
            setPostPayError("Payment could not be started. Please try checkout instead.");
            return;
          }

          // 2. Confirm payment with Apple Pay
          const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
            clientSecret,
            { payment_method: ev.paymentMethod.id },
            { handleActions: false }
          );

          if (stripeError) {
            ev.complete("fail");
            setPostPayError(stripeError.message ?? "Payment failed.");
            return;
          }

          ev.complete("success");

          if (paymentIntent?.status === "requires_action") {
            const { error } = await stripe.confirmCardPayment(clientSecret);
            if (error) {
              setPostPayError(error.message ?? "Payment failed.");
              return;
            }
          }

          const paymentIntentId = paymentIntent?.id;
          if (!paymentIntentId) {
            setPostPayError("Payment confirmed but order could not be created. Contact support.");
            return;
          }

          // 3. Build billing/shipping from Apple Pay event
          const nameParts = (ev.payerName ?? "").split(" ");
          const firstName = nameParts[0] ?? "";
          const lastName = nameParts.slice(1).join(" ") ?? "";
          const billing = {
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
          };

          // 4. Build line items from cart
          const lineItems = (cart?.items ?? []).map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
          }));
          const couponCodes = (cart?.coupons ?? []).map((c) => c.code);
          const affId = typeof localStorage !== "undefined"
            ? localStorage.getItem("pl_aff_id") ?? undefined
            : undefined;

          // 5. Create WooCommerce order via standard create-order endpoint
          const orderRes = await fetch("/api/checkout/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              payment_intent_id: paymentIntentId,
              billing_address: billing,
              shipping_address: billing,
              line_items: lineItems,
              coupon_lines: couponCodes,
              amount_minor: totalCents,
              expected_items_minor: (cart?.items ?? []).reduce(
                (sum, item) => sum + Number(item.totals.line_total), 0
              ),
              aff_id: affId,
            }),
          });

          if (!orderRes.ok) {
            console.error("[CartApplePay] order failed");
            setPostPayError(
              "Payment went through but order failed. Contact support with ref: " + paymentIntentId
            );
            return;
          }

          window.location.href = `/checkout/order-received/stripe-redirect?payment_intent=${paymentIntentId}`;
        } catch (err) {
          ev.complete("fail");
          setPostPayError(err instanceof Error ? err.message : "An unexpected error occurred.");
        }
      });

      pr.canMakePayment().then((result) => {
        if (cancelled) return;
        if (result?.applePay) {
          setPaymentRequest(pr);
          setPrReady(true);
        }
      });
    });

    return () => { cancelled = true; };
  }, [totalCents, cart]);

  if (!prReady || !paymentRequest) return null;

  function handleApplePayClick() {
    setAttested(false);
    setPostPayError(null);
    setShowModal(true);
  }

  function handlePay() {
    if (!attested || !paymentRequest) return;
    attestTsRef.current = new Date().toISOString();
    setShowModal(false);
    paymentRequest.show();
  }

  return (
    <>
      {postPayError && (
        <p className="text-xs mb-2 p-3 rounded-lg" style={{ color: "#dc2626", backgroundColor: "#fef2f2", fontFamily: "var(--pl-font-body)" }}>
          {postPayError}
        </p>
      )}

      <button
        onClick={handleApplePayClick}
        className="flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold transition-colors duration-200 mb-3"
        style={{ backgroundColor: "#000", color: "#fff", fontFamily: "var(--pl-font-body)" }}
      >
        <AppleIcon />
        Buy with Apple Pay
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div
            className="w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6"
            style={{ backgroundColor: "var(--pl-white)" }}
          >
            <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--pl-navy)", fontFamily: "var(--pl-font-display)" }}>
              Age &amp; Use Confirmation
            </h3>
            <p className="text-sm mb-5" style={{ color: "var(--pl-slate)", fontFamily: "var(--pl-font-body)" }}>
              Purpose Labs products are for research use only.
            </p>

            <label className="flex items-start gap-3 cursor-pointer mb-6">
              <input
                type="checkbox"
                checked={attested}
                onChange={(e) => setAttested(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0"
              />
              <span className="text-sm" style={{ color: "var(--pl-navy)", fontFamily: "var(--pl-font-body)" }}>
                I am 21 years of age or older and confirm these products are for{" "}
                <strong>research use only</strong>. Not for human consumption.
              </span>
            </label>

            <button
              onClick={handlePay}
              disabled={!attested}
              className="flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#000", color: "#fff", fontFamily: "var(--pl-font-body)" }}
            >
              <AppleIcon />
              Pay with Apple Pay
            </button>

            <button
              onClick={() => setShowModal(false)}
              className="mt-3 w-full text-center text-xs hover:opacity-70"
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
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 814 1000" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.3-150.3-93.8c-50.4-63.1-91.1-166.3-91.1-264.9C0 388.6 71.4 268.9 160.5 215.6c54.8-33.1 118.4-50.9 183.5-50.9 60.6 0 118.4 21.4 157.6 44.9 36.4 22.1 68.3 50.3 97.6 50.3 26.4 0 68.1-27.5 101.9-50.9 48.3-33.1 97.3-52.2 150-52.2l-7.3 2.3zm-80.3-86.3c-33.1 36.4-82.3 61.6-132.8 61.6-7.9 0-16.5-.6-24.4-2.6C562.9 193.8 599 115.2 599 72c0-7.3-.6-14.6-1.9-21.9C538.1 61.9 466.4 100.4 420.3 165c-22.1 29.9-39.5 68.7-39.5 109.5 0 8.6.6 17.2 2.6 24.4 7.9.6 15.9.6 23.2.6 51.6 0 118.5-27.5 158.3-77.8 21.4 61.6 73.4 108 134.6 108 7.3 0 14-1.3 21.3-2.3l-11-62.8z" />
    </svg>
  );
}
