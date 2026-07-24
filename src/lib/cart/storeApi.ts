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

function getStoreApiBase() {
  const url = process.env.WOOCOMMERCE_URL;
  if (!url) {
    throw new Error("Missing WOOCOMMERCE_URL in .env.local");
  }
  return `${url.replace(/\/+$/, "")}/wp-json/wc/store/v1`;
}

async function storeApiFetch(
  path: string,
  tokens: CartTokens,
  init: RequestInit = {}
): Promise<{ data: unknown; tokens: CartTokens }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (tokens.cartToken) headers["Cart-Token"] = tokens.cartToken;
  if (tokens.nonce) headers["Nonce"] = tokens.nonce;

  const response = await fetch(`${getStoreApiBase()}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const nextTokens: CartTokens = {
    cartToken: response.headers.get("Cart-Token") ?? tokens.cartToken,
    nonce: response.headers.get("Nonce") ?? tokens.nonce,
  };

  const data = await response.json();

  if (!response.ok) {
    throw new StoreApiError(
      typeof data?.message === "string" ? data.message : "Store API error",
      response.status,
      data
    );
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
