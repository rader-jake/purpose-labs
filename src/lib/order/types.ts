import type { AddressInput, Cart, CartFee, CartItem, CartTotals } from "@/lib/cart/types";
import type { WooOrder, WooOrderAddress } from "@/lib/woocommerce";

// ---------------------------------------------------------------------------
// Reference: the real Store API checkout contract, verified against
// purposelabs.shop directly (GET/OPTIONS/POST probes against
// /wp-json/wc/store/v1/checkout), not assumed from training data.
//
// This type is NOT called anywhere yet — order creation isn't wired into
// the live flow (see checkout/page.tsx). It documents what a real
// integration will receive, so that work doesn't start from scratch.
//
// Verified facts:
// - `billing_address` is the only strictly-required top-level POST field
//   per the endpoint's own OPTIONS schema. `payment_method` isn't marked
//   required in the schema, but is enforced by business logic: posting
//   without one returns 400 `woocommerce_rest_checkout_missing_payment_method`.
// - The full set of payment_method IDs this WooCommerce install currently
//   recognizes (from the schema's enum): "", woocommerce_payments (+ its
//   affirm/afterpay/alipay/bancontact/becs/eps/giropay/grabpay/ideal/
//   multibanco/klarna/p24/sepa_debit/sofort/wechat_pay/apple_pay/
//   google_pay/amazon_pay variants), bacs, cheque, cod,
//   bankful_hosted_gateway, cashapp, veyragate_pay, bytenft, solruo,
//   tagada. Every one of these was tested by POSTing to /checkout with
//   a full address and that payment_method — all returned 400
//   `woocommerce_rest_checkout_payment_method_disabled` EXCEPT cashapp
//   and bytenft (which weren't tested to completion — see checkout/page.tsx
//   for why). So "tagada" is already a registered gateway on this store,
//   just not enabled yet, and BACS is registered but disabled too (the
//   old Elementor CSS rule hiding it was cosmetic, not evidence it was
//   live — confirmed by the API rejecting it outright).
// - A successful response's `payment_result.payment_details` shape is an
//   array of {key, value} pairs — gateway-specific, not typed further here.
// - `redirect_url` exists for gateways that need an off-site step
//   (hosted checkout pages, 3DS, etc.) — relevant for whatever Tagada's
//   flow turns out to require.
export interface CheckoutOrderResponse {
  order_id: number;
  status: string;
  order_key: string;
  order_number: string;
  customer_note: string;
  customer_id: number;
  billing_address: AddressInput;
  shipping_address: AddressInput;
  payment_method: string;
  payment_result: {
    payment_status: "success" | "pending" | "failure" | "error";
    payment_details: { key: string; value: string }[];
    redirect_url: string;
  } | null;
  // NOTE: the checkout draft response also includes a `__experimentalCart`
  // field carrying the full cart (items/totals/fees) — deliberately not
  // modeled here. The double-underscore prefix is WooCommerce's own
  // "this can change or disappear without notice" marker. Don't build
  // against it; get line items/totals from the client's own cart state
  // captured just before submission instead (see OrderConfirmationData
  // below), and use this response only for order_id/order_number/status/
  // payment_result — the fields actually declared in the endpoint schema.
}

/**
 * What the confirmation UI actually renders. Deliberately NOT the same
 * shape as CheckoutOrderResponse — see the note above on why line items
 * and totals should come from the cart snapshot rather than the
 * checkout response's experimental field.
 */
export interface OrderConfirmationData {
  orderNumber: string;
  status: string;
  paymentMethodLabel: string;
  billingAddress: AddressInput;
  shippingAddress: AddressInput;
  items: CartItem[];
  fees: CartFee[];
  totals: CartTotals;
}

/**
 * TEMPORARY mapping. Real order creation isn't wired in yet (gated on
 * Tagada's integration details — see checkout/page.tsx), so there's no
 * real CheckoutOrderResponse to map from. This builds the confirmation
 * data from the mock payment stub's result plus whatever the cart looked
 * like at the moment of (fake) success. Replace the body of this function
 * with real CheckoutOrderResponse -> OrderConfirmationData mapping once
 * checkout is actually wired — the OrderConfirmation component itself
 * shouldn't need to change.
 */
