"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { formatMoney } from "@/lib/cart/money";
import { PaymentStepStub } from "@/components/checkout/PaymentStepStub";
import { OrderConfirmation } from "@/components/checkout/OrderConfirmation";
import { buildMockOrderConfirmation, type OrderConfirmationData } from "@/lib/order/types";
import type { PaymentError, PaymentResult } from "@/lib/payment/types";

type Step = "info" | "shipping" | "review" | "payment" | "confirmation";

type CustomerInfo = { firstName: string; lastName: string; email: string };
type ShippingAddress = {
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  phone: string;
};

const inputStyle = {
  borderColor: "var(--pl-border)",
  color: "var(--pl-navy)",
  fontFamily: "var(--pl-font-body)",
};

export default function CheckoutPage() {
  const { cart, isLoading, updateCustomerAddress } = useCart();
  const [step, setStep] = useState<Step>("info");
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    address1: "",
    address2: "",
    city: "",
    state: "",
    postcode: "",
    phone: "",
  });
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmationData | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center" style={{ fontFamily: "var(--pl-font-body)" }}>
        <p style={{ color: "var(--pl-muted)" }}>Loading checkout…</p>
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center" style={{ fontFamily: "var(--pl-font-body)" }}>
        <h1
          className="mb-4 text-4xl"
          style={{ color: "var(--pl-navy)", fontFamily: "var(--pl-font-display)", fontWeight: 500 }}
        >
          Your cart is empty
        </h1>
        <p className="mb-8 text-sm" style={{ color: "var(--pl-text-secondary)" }}>
          Add something to your cart before checking out.
        </p>
        <Link
          href="/"
          className="inline-block rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em]"
          style={{ backgroundColor: "var(--pl-navy)", color: "var(--pl-ivory)" }}
        >
          Browse products
        </Link>
      </main>
    );
  }

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

  async function handleShippingSubmit() {
    setIsSubmittingAddress(true);
    setAddressError(null);
    try {
      const address = buildAddressInput();
      await updateCustomerAddress({
        shipping_address: address,
        billing_address: { ...address, email: customerInfo.email },
      });
      setStep("review");
    } catch (err) {
      setAddressError(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setIsSubmittingAddress(false);
    }
  }

  function handlePaymentSuccess(result: PaymentResult) {
    setPaymentError(null);
    const address = buildAddressInput();
    // Non-null: this handler only fires from the payment step below,
    // which doesn't render unless the earlier `!cart` guard already
    // returned — TS can't see that across the closure, but it holds.
    setOrderConfirmation(
      buildMockOrderConfirmation(cart!, result.transactionId, { ...address, email: customerInfo.email }, address)
    );
    setStep("confirmation");
  }

  function handlePaymentError(error: PaymentError) {
    setOrderConfirmation(null);
    setPaymentError(error.message);
  }

  if (step === "confirmation" && orderConfirmation) {
    return <OrderConfirmation data={orderConfirmation} />;
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:px-10" style={{ fontFamily: "var(--pl-font-body)" }}>
      <h1
        className="mb-10 text-4xl sm:text-5xl"
        style={{ color: "var(--pl-navy)", fontFamily: "var(--pl-font-display)", fontWeight: 500 }}
      >
        Checkout
      </h1>

      <div className="flex flex-col gap-4">
        {/* Step 1: Customer info */}
        <CheckoutSection
          number="01"
          title="Customer Info"
          isActive={step === "info"}
          isComplete={step !== "info"}
          summary={step !== "info" ? `${customerInfo.firstName} ${customerInfo.lastName} · ${customerInfo.email}` : null}
          onEdit={() => setStep("info")}
        >
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setStep("shipping");
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              <input
                required
                placeholder="First name"
                value={customerInfo.firstName}
                onChange={(e) => setCustomerInfo((c) => ({ ...c, firstName: e.target.value }))}
                className="rounded border px-4 py-3 text-sm"
                style={inputStyle}
              />
              <input
                required
                placeholder="Last name"
                value={customerInfo.lastName}
                onChange={(e) => setCustomerInfo((c) => ({ ...c, lastName: e.target.value }))}
                className="rounded border px-4 py-3 text-sm"
                style={inputStyle}
              />
            </div>
            <input
              required
              type="email"
              placeholder="Email"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo((c) => ({ ...c, email: e.target.value }))}
              className="rounded border px-4 py-3 text-sm"
              style={inputStyle}
            />
            <SectionSubmitButton>Continue to shipping</SectionSubmitButton>
          </form>
        </CheckoutSection>

        {/* Step 2: Shipping address */}
        <CheckoutSection
          number="02"
          title="Shipping Address"
          isActive={step === "shipping"}
          isComplete={step !== "info" && step !== "shipping"}
          summary={
            step !== "info" && step !== "shipping"
              ? `${shippingAddress.address1}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postcode}`
              : null
          }
          onEdit={() => setStep("shipping")}
        >
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleShippingSubmit();
            }}
          >
            <input
              required
              placeholder="Address"
              value={shippingAddress.address1}
              onChange={(e) => setShippingAddress((a) => ({ ...a, address1: e.target.value }))}
              className="rounded border px-4 py-3 text-sm"
              style={inputStyle}
            />
            <input
              placeholder="Apartment, suite, etc. (optional)"
              value={shippingAddress.address2}
              onChange={(e) => setShippingAddress((a) => ({ ...a, address2: e.target.value }))}
              className="rounded border px-4 py-3 text-sm"
              style={inputStyle}
            />
            <div className="grid grid-cols-3 gap-4">
              <input
                required
                placeholder="City"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress((a) => ({ ...a, city: e.target.value }))}
                className="col-span-1 rounded border px-4 py-3 text-sm"
                style={inputStyle}
              />
              <input
                required
                placeholder="State"
                maxLength={2}
                value={shippingAddress.state}
                onChange={(e) => setShippingAddress((a) => ({ ...a, state: e.target.value.toUpperCase() }))}
                className="col-span-1 rounded border px-4 py-3 text-sm uppercase"
                style={inputStyle}
              />
              <input
                required
                placeholder="ZIP"
                value={shippingAddress.postcode}
                onChange={(e) => setShippingAddress((a) => ({ ...a, postcode: e.target.value }))}
                className="col-span-1 rounded border px-4 py-3 text-sm"
                style={inputStyle}
              />
            </div>
            <input
              placeholder="Phone (optional)"
              value={shippingAddress.phone}
              onChange={(e) => setShippingAddress((a) => ({ ...a, phone: e.target.value }))}
              className="rounded border px-4 py-3 text-sm"
              style={inputStyle}
            />
            <p className="text-xs" style={{ color: "var(--pl-muted)" }}>
              We ship within the United States only.
            </p>
            {addressError && (
              <p className="text-xs" style={{ color: "var(--pl-slate)" }}>
                {addressError}
              </p>
            )}
            <SectionSubmitButton disabled={isSubmittingAddress}>
              {isSubmittingAddress ? "Saving…" : "Continue to review"}
            </SectionSubmitButton>
          </form>
        </CheckoutSection>

        {/* Step 3: Order review */}
        <CheckoutSection
          number="03"
          title="Order Review"
          isActive={step === "review"}
          isComplete={step === "payment"}
          summary={null}
          onEdit={() => setStep("review")}
        >
          <OrderReview cart={cart} onContinue={() => setStep("payment")} />
        </CheckoutSection>

        {/* Step 4: Payment */}
        <CheckoutSection number="04" title="Payment" isActive={step === "payment"} isComplete={false} summary={null}>
          {paymentError && (
            <p className="mb-3 text-xs" style={{ color: "var(--pl-slate)" }}>
              {paymentError}
            </p>
          )}
          <PaymentStepStub
            amountCents={Number(cart.totals.total_price)}
            currencyCode={cart.totals.currency_symbol}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </CheckoutSection>
      </div>
    </main>
  );
}

