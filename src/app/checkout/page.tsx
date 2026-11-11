"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { formatMoney } from "@/lib/cart/money";
import { getDisplayLines } from "@/lib/cart/displayLines";
import { StripePaymentStep } from "@/components/checkout/StripePaymentStep";
import { BeaconPaymentStep } from "@/components/checkout/BeaconPaymentStep";
import { OrderConfirmation } from "@/components/checkout/OrderConfirmation";
import { buildMockOrderConfirmation, type OrderConfirmationData } from "@/lib/order/types";
import type { PaymentError, PaymentResult } from "@/lib/payment/types";
import { trackInitiateCheckout, ttqIdentify } from "@/lib/tiktok-pixel";
import { gtmBeginCheckout, gtmPurchase } from "@/lib/gtm";

const EMAIL_PATTERN_BASIC = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function pushOmnisendCart(
  email: string,
  cartID: string,
  cart: ReturnType<typeof useCart>["cart"],
  firstName?: string,
  lastName?: string
) {
  if (!cart || !email || !EMAIL_PATTERN_BASIC.test(email)) return;
  try {
    await fetch("/api/omnisend/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        cartID,
        firstName: firstName ?? "",
        lastName: lastName ?? "",
        cartSum: Number(cart.totals.total_price) / 100,
        currency: "USD",
        cartUrl: `${window.location.origin}/checkout`,
        products: cart.items.map((item) => ({
          productID: String(item.id),
          title: item.name,
          quantity: item.quantity,
          price: item.prices?.price ? parseFloat(item.prices.price) / 100 : 0,
          imageUrl: item.images?.[0]?.src ?? "",
          productUrl: `${window.location.origin}/products`,
        })),
      }),
    });
  } catch (e) {
    console.error("[omnisend cart]", e);
  }
}

const ENABLE_BEACON = process.env.NEXT_PUBLIC_ENABLE_BEACON === "true";

type CustomerInfo = { firstName: string; lastName: string; email: string };
type ShippingAddress = {
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  phone: string;
};
type FieldKey = "firstName" | "lastName" | "email" | "address1" | "city" | "state" | "postcode";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Cart rewards tiers
const REWARD_TIERS = [
  { threshold: 150, label: "Free accessory", icon: "🎁" },
  { threshold: 200, label: "+$20 store credit", icon: "💳" },
  { threshold: 250, label: "Choose a free peptide", icon: "⭐", best: true },
  { threshold: 300, label: "Free 2-Day shipping", icon: "🚚" },
];