export function buildMockOrderConfirmation(
  cart: Cart,
  mockTransactionId: string,
  billingAddress: AddressInput,
  shippingAddress: AddressInput
): OrderConfirmationData {
  return {
    orderNumber: mockTransactionId,
    status: "mock-pending",
    paymentMethodLabel: "Payment stub (test mode)",
    billingAddress,
    shippingAddress,
    items: cart.items,
    fees: cart.fees,
    totals: cart.totals,
  };
}

// --- Real order -> confirmation mapping --------------------------------
//
// WooOrder (from src/lib/woocommerce.ts) carries decimal-dollar strings
// ("35.00"), matching the REST API v3 order schema. OrderConfirmationData
// (and the OrderConfirmation component that renders it) expects the Store
// API's cent-integer-string convention ("3500") instead, since that's what
// the rest of checkout already works in. toCents() bridges the two so
// OrderConfirmation.tsx doesn't need to know which source its data came
// from — verified it only reads item.key/name/quantity/totals.line_total
// per item, plus the totals object, so the fields below that aren't
// populated with real data (permalink, images, short_description) are
// safe to leave empty.

function toCents(dollars: string): string {
  return String(Math.round(parseFloat(dollars) * 100));
}

function mapOrderAddress(addr: WooOrderAddress): AddressInput {
  return {
    first_name: addr.first_name,
    last_name: addr.last_name,
    address_1: addr.address_1,
    address_2: addr.address_2,
    city: addr.city,
    state: addr.state,
    postcode: addr.postcode,
    country: addr.country,
    email: addr.email,
    phone: addr.phone,
  };
}

export function mapOrderToConfirmationData(order: WooOrder): OrderConfirmationData {
  const items: CartItem[] = order.lineItems.map((li) => ({
    key: String(li.id),
    id: li.id,
    quantity: li.quantity,
    quantity_limits: { minimum: 1, maximum: li.quantity, multiple_of: 1, editable: false },
    name: li.name,
    short_description: "",
    permalink: "",
    images: [],
    prices: {
      price: toCents(li.total),
      regular_price: toCents(li.total),
      sale_price: toCents(li.total),
      currency_minor_unit: 2,
      currency_symbol: "$",
    },
    totals: {
      line_subtotal: toCents(li.subtotal),
      line_subtotal_tax: toCents(li.subtotal_tax),
      line_total: toCents(li.total),
      line_total_tax: toCents(li.total_tax),
    },
  }));

  const fees: CartFee[] = order.feeLines.map((fee) => ({
    key: String(fee.id),
    name: fee.name,
    totals: {
      total: toCents(fee.total),
      total_tax: toCents(fee.total_tax),
    },
  }));

  const totalItems = order.lineItems.reduce((sum, li) => sum + parseFloat(li.subtotal), 0);
  const totalItemsTax = order.lineItems.reduce((sum, li) => sum + parseFloat(li.subtotal_tax), 0);
  const totalFees = order.feeLines.reduce((sum, fee) => sum + parseFloat(fee.total), 0);
  const totalFeesTax = order.feeLines.reduce((sum, fee) => sum + parseFloat(fee.total_tax), 0);

  const totals: CartTotals = {
    total_items: toCents(totalItems.toFixed(2)),
    total_items_tax: toCents(totalItemsTax.toFixed(2)),
    total_fees: toCents(totalFees.toFixed(2)),
    total_fees_tax: toCents(totalFeesTax.toFixed(2)),
    total_discount: toCents(order.discountTotal),
    total_discount_tax: toCents(order.discountTax),
    total_shipping: toCents(order.shippingTotal),
    total_shipping_tax: toCents(order.shippingTax),
    total_price: toCents(order.total),
    total_tax: toCents(order.totalTax),
    tax_lines: order.taxLines.map((t) => ({
      name: t.label,
      price: toCents(t.tax_total),
      rate: String(t.rate_percent),
    })),
    currency_minor_unit: 2,
    currency_symbol: "$",
  };

  return {
    orderNumber: order.number,
    status: order.status,
    paymentMethodLabel: order.paymentMethodTitle,
    billingAddress: mapOrderAddress(order.billing),
    shippingAddress: mapOrderAddress(order.shipping),
    items,
    fees,
    totals,
  };
}
