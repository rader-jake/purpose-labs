import type { AddressInput, Cart, CartFee, CartItem, CartTotals } from "@/lib/cart/types";

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
