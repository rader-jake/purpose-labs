import "server-only";
import type { AddressInput } from "./types";

// Thin server-only client for WooCommerce's Store API (wp-json/wc/store/v1).
//
// This is NOT called directly from the browser. The Store API's CORS policy
// on purposelabs.shop is locked to a single allowed origin (the legacy
// ByteNFT payment gateway's domain) and does not reflect our frontend's
// origin, so a browser fetch straight to WooCommerce would be blocked. The
// Next.js Route Handlers under src/app/api/cart/* proxy through this module
// instead — server-to-server has no CORS restriction, and it lets us hold
// the session's Cart-Token/Nonce in our own domain's httpOnly cookies rather
// than exposing them to client JS.

export interface CartTokens {
  cartToken?: string;
  nonce?: string;
}

export class StoreApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "StoreApiError";
    this.status = status;
    this.body = body;
  }
}

// EXPERIMENT — attempt to reduce false-positive bot-detection hits from
// SiteGround's "AI Anti-Bot" (confirmed via production logs: intermittent
// /.well-known/sgcaptcha/ interstitials instead of the real API response).
// Node's default fetch User-Agent is a well-known bot signature; a
// realistic browser one is a cheap, reversible thing to try first. Not
// guaranteed to fully resolve it — a hosting-side allowlist may still be
// needed in parallel.
const REALISTIC_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

function getStoreApiBase() {
  const url = "https://joshuar120.sg-host.com"; // Hardcoded: env var may be set to wrong domain in Vercel
  return `${url.replace(/\/+$/, "")}/wp-json/wc/store/v1`;
}

async function storeApiFetch(
  path: string,
  tokens: CartTokens,
  init: RequestInit = {}
): Promise<{ data: unknown; tokens: CartTokens }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": REALISTIC_USER_AGENT,
  };
  if (tokens.cartToken) headers["Cart-Token"] = tokens.cartToken;
  if (tokens.nonce) headers["Nonce"] = tokens.nonce;

  const targetUrl = `${getStoreApiBase()}${path}`;
  const response = await fetch(targetUrl, {
    ...init,
    headers,
    cache: "no-store",
  });

  const nextTokens: CartTokens = {
    cartToken: response.headers.get("Cart-Token") ?? tokens.cartToken,
    nonce: response.headers.get("Nonce") ?? tokens.nonce,
  };

  // Read as text first, not response.json() directly — the body can only
  // be consumed once, and this way we can inspect/log the raw payload
  // regardless of whether it turns out to be valid JSON.
  const contentType = response.headers.get("content-type") ?? "";
  const rawBody = await response.text();

  // TEMPORARY DIAGNOSTIC LOGGING — for the production 500 on
  // /api/cart/add-item ("Unexpected token '<' ... is not valid JSON").
  // Remove once root-caused. Never logs the consumer key/secret, only the
  // resolved store URL (public) and response metadata.
  console.log("[storeApiFetch] diagnostic", {
    woocommerceUrl: "https://joshuar120.sg-host.com",
    targetUrl,
    status: response.status,
    contentType,
    bodyPreview: rawBody.slice(0, 300),
  });

  if (!contentType.includes("application/json")) {
    console.error(
      `[storeApiFetch] Non-JSON response from WooCommerce Store API — status=${response.status} url=${targetUrl} contentType="${contentType}" bodyPreview=${JSON.stringify(rawBody.slice(0, 300))}`
    );
    throw new StoreApiError(
      "The store's checkout service returned an unexpected response. Please try again in a moment.",
      response.status || 502,
      { targetUrl, contentType, bodyPreview: rawBody.slice(0, 300) }
    );
  }

  let data: unknown;
  try {
    data = JSON.parse(rawBody);
  } catch (parseError) {
    // Belt-and-suspenders: some misconfigured proxies/WAFs send
    // `content-type: application/json` on an HTML error page, so the
    // header check above isn't a total guarantee.
    console.error(
      `[storeApiFetch] Body claimed to be JSON but failed to parse — status=${response.status} url=${targetUrl} bodyPreview=${JSON.stringify(rawBody.slice(0, 300))}`,
      parseError
    );
    throw new StoreApiError(
      "The store's checkout service returned an invalid response. Please try again in a moment.",
      response.status || 502,
      { targetUrl, bodyPreview: rawBody.slice(0, 300) }
    );
  }

  if (!response.ok) {
    const message =
      typeof (data as { message?: unknown } | null)?.message === "string"
        ? (data as { message: string }).message
        : "Store API error";
    throw new StoreApiError(message, response.status, data);
  }

  return { data, tokens: nextTokens };
}