export default function CheckoutPage() {
  const { cart, isLoading, updateCustomerAddress } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>(() => {
    try {
      return {
        firstName: (typeof localStorage !== "undefined" && localStorage.getItem("pl_checkout_firstName")) || "",
        lastName: (typeof localStorage !== "undefined" && localStorage.getItem("pl_checkout_lastName")) || "",
        email: (typeof localStorage !== "undefined" && localStorage.getItem("pl_checkout_email")) || "",
      };
    } catch {
      return { firstName: "", lastName: "", email: "" };
    }
  });
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(() => {
    try {
      const saved = typeof localStorage !== "undefined" ? localStorage.getItem("pl_checkout_shipping") : null;
      if (saved) return JSON.parse(saved) as ShippingAddress;
    } catch {}
    return { address1: "", address2: "", city: "", state: "", postcode: "", phone: "" };
  });
  const [omnisendCartID] = useState(() => `cart_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const [omnisendFired, setOmnisendFired] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [isSyncingAddress, setIsSyncingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmationData | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [shipmentProtection, setShipmentProtection] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [upsellOpen, setUpsellOpen] = useState(false);

  useEffect(() => {
    const value = cart?.totals?.total_price ? parseFloat(cart.totals.total_price) / 100 : 0;
    trackInitiateCheckout({
      value: value || undefined,
      contents: (cart?.items ?? []).map((item) => ({
        content_id: String(item.id),
        content_name: item.name,
        content_type: "product",
        quantity: item.quantity,
        price: item.prices?.price ? parseFloat(item.prices.price) / 100 : 0,
      })),
    });
    gtmBeginCheckout(
      (cart?.items ?? []).map((item) => ({
        item_id: String(item.id),
        item_name: item.name,
        price: item.prices?.price ? parseFloat(item.prices.price) / 100 : undefined,
        quantity: item.quantity,
      })),
      value
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: "#fff" }}>
        <p style={{ color: "#6b7280", fontFamily: "var(--font-montserrat, sans-serif)" }}>Loading checkout…</p>
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6" style={{ background: "#fff" }}>
        <h1 style={{ color: "#1B2A4A", fontFamily: "var(--font-barlow, sans-serif)", fontSize: 36, fontWeight: 700 }}>
          Your cart is empty
        </h1>
        <Link
          href="/"
          style={{
            background: "#111",
            color: "#fff",
            borderRadius: 8,
            padding: "12px 28px",
            fontFamily: "var(--font-montserrat, sans-serif)",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Browse products
        </Link>
      </main>
    );
  }

  // ── Derived values ──────────────────────────────────────────────
  const subtotalCents = Number(cart.totals.total_items) - Number(cart.totals.total_discount);
  const subtotalDollars = subtotalCents / 100;
  const totalCents = Number(cart.totals.total_price) + (shipmentProtection ? 500 : 0);

  function buildAddressInput() {
    return {
      first_name: customerInfo.firstName,
      last_name: customerInfo.lastName,
      address_1: shippingAddress.address1,
      address_2: shippingAddress.address2,
      city: shippingAddress.city,
      state: shippingAddress.state,
      postcode: shippingAddress.postcode,
      country: "US",
      phone: shippingAddress.phone,
    };
  }

  function validateEmail() {
    const errors: Partial<Record<FieldKey, string>> = {};
    if (!customerInfo.email.trim()) errors.email = "Email is required";
    else if (!EMAIL_PATTERN.test(customerInfo.email.trim())) errors.email = "Enter a valid email address";
    return errors;
  }

  function validateAddress() {
    const errors: Partial<Record<FieldKey, string>> = {};
    if (!customerInfo.firstName.trim()) errors.firstName = "First name is required";
    if (!customerInfo.lastName.trim()) errors.lastName = "Last name is required";
    if (!shippingAddress.address1.trim()) errors.address1 = "Address is required";
    if (!shippingAddress.city.trim()) errors.city = "City is required";
    if (shippingAddress.state.trim().length !== 2) errors.state = "2-letter state code required";
    if (!shippingAddress.postcode.trim()) errors.postcode = "ZIP code is required";
    return errors;
  }

  const emailErrors = validateEmail();
  const addressErrors = validateAddress();
  const isEmailValid = Object.keys(emailErrors).length === 0;
  const isAddressValid = isEmailValid && Object.keys(addressErrors).length === 0;

  const shownEmailErrors = attemptedSubmit && currentStep === 1 ? emailErrors : {};
  const shownAddressErrors = attemptedSubmit && currentStep === 2 ? addressErrors : {};

  async function syncAddressIfComplete() {
    if (isSyncingAddress) return;
    const { address1, city, state, postcode } = shippingAddress;
    try { localStorage.setItem("pl_checkout_shipping", JSON.stringify(shippingAddress)); } catch {}
    if (!address1.trim() || !city.trim() || state.trim().length !== 2 || !postcode.trim()) return;
    setIsSyncingAddress(true);
    setAddressError(null);
    try {
      const address = buildAddressInput();
      await updateCustomerAddress({
        shipping_address: address,
        billing_address: { ...address, email: customerInfo.email },
      });
    } catch (err) {
      setAddressError(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setIsSyncingAddress(false);
    }
  }

  function handleStep1Continue() {
    setAttemptedSubmit(true);
    if (!isEmailValid) return;
    if (EMAIL_PATTERN.test(customerInfo.email.trim())) {
      void ttqIdentify(customerInfo.email.trim());
    }
    setAttemptedSubmit(false);
    setCurrentStep(2);
  }

  async function handleStep2Continue() {
    setAttemptedSubmit(true);
    if (!isAddressValid) return;
    setAttemptedSubmit(false);
    await syncAddressIfComplete();
    setCurrentStep(3);
  }

  function handleAttemptSubmit() {
    setAttemptedSubmit(true);
    if (EMAIL_PATTERN.test(customerInfo.email.trim())) {
      void ttqIdentify(customerInfo.email.trim());
    }
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponMsg(null);
    try {
      const res = await fetch("/api/cart/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim() }),
      });
      if (res.ok) {
        setCouponMsg({ type: "ok", text: "Coupon applied!" });
      } else {
        const data = await res.json().catch(() => ({}));
        setCouponMsg({ type: "err", text: data?.message || "Invalid coupon code." });
      }
    } catch {
      setCouponMsg({ type: "err", text: "Failed to apply coupon." });
    } finally {
      setCouponLoading(false);
    }
  }

  async function handlePaymentSuccess(result: PaymentResult) {
    setPaymentError(null);
    const address = buildAddressInput();
    try {
      const lineItems = (cart?.items ?? []).map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        variation_id: (item as { variation_id?: number }).variation_id ?? undefined,
      }));
      const affId = typeof window !== "undefined" ? localStorage.getItem("pl_aff_id") ?? undefined : undefined;
      const couponCodes = (cart?.coupons ?? []).map((c: { code: string }) => c.code);
      await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_intent_id: result.transactionId,
          billing_address: { ...address, email: customerInfo.email },
          shipping_address: address,
          line_items: lineItems,
          coupon_lines: couponCodes,
          amount_minor: Number(cart?.totals.total_price ?? 0),
          aff_id: affId,
        }),
      });
    } catch (e) {
      console.error("[create-order] failed:", e);
    }
    const orderValue = cart ? parseFloat(cart.totals.total_price) / 100 : 0;
    gtmPurchase({
      transaction_id: result.transactionId,
      value: orderValue,
      items: (cart?.items ?? []).map((item) => ({
        item_id: String(item.id),
        item_name: item.name,
        price: item.prices?.price ? parseFloat(item.prices.price) / 100 : undefined,
        quantity: item.quantity,
      })),
    });
    try {
      localStorage.removeItem("pl_checkout_email");
      localStorage.removeItem("pl_checkout_firstName");
      localStorage.removeItem("pl_checkout_lastName");
      localStorage.removeItem("pl_checkout_shipping");
    } catch {}
    setOrderConfirmation(
      buildMockOrderConfirmation(cart!, result.transactionId, { ...address, email: customerInfo.email }, address)
    );
  }

  function handlePaymentError(error: PaymentError) {
    setOrderConfirmation(null);
    setPaymentError(error.message);
  }

  function handleOmnisendEmailBlur(email: string) {
    if (EMAIL_PATTERN_BASIC.test(email) && !omnisendFired) {
      setOmnisendFired(true);
      void pushOmnisendCart(email, omnisendCartID, cart, customerInfo.firstName, customerInfo.lastName);
      try {
        const omni = (window as unknown as { omnisend?: { push: (args: unknown[]) => void } }).omnisend;
        if (omni) {
          const checkoutUrl = window.location.origin + "/checkout";
          const value = cart ? Number(cart.totals.total_price) / 100 : 0;
          const lineItems = (cart?.items ?? []).map((item) => ({
            productID: String(item.id),
            productVariantID: String(item.id),
            productTitle: item.name,
            productDescription: item.name,
            productPrice: item.prices?.price ? parseFloat(item.prices.price) / 100 : 0,
            productQuantity: item.quantity,
            productImageURL: item.images?.[0]?.src || "https://www.purposelabs.shop/pl-logo.png",
            productURL: window.location.origin + "/products",
          }));
          const properties = { abandonedCheckoutURL: checkoutUrl, cartID: omnisendCartID, currency: "USD", value, lineItems };
          omni.push(["identifyContact", { email }]);
          if (lineItems.length > 0) {
            omni.push(["track", "added product to cart", {
              origin: "api", eventVersion: "",
              properties: { ...properties, addedItem: lineItems[0] },
              contact: { email },
            }]);
          }
          omni.push(["track", "started checkout", { origin: "api", eventVersion: "", properties, contact: { email } }]);
        }
      } catch (err) {
        console.warn("[omnisend] browser tracking failed:", err);
      }
    }
  }

  if (orderConfirmation) {
    return <OrderConfirmation data={orderConfirmation} />;
  }

  const stepLabels = ["Address", "Delivery", "Payment"];
  const stepLabel = stepLabels[currentStep - 1];

  // Cart rewards
  const unlockedCount = REWARD_TIERS.filter((t) => subtotalDollars >= t.threshold).length;

  // Coins earned (1 coin per $1, worth $0.01 each — visual only)
  const coinsEarned = Math.floor(subtotalDollars);
  const coinsDollarValue = (coinsEarned * 0.01).toFixed(2);

  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "var(--font-montserrat, sans-serif)" }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <header
        style={{
          borderBottom: "1px solid #e5e7eb",
          background: "#fff",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 24px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link href="/cart" style={{ color: "#1B2A4A", fontSize: 13, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            ← Back
          </Link>
          <Link href="/" style={{ display: "flex", alignItems: "center" }}>
            <Image src="/pl-logo.png" alt="Purpose Labs" width={120} height={36} style={{ objectFit: "contain" }} />
          </Link>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#1B2A4A",
              letterSpacing: "0.08em",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            🔒 SECURE CHECKOUT
          </div>
        </div>
      </header>

      {/* ── Step Progress Bar ───────────────────────────────────── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "10px 24px 0" }}>
          <p style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, marginBottom: 8 }}>
            Step {currentStep} of 3 · {stepLabel}
          </p>
          <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  background: s <= currentStep ? "#3B55E6" : "#e5e7eb",
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Layout ─────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "32px 24px 64px",
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 40,
          alignItems: "start",
        }}
        className="checkout-layout"
      >
        {/* ── LEFT COLUMN ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* ── STEP 1: Contact / Email ─── */}
          <StepCard
            stepNum={1}
            title="Contact"
            currentStep={currentStep}
            onEdit={() => setCurrentStep(1)}
            summary={currentStep > 1 ? customerInfo.email : undefined}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={customerInfo.email}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCustomerInfo((c) => {
                      const n = { ...c, email: v };
                      try { localStorage.setItem("pl_checkout_email", v); } catch {}
                      return n;
                    });
                  }}
                  onBlur={(e) => handleOmnisendEmailBlur(e.target.value.trim())}
                  style={fieldStyle(!!shownEmailErrors.email)}
                />
                <FieldError message={shownEmailErrors.email} />
              </div>
              <ContinueButton onClick={handleStep1Continue}>Continue to Delivery</ContinueButton>
            </div>
          </StepCard>

          {/* ── STEP 2: Delivery / Address ─── */}
          <StepCard
            stepNum={2}
            title="Delivery"
            currentStep={currentStep}
            onEdit={() => setCurrentStep(2)}
            summary={
              currentStep > 2
                ? `${shippingAddress.address1}, ${shippingAddress.city} ${shippingAddress.state} ${shippingAddress.postcode}`
                : undefined
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <input
                    placeholder="First name"
                    value={customerInfo.firstName}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCustomerInfo((c) => {
                        const n = { ...c, firstName: v };
                        try { localStorage.setItem("pl_checkout_firstName", v); } catch {}
                        return n;
                      });
                    }}
                    style={fieldStyle(!!shownAddressErrors.firstName)}
                  />
                  <FieldError message={shownAddressErrors.firstName} />
                </div>
                <div>
                  <input
                    placeholder="Last name"
                    value={customerInfo.lastName}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCustomerInfo((c) => {
                        const n = { ...c, lastName: v };
                        try { localStorage.setItem("pl_checkout_lastName", v); } catch {}
                        return n;
                      });
                    }}
                    style={fieldStyle(!!shownAddressErrors.lastName)}
                  />
                  <FieldError message={shownAddressErrors.lastName} />
                </div>
              </div>
              <div>
                <input
                  placeholder="Address"
                  value={shippingAddress.address1}
                  onChange={(e) => setShippingAddress((a) => ({ ...a, address1: e.target.value }))}
                  onBlur={syncAddressIfComplete}
                  style={fieldStyle(!!shownAddressErrors.address1)}
                />
                <FieldError message={shownAddressErrors.address1} />
              </div>
              <input
                placeholder="Apartment, suite, etc. (optional)"
                value={shippingAddress.address2}
                onChange={(e) => setShippingAddress((a) => ({ ...a, address2: e.target.value }))}
                onBlur={syncAddressIfComplete}
                style={fieldStyle(false)}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px", gap: 10 }}>
                <div>
                  <input
                    placeholder="City"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress((a) => ({ ...a, city: e.target.value }))}
                    onBlur={syncAddressIfComplete}
                    style={fieldStyle(!!shownAddressErrors.city)}
                  />
                  <FieldError message={shownAddressErrors.city} />
                </div>
                <div>
                  <input
                    placeholder="State"
                    maxLength={2}
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress((a) => ({ ...a, state: e.target.value.toUpperCase() }))}
                    onBlur={syncAddressIfComplete}
                    style={{ ...fieldStyle(!!shownAddressErrors.state), textTransform: "uppercase" }}
                  />
                  <FieldError message={shownAddressErrors.state} />
                </div>
                <div>
                  <input
                    placeholder="ZIP"
                    value={shippingAddress.postcode}
                    onChange={(e) => setShippingAddress((a) => ({ ...a, postcode: e.target.value }))}
                    onBlur={syncAddressIfComplete}
                    style={fieldStyle(!!shownAddressErrors.postcode)}
                  />
                  <FieldError message={shownAddressErrors.postcode} />
                </div>
              </div>
              <input
                placeholder="Phone (optional)"
                value={shippingAddress.phone}
                onChange={(e) => setShippingAddress((a) => ({ ...a, phone: e.target.value }))}
                style={fieldStyle(false)}
              />

              {/* Shipment Protection */}
              <div
                onClick={() => setShipmentProtection((v) => !v)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  border: `1.5px solid ${shipmentProtection ? "#1B2A4A" : "#e5e7eb"}`,
                  borderRadius: 8,
                  padding: "12px 14px",
                  cursor: "pointer",
                  background: shipmentProtection ? "#f0f4ff" : "#fff",
                  transition: "all 0.2s",
                }}
              >
                <input
                  type="checkbox"
                  checked={shipmentProtection}
                  onChange={(e) => { e.stopPropagation(); setShipmentProtection((v) => !v); }}
                  style={{ marginTop: 2, accentColor: "#1B2A4A", width: 15, height: 15, flexShrink: 0 }}
                />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#1B2A4A", margin: 0 }}>
                    Shipment Protection — $5.00
                  </p>
                  <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0" }}>
                    Protect your order against loss or damage in transit.
                  </p>
                </div>
              </div>

              {addressError && <p style={{ fontSize: 12, color: "#ef4444" }}>{addressError}</p>}
              {isSyncingAddress && <p style={{ fontSize: 12, color: "#9ca3af" }}>Updating shipping &amp; tax…</p>}

              <ContinueButton onClick={handleStep2Continue}>Continue to Payment</ContinueButton>
            </div>
          </StepCard>

          {/* ── STEP 3: Payment ─── */}
          <StepCard stepNum={3} title="Payment" currentStep={currentStep} onEdit={() => setCurrentStep(3)}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {paymentError && (
                <p style={{ fontSize: 13, color: "#ef4444", background: "#fef2f2", padding: "10px 14px", borderRadius: 6 }}>
                  {paymentError}
                </p>
              )}
              {ENABLE_BEACON ? (
                <BeaconPaymentStep
                  amountCents={totalCents}
                  currencyCode="usd"
                  billingAddress={{ ...buildAddressInput(), email: customerInfo.email }}
                  shippingAddress={buildAddressInput()}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onAttemptSubmit={!isAddressValid ? handleAttemptSubmit : undefined}
                  isAddressValid={isAddressValid}
                />
              ) : (
                <StripePaymentStep
                  amountCents={totalCents}
                  currencyCode="usd"
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onAttemptSubmit={!isAddressValid ? handleAttemptSubmit : undefined}
                  isAddressValid={isAddressValid}
                />
              )}
            </div>
          </StepCard>

          {/* ── Bottom Info Cards ─── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
            <InfoCard icon="📄" title="How this appears on your statement">
              Your charge will appear as <strong>PURPOSE LABS</strong> — no product details.
            </InfoCard>
            <InfoCard icon="💬" title="Need payment help?">
              Reach us at <a href="mailto:support@purposelabs.shop" style={{ color: "#3B55E6" }}>support@purposelabs.shop</a>
            </InfoCard>
            <InfoCard icon="↩️" title="Return &amp; refund policy">
              Unopened items may be returned within 30 days. Contact support to initiate.
            </InfoCard>
          </div>

          {/* ── Footer Links ─── */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginTop: 8 }}>
            {["Shipping & Returns", "Terms of Service", "Privacy Policy", "Billing & Statements", "Research Use Only"].map((label) => (
              <span key={label} style={{ fontSize: 11, color: "#9ca3af", cursor: "default" }}>{label}</span>
            ))}
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 100 }}>

          {/* Trust Badges */}
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: "16px 18px",
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {[
              { icon: "🔒", title: "Encrypted, secure payment", body: "Card details are never stored on this site." },
              { icon: "👁", title: "Discreet shipping", body: "No product names on the box or your statement." },
              { icon: "🧪", title: "99%+ purity, 10x tested", body: "A certificate of analysis for every batch — see the COA page." },
            ].map((b) => (
              <div key={b.title} style={{ display: "flex", gap: 10 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{b.icon}</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#1B2A4A", margin: 0 }}>{b.title}</p>
                  <p style={{ fontSize: 11, color: "#6b7280", margin: "2px 0 0" }}>{b.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Rewards */}
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
            <div style={{ background: "#1B2A4A", padding: "12px 18px" }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: "#93c5fd", letterSpacing: "0.12em", margin: 0, fontFamily: "var(--font-barlow, sans-serif)" }}>
                CART REWARDS
              </p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "2px 0 0" }}>
                Free gifts on this order
              </p>
            </div>
            <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Progress dots */}
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {REWARD_TIERS.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: i < unlockedCount ? "#3B55E6" : "#e5e7eb",
                      border: i < unlockedCount ? "none" : "1.5px solid #d1d5db",
                      transition: "background 0.3s",
                    }}
                  />
                ))}
                <span style={{ fontSize: 11, color: "#6b7280", marginLeft: 4 }}>{unlockedCount}/4 unlocked</span>
              </div>
              {/* Tiers */}
              {REWARD_TIERS.map((tier) => {
                const unlocked = subtotalDollars >= tier.threshold;
                const diff = tier.threshold - subtotalDollars;
                return (
                  <div
                    key={tier.threshold}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      opacity: unlocked ? 1 : 0.7,
                    }}
                  >
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{unlocked ? "✅" : tier.icon}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#1B2A4A" }}>
                        ${tier.threshold}+ — {tier.label}
                        {tier.best && (
                          <span style={{ marginLeft: 4, fontSize: 10, background: "#fef9c3", color: "#92400e", borderRadius: 4, padding: "1px 5px", fontWeight: 700 }}>
                            BEST VALUE
                          </span>
                        )}
                      </span>
                      {!unlocked && (
                        <p style={{ fontSize: 11, color: "#9ca3af", margin: "1px 0 0" }}>
                          Spend ${diff.toFixed(0)} more to unlock
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #e5e7eb" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1B2A4A", margin: 0, fontFamily: "var(--font-barlow, sans-serif)", letterSpacing: "0.06em" }}>
                ORDER SUMMARY
              </p>
            </div>
            <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Line items */}
              {getDisplayLines(cart).map((line) => {
                const image = cart.items.find((item) => item.key === line.itemKey)?.images?.[0];
                return (
                  <div key={line.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {(image?.src || image?.thumbnail) && (
                      <img
                        src={image.src || image.thumbnail}
                        alt={line.name}
                        width={40}
                        height={40}
                        style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover", flexShrink: 0, border: "1px solid #e5e7eb" }}
                      />
                    )}
                    <span style={{ flex: 1, fontSize: 12, color: "#374151" }}>
                      {line.name} <span style={{ color: "#9ca3af" }}>×{line.quantity}</span>
                    </span>
                    {line.isFree ? (
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#16a34a" }}>FREE</span>
                    ) : (
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#1B2A4A" }}>{formatMoney(line.totalCents)}</span>
                    )}
                  </div>
                );
              })}

              {/* Upsell accordion */}
              <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 8 }}>
                <button
                  onClick={() => setUpsellOpen((v) => !v)}
                  style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, fontWeight: 600, color: "#3B55E6", padding: 0 }}
                >
                  <span>Often added with this order</span>
                  <span style={{ transform: upsellOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
                </button>
                {upsellOpen && (
                  <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>
                    Visit our products page to add more items to your cart.
                  </p>
                )}
              </div>

              {/* Coupon */}
              <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 8 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    placeholder="Discount code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    style={{
                      flex: 1,
                      border: "1px solid #e5e7eb",
                      borderRadius: 6,
                      padding: "8px 10px",
                      fontSize: 12,
                      color: "#1B2A4A",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    style={{
                      background: "#1B2A4A",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "8px 14px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    {couponLoading ? "…" : "Apply"}
                  </button>
                </div>
                {couponMsg && (
                  <p style={{ fontSize: 11, color: couponMsg.type === "ok" ? "#16a34a" : "#ef4444", marginTop: 4 }}>
                    {couponMsg.text}
                  </p>
                )}
              </div>

              {/* Pricing breakdown */}
              <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                {Number(cart.totals.total_discount) > 0 && (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: "#6b7280" }}>Retail price</span>
                      <span style={{ color: "#9ca3af", textDecoration: "line-through" }}>
                        {formatMoney(cart.totals.total_items)}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: "#16a34a", fontWeight: 600 }}>You save</span>
                      <span style={{ color: "#16a34a", fontWeight: 600 }}>
                        -{formatMoney(cart.totals.total_discount)}
                      </span>
                    </div>
                  </>
                )}
                {cart.coupons.map((coupon) => (
                  <div key={coupon.code} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                    <span style={{ color: "#6b7280" }}>Code: {coupon.code.toUpperCase()}</span>
                    <span style={{ color: "#16a34a" }}>-{formatMoney(coupon.totals.total_discount)}</span>
                  </div>
                ))}
                {cart.fees.map((fee) => (
                  <div key={fee.key} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: "#6b7280" }}>{fee.name}</span>
                    <span style={{ color: "#1B2A4A" }}>{formatMoney(fee.totals.total)}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "#6b7280" }}>Shipping</span>
                  <span style={{ color: "#1B2A4A", fontWeight: 700 }}>FREE</span>
                </div>
                {shipmentProtection && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: "#6b7280" }}>Shipment Protection</span>
                    <span style={{ color: "#1B2A4A" }}>+$5.00</span>
                  </div>
                )}
                {Number(cart.totals.total_tax) > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: "#6b7280" }}>Tax</span>
                    <span style={{ color: "#1B2A4A" }}>{formatMoney(cart.totals.total_tax)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700, borderTop: "1px solid #e5e7eb", paddingTop: 8, marginTop: 2 }}>
                  <span style={{ color: "#1B2A4A" }}>Total</span>
                  <span style={{ color: "#1B2A4A" }}>{formatMoney(String(totalCents))}</span>
                </div>
              </div>

              {/* Coins badge */}
              {coinsEarned > 0 && (
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontSize: 12,
                    color: "#15803d",
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  🪙 You will earn {coinsEarned} Coins (worth ${coinsDollarValue})
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive override for mobile */}
      <style>{`
        @media (max-width: 768px) {
          .checkout-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function fieldStyle(hasError: boolean): React.CSSProperties {
  return {
    width: "100%",
    border: `1.5px solid ${hasError ? "#ef4444" : "#e5e7eb"}`,
    borderRadius: 8,
    padding: "11px 14px",
    fontSize: 14,
    color: "#1B2A4A",
    fontFamily: "var(--font-montserrat, sans-serif)",
    outline: "none",
    boxSizing: "border-box",
    background: "#fff",
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{message}</p>;
}

function ContinueButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        background: "#111",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "14px",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
        letterSpacing: "0.04em",
        marginTop: 4,
        transition: "background 0.2s",
      }}
    >
      {children}
    </button>
  );
}

