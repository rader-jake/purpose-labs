import "server-only";
import { StoreApiError } from "./storeApi";

// Server-only client for the beacon-checkout/v1 REST namespace (a plugin
// route, not part of Store API).
//
// Per Beacon's engineer: guest checkout doesn't need cookies/cart-session
// lookup — payment-intent takes amount_minor/currency directly in the
// body, authenticated via a fresh X-WP-Nonce minted server-side (not the
// Store API's own Cart-Token/Nonce pair, which is a separate mechanism
// confirmed NOT to satisfy this check). Since this headless frontend
// never renders a WordPress page for Beacon's plugin to embed a nonce
// into via wp_localize_script, a narrow WordPress-side endpoint
// (wordpress-snippets/beacon-nonce-endpoint.php) mints one on request.
//
// CONFIRMED live: wp_rest is the nonce action Beacon's endpoint accepts.
// wc_store_api was tested against the same live endpoint and rejected
// outright (403 rest_cookie_invalid_nonce, a different/earlier check than
// beacon_sc_bad_nonce — it never even reached Beacon's own validation).
// The WordPress snippet still mints and returns both nonce actions
// (harmless, no need to redeploy it just to trim the unused field), but
// only wp_rest_nonce is used here.

function getWordPressBase() {
  const url = process.env.WOOCOMMERCE_URL ?? "https://joshuar120.sg-host.com";
  return url.replace(/\/+$/, "");
}

function getBeaconApiBase() {
  return `${getWordPressBase()}/wp-json/beacon-checkout/v1`;
}

async function fetchBeaconNonces(): Promise<{ wpRestNonce: string; wcStoreApiNonce: string }> {
  const response = await fetch(`${getWordPressBase()}/wp-json/purpose-labs/v1/beacon-nonce`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new StoreApiError(
      "Could not mint a security token for payment. Please try again.",
      response.status,
      { endpoint: "purpose-labs/v1/beacon-nonce" }
    );
  }
  const data = (await response.json()) as { wp_rest_nonce?: string; wc_store_api_nonce?: string };
  if (!data.wp_rest_nonce || !data.wc_store_api_nonce) {
    throw new StoreApiError("Security token endpoint returned an unexpected response.", 502, data);
  }
  return { wpRestNonce: data.wp_rest_nonce, wcStoreApiNonce: data.wc_store_api_nonce };
}

async function postPaymentIntent(nonce: string, amountMinor: number, currency: string) {
  const response = await fetch(`${getBeaconApiBase()}/payment-intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-WP-Nonce": nonce },
    body: JSON.stringify({ amount_minor: amountMinor, currency }),
    cache: "no-store",
  });

  const rawBody = await response.text();
  let data: unknown;
  try {
    data = JSON.parse(rawBody);
  } catch {
    throw new StoreApiError("Beacon returned an invalid response.", response.status || 502, {
      bodyPreview: rawBody.slice(0, 300),
    });
  }

  if (!response.ok) {
    const message =
      typeof (data as { message?: unknown } | null)?.message === "string"
        ? (data as { message: string }).message
        : "Beacon payment-intent request failed";
    throw new StoreApiError(message, response.status, data);
  }

  return data;
}

export async function createBeaconPaymentIntent(amountMinor: number, currencyCode: string) {
  const { wpRestNonce } = await fetchBeaconNonces();
  return postPaymentIntent(wpRestNonce, amountMinor, currencyCode);
}