/**
 * Fetching the cart with no tokens starts a fresh anonymous session and
 * returns a new Cart-Token/Nonce pair — this doubles as session bootstrap.
 */
export function getCart(tokens: CartTokens) {
  return storeApiFetch("/cart", tokens, { method: "GET" });
}

/**
 * Mutating endpoints require a valid Nonce. Callers must ensure `tokens`
 * came from a prior getCart()/mutation response, not passed in empty.
 */
export function addCartItem(tokens: CartTokens, id: number, quantity: number) {
  return storeApiFetch("/cart/add-item", tokens, {
    method: "POST",
    body: JSON.stringify({ id, quantity }),
  });
}

export function updateCartItem(tokens: CartTokens, key: string, quantity: number) {
  return storeApiFetch("/cart/update-item", tokens, {
    method: "POST",
    body: JSON.stringify({ key, quantity }),
  });
}

export function removeCartItem(tokens: CartTokens, key: string) {
  return storeApiFetch("/cart/remove-item", tokens, {
    method: "POST",
    body: JSON.stringify({ key }),
  });
}

/**
 * Updates the cart's customer/shipping address. Returns the full cart with
 * shipping_rates and totals recalculated for the new destination — this is
 * how the order-review step gets a real shipping total instead of whatever
 * the session's default (unset) address would have produced.
 */
export function updateCustomer(
  tokens: CartTokens,
  addresses: { shipping_address: AddressInput; billing_address: AddressInput }
) {
  return storeApiFetch("/cart/update-customer", tokens, {
    method: "POST",
    body: JSON.stringify(addresses),
  });
}

/**
 * Verified directly against the live site (OPTIONS + real apply/remove
 * calls): both endpoints take a single `{ code }` body field and return
 * the full cart, same as every other cart mutation here. An invalid or
 * expired code comes back as a normal Store API 400
 * (woocommerce_rest_cart_coupon_error) with a human-readable `message`,
 * which storeApiFetch already turns into a StoreApiError — no special
 * handling needed beyond what every other route already gets.
 */
export function applyCoupon(tokens: CartTokens, code: string) {
  return storeApiFetch("/cart/apply-coupon", tokens, {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export function removeCoupon(tokens: CartTokens, code: string) {
  return storeApiFetch("/cart/remove-coupon", tokens, {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

/**
 * Submits the actual order + payment. Verified directly against the live
 * site: this creates a real WooCommerce order immediately (status
 * "pending") and returns payment_result.redirect_url pointing at Tagada's
 * hosted checkout (checkout.purposelabs.shop) — order-before-payment, with
 * WooCommerce as the source of truth. The browser needs to navigate to
 * that redirect_url; this function only gets it, it doesn't redirect.
 *
 * extensions/payment_data are optional passthroughs — Beacon (unlike
 * Tagada) needs both: extensions["beacon-checkout"] for the RUO
 * attestation block, payment_data for the confirmed Stripe PaymentIntent
 * id once client-side confirmation has happened.
 */
export function submitCheckout(
  tokens: CartTokens,
  payload: {
    billing_address: AddressInput;
    shipping_address: AddressInput;
    payment_method: string;
    payment_data?: Array<{ key: string; value: string }>;
    extensions?: Record<string, unknown>;
  }
) {
  return storeApiFetch("/checkout", tokens, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