function StepCard({
  stepNum,
  title,
  currentStep,
  children,
  onEdit,
  summary,
}: {
  stepNum: number;
  title: string;
  currentStep: number;
  children: React.ReactNode;
  onEdit?: () => void;
  summary?: string;
}) {
  const isActive = stepNum === currentStep;
  const isCompleted = stepNum < currentStep;
  const isLocked = stepNum > currentStep;

  return (
    <div
      style={{
        border: `1.5px solid ${isActive ? "#3B55E6" : "#e5e7eb"}`,
        borderRadius: 12,
        overflow: "hidden",
        background: "#fff",
        transition: "border-color 0.3s",
        opacity: isLocked ? 0.5 : 1,
      }}
    >
      {/* Card header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          borderBottom: isActive ? "1px solid #e5e7eb" : "none",
          background: isActive ? "#fff" : "#fafafa",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: isCompleted ? "#3B55E6" : isActive ? "#1B2A4A" : "#e5e7eb",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {isCompleted ? "✓" : stepNum}
          </div>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#1B2A4A",
              fontFamily: "var(--font-barlow, sans-serif)",
              letterSpacing: "0.04em",
            }}
          >
            {title.toUpperCase()}
          </span>
          {isCompleted && summary && (
            <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 4 }}>{summary}</span>
          )}
        </div>
        {isCompleted && onEdit && (
          <button
            onClick={onEdit}
            style={{ fontSize: 12, color: "#3B55E6", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            Edit
          </button>
        )}
      </div>
      {/* Card body — only visible when active */}
      {isActive && <div style={{ padding: "16px 18px" }}>{children}</div>}
    </div>
  );
}

function InfoCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: "12px 16px",
        display: "flex",
        gap: 10,
        background: "#fafafa",
      }}
    >
      <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
      <div>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#1B2A4A", margin: 0 }}>{title}</p>
        <p style={{ fontSize: 12, color: "#6b7280", margin: "3px 0 0" }}>{children}</p>
      </div>
    </div>
  );
}
