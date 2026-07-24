import "server-only";
import { cookies } from "next/headers";
import { getCart, type CartTokens } from "./storeApi";

const CART_TOKEN_COOKIE = "wc_cart_token";
const NONCE_COOKIE = "wc_nonce";
// Matches the ~48h expiry WooCommerce puts on the Cart-Token JWT itself.
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 48;

export async function readTokens(): Promise<CartTokens> {
  const store = await cookies();
  return {
    cartToken: store.get(CART_TOKEN_COOKIE)?.value,
    nonce: store.get(NONCE_COOKIE)?.value,
  };
}

export async function writeTokens(tokens: CartTokens): Promise<void> {
  const store = await cookies();
  const options = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  };
  if (tokens.cartToken) store.set(CART_TOKEN_COOKIE, tokens.cartToken, options);
  if (tokens.nonce) store.set(NONCE_COOKIE, tokens.nonce, options);
}

/**
 * Mutating Store API calls need a valid Nonce. A first-time visitor has
 * none yet, so this bootstraps a session via a plain cart GET when either
 * token is missing before the caller performs its actual operation.
 */
export async function ensureTokens(tokens: CartTokens): Promise<CartTokens> {
  if (tokens.cartToken && tokens.nonce) return tokens;
  const bootstrapped = await getCart(tokens);
  return bootstrapped.tokens;
}
