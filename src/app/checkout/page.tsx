"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { formatMoney } from "@/lib/cart/money";
import { PaymentStepStub } from "@/components/checkout/PaymentStepStub";
import { TagadaPaymentStep } from "@/components/checkout/TagadaPaymentStep";
import { OrderConfirmation } from "@/components/checkout/OrderConfirmation";
import { buildMockOrderConfirmation, type OrderConfirmationData } from "@/lib/order/types";
import type { PaymentError, PaymentResult } from "@/lib/payment/types";

// Reversible, off-by-default gate — Tagada's WooCommerce gateway plugin has
// a confirmed pricing bug (bac water shows full price on its hosted page
// despite the underlying WooCommerce order being correct at $0), reported
// to Tagada separately and not fixed here. Do not flip this on in any
// environment that real customers can reach until that's resolved.
const ENABLE_TAGADA = process.env.NEXT_PUBLIC_ENABLE_TAGADA === "true";

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

const inputStyle = {
  borderColor: "var(--pl-border)",
  color: "var(--pl-navy)",
  fontFamily: "var(--pl-font-body)",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CheckoutPage() {
  const { cart, isLoading, updateCustomerAddress } = useCart();
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
  // Errors only start showing once the user has tried to proceed while
  // something's invalid — not from the moment the page loads.
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [isSyncingAddress, setIsSyncingAddress] = useState(false);
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

  function validateFields(): Partial<Record<FieldKey, string>> {
    const errors: Partial<Record<FieldKey, string>> = {};
    if (!customerInfo.firstName.trim()) errors.firstName = "First name is required";
    if (!customerInfo.lastName.trim()) errors.lastName = "Last name is required";
    if (!customerInfo.email.trim()) errors.email = "Email is required";
    else if (!EMAIL_PATTERN.test(customerInfo.email.trim())) errors.email = "Enter a valid email address";
    if (!shippingAddress.address1.trim()) errors.address1 = "Address is required";
    if (!shippingAddress.city.trim()) errors.city = "City is required";
    if (shippingAddress.state.trim().length !== 2) errors.state = "Use a 2-letter state code";
    if (!shippingAddress.postcode.trim()) errors.postcode = "ZIP code is required";
    return errors;
  }

  // Derived, not stored — recomputed from current field values every
  // render so a field's error clears the instant it's corrected, rather
  // than lingering until another submit attempt.
  const currentErrors = validateFields();
  const isValid = Object.keys(currentErrors).length === 0;
  const fieldErrors = attemptedSubmit ? currentErrors : {};

  // Background sync so the order summary's shipping/tax stay accurate as
  // the address is completed — same updateCustomerAddress call the old
  // step-2-to-3 transition used to make, just triggered by leaving the
  // address fields instead of a step boundary. Not a prerequisite for a
  // correct final order: submitCheckout sends the address directly in
  // the same request regardless, so this is purely a live-preview
  // nicety, not something the real submission depends on.
  async function syncAddressIfComplete() {
    if (isSyncingAddress) return;
    const { address1, city, state, postcode } = shippingAddress;
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

  function handleAttemptSubmit() {
    setAttemptedSubmit(true);
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
  }

  function handlePaymentError(error: PaymentError) {
    setOrderConfirmation(null);
    setPaymentError(error.message);
  }

  if (orderConfirmation) {
    return <OrderConfirmation data={orderConfirmation} />;
  }

  const selectedRate = cart.shipping_rates[0]?.shipping_rates.find((r) => r.selected);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:px-10" style={{ fontFamily: "var(--pl-font-body)" }}>
      <h1
        className="mb-10 text-4xl sm:text-5xl"
        style={{ color: "var(--pl-navy)", fontFamily: "var(--pl-font-display)", fontWeight: 500 }}
      >
        Checkout
      </h1>

      <div className="flex flex-col gap-6">
        {/* Contact */}
        <CheckoutCard title="Contact">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                placeholder="First name"
                value={customerInfo.firstName}
                onChange={(e) => setCustomerInfo((c) => ({ ...c, firstName: e.target.value }))}
                className="w-full rounded border px-4 py-3 text-sm"
                style={inputStyle}
              />
              <FieldError message={fieldErrors.firstName} />
            </div>
            <div>
              <input
                placeholder="Last name"
                value={customerInfo.lastName}
                onChange={(e) => setCustomerInfo((c) => ({ ...c, lastName: e.target.value }))}
                className="w-full rounded border px-4 py-3 text-sm"
                style={inputStyle}
              />
              <FieldError message={fieldErrors.lastName} />
            </div>
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo((c) => ({ ...c, email: e.target.value }))}
              className="w-full rounded border px-4 py-3 text-sm"
              style={inputStyle}
            />
            <FieldError message={fieldErrors.email} />
          </div>
        </CheckoutCard>

        {/* Shipping Address */}
        <CheckoutCard title="Shipping Address">
          <div>
            <input
              placeholder="Address"
              value={shippingAddress.address1}
              onChange={(e) => setShippingAddress((a) => ({ ...a, address1: e.target.value }))}
              onBlur={syncAddressIfComplete}
              className="w-full rounded border px-4 py-3 text-sm"
              style={inputStyle}
            />
            <FieldError message={fieldErrors.address1} />
          </div>
          <input
            placeholder="Apartment, suite, etc. (optional)"
            value={shippingAddress.address2}
            onChange={(e) => setShippingAddress((a) => ({ ...a, address2: e.target.value }))}
            onBlur={syncAddressIfComplete}
            className="rounded border px-4 py-3 text-sm"
            style={inputStyle}
          />
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <input
                placeholder="City"
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress((a) => ({ ...a, city: e.target.value }))}
                onBlur={syncAddressIfComplete}
                className="w-full rounded border px-4 py-3 text-sm"
                style={inputStyle}
              />
              <FieldError message={fieldErrors.city} />
            </div>
            <div className="col-span-1">
              <input
                placeholder="State"
                maxLength={2}
                value={shippingAddress.state}
                onChange={(e) => setShippingAddress((a) => ({ ...a, state: e.target.value.toUpperCase() }))}
                onBlur={syncAddressIfComplete}
                className="w-full rounded border px-4 py-3 text-sm uppercase"
                style={inputStyle}
              />
              <FieldError message={fieldErrors.state} />
            </div>
            <div className="col-span-1">
              <input
                placeholder="ZIP"
                value={shippingAddress.postcode}
                onChange={(e) => setShippingAddress((a) => ({ ...a, postcode: e.target.value }))}
                onBlur={syncAddressIfComplete}
                className="w-full rounded border px-4 py-3 text-sm"
                style={inputStyle}
              />
              <FieldError message={fieldErrors.postcode} />
            </div>
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
        </CheckoutCard>

        {/* Order Summary */}
        <CheckoutCard title="Order Summary">
          <ul className="flex flex-col gap-3">
            {cart.items.map((item) => (
              <li key={item.key} className="flex items-center justify-between text-sm">
                <span style={{ color: "var(--pl-slate)" }}>
                  {item.name} × {item.quantity}
                </span>
                {/* Pre-discount, matching "Subtotal" below — line_total is
                    post-coupon and would visibly disagree with a Subtotal
                    that's the pre-discount total_items sum. The coupon's
                    own effect is shown separately as its own Discount
                    line instead. */}
                <span style={{ color: "var(--pl-navy)" }}>{formatMoney(item.totals.line_subtotal)}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2 border-t pt-4 text-sm" style={{ borderColor: "var(--pl-border)" }}>
            <div className="flex items-center justify-between" style={{ color: "var(--pl-slate)" }}>
              <span>Subtotal</span>
              <span>{formatMoney(cart.totals.total_items)}</span>
            </div>
            {cart.coupons.map((coupon) => (
              <div
                key={coupon.code}
                className="flex items-center justify-between"
                style={{ color: "var(--pl-slate)" }}
              >
                <span>Discount ({coupon.code.toUpperCase()})</span>
                <span>-{formatMoney(coupon.totals.total_discount)}</span>
              </div>
            ))}
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
                  <div
                    key={tax.name}
                    className="flex items-center justify-between"
                    style={{ color: "var(--pl-slate)" }}
                  >
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

          {isSyncingAddress && (
            <p className="text-xs" style={{ color: "var(--pl-muted)" }}>
              Updating shipping &amp; tax…
            </p>
          )}

          {/* Last chance to catch an address mistake before we hand off to
              Tagada's hosted page — once redirected there, we have no way to
              fix it. No autocomplete/validation on the address fields yet
              (future improvement), so this is a manual nudge instead. */}
          <p className="text-xs" style={{ color: "var(--pl-muted)" }}>
            Please double-check your shipping address before continuing — orders ship exactly as entered.
          </p>

          {paymentError && (
            <p className="text-xs" style={{ color: "var(--pl-slate)" }}>
              {paymentError}
            </p>
          )}

          {isValid ? (
            ENABLE_TAGADA ? (
              <TagadaPaymentStep
                amountCents={Number(cart.totals.total_price)}
                currencyCode={cart.totals.currency_symbol}
                billingAddress={{ ...buildAddressInput(), email: customerInfo.email }}
                shippingAddress={buildAddressInput()}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            ) : (
              <PaymentStepStub
                amountCents={Number(cart.totals.total_price)}
                currencyCode={cart.totals.currency_symbol}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            )
          ) : (
            <SectionSubmitButton onClick={handleAttemptSubmit}>Continue to Payment</SectionSubmitButton>
          )}
        </CheckoutCard>
      </div>
    </main>
  );
}

function CheckoutCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="flex flex-col gap-4 rounded-lg border p-6"
      style={{ borderColor: "var(--pl-border)", backgroundColor: "var(--pl-white)" }}
    >
      <h2
        className="text-xl"
        style={{ color: "var(--pl-navy)", fontFamily: "var(--pl-font-display)", fontWeight: 500 }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs" style={{ color: "var(--pl-slate)" }}>
      {message}
    </p>
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
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mt-2 rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
      style={{ backgroundColor: "var(--pl-navy)", color: "var(--pl-ivory)" }}
    >
      {children}
    </button>
  );
}