function OrderReview({ cart, onContinue }: { cart: NonNullable<ReturnType<typeof useCart>["cart"]>; onContinue: () => void }) {
  const selectedRate = cart.shipping_rates[0]?.shipping_rates.find((r) => r.selected);

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-3">
        {cart.items.map((item) => (
          <li key={item.key} className="flex items-center justify-between text-sm">
            <span style={{ color: "var(--pl-slate)" }}>
              {item.name} × {item.quantity}
            </span>
            <span style={{ color: "var(--pl-navy)" }}>{formatMoney(item.totals.line_total)}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2 border-t pt-4 text-sm" style={{ borderColor: "var(--pl-border)" }}>
        <div className="flex items-center justify-between" style={{ color: "var(--pl-slate)" }}>
          <span>Subtotal</span>
          <span>{formatMoney(cart.totals.total_items)}</span>
        </div>
        {cart.fees.map((fee) => (
          <div key={fee.key} className="flex items-center justify-between" style={{ color: "var(--pl-slate)" }}>
            <span>{fee.name}</span>
            <span>{formatMoney(fee.totals.total)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between" style={{ color: "var(--pl-slate)" }}>
          <span>Shipping</span>
          <span>{selectedRate ? formatMoney(selectedRate.price) : "—"}</span>
        </div>
        {cart.totals.tax_lines.length > 0
          ? cart.totals.tax_lines.map((tax) => (
              <div key={tax.name} className="flex items-center justify-between" style={{ color: "var(--pl-slate)" }}>
                <span>
                  {tax.name} ({tax.rate})
                </span>
                <span>{formatMoney(tax.price)}</span>
              </div>
            ))
          : Number(cart.totals.total_tax) > 0 && (
              <div className="flex items-center justify-between" style={{ color: "var(--pl-slate)" }}>
                <span>Tax</span>
                <span>{formatMoney(cart.totals.total_tax)}</span>
              </div>
            )}
        <div
          className="mt-2 flex items-center justify-between border-t pt-2 text-base font-medium"
          style={{ borderColor: "var(--pl-border)", color: "var(--pl-navy)" }}
        >
          <span>Total</span>
          <span>{formatMoney(cart.totals.total_price)}</span>
        </div>
      </div>

      <SectionSubmitButton onClick={onContinue}>Continue to payment</SectionSubmitButton>
    </div>
  );
}

function CheckoutSection({
  number,
  title,
  isActive,
  isComplete,
  summary,
  onEdit,
  children,
}: {
  number: string;
  title: string;
  isActive: boolean;
  isComplete: boolean;
  summary: string | null;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-lg border p-6"
      style={{
        borderColor: isActive ? "var(--pl-border-strong)" : "var(--pl-border)",
        backgroundColor: "var(--pl-white)",
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <span className="text-xs font-semibold" style={{ color: "var(--pl-muted)" }}>
            {number}
          </span>
          <h2
            className="text-xl"
            style={{ color: "var(--pl-navy)", fontFamily: "var(--pl-font-display)", fontWeight: 500 }}
          >
            {title}
          </h2>
        </div>
        {isComplete && onEdit && (
          <button
            onClick={onEdit}
            className="text-xs underline-offset-2 hover:opacity-70"
            style={{ color: "var(--pl-slate)" }}
          >
            Edit
          </button>
        )}
      </div>

      {isComplete && summary && (
        <p className="text-sm" style={{ color: "var(--pl-text-secondary)" }}>
          {summary}
        </p>
      )}

      {isActive && children}
    </section>
  );
}

function SectionSubmitButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type={onClick ? "button" : "submit"}
      onClick={onClick}
      disabled={disabled}
      className="mt-2 rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
      style={{ backgroundColor: "var(--pl-navy)", color: "var(--pl-ivory)" }}
    >
      {children}
    </button>
  );
}
