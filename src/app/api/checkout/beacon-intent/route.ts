import { NextRequest, NextResponse } from "next/server";
import { StoreApiError } from "@/lib/cart/storeApi";

const WP_BASE = "https://joshuar120.sg-host.com";

async function fetchBeaconNonces(): Promise<{ wpRestNonce: string }> {
  const response = await fetch(`${WP_BASE}/wp-json/purpose-labs/v1/beacon-nonce`, {
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
  if (!data.wp_rest_nonce) {
    throw new StoreApiError("Security token endpoint returned an unexpected response.", 502, data);
  }
  return { wpRestNonce: data.wp_rest_nonce };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      amountCents?: number;
      currencyCode?: string;
      cart_token?: string | null;
    };

    const { amountCents, currencyCode, cart_token } = body;

    if (typeof amountCents !== "number" || !currencyCode) {
      return NextResponse.json(
        { message: "amountCents and currencyCode are required" },
        { status: 400 }
      );
    }

    const { wpRestNonce } = await fetchBeaconNonces();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "X-WP-Nonce": wpRestNonce,
    };

    // Forward Cart-Token in header if available — Beacon uses this to
    // associate the payment intent with the correct cart session
    if (cart_token) headers["Cart-Token"] = cart_token;

    const wpRes = await fetch(`${WP_BASE}/wp-json/beacon-checkout/v1/payment-intent`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        amount_minor: amountCents,
        currency: currencyCode.toLowerCase(),
        ...(cart_token ? { cart_token } : {}),
      }),
      cache: "no-store",
    });

    const rawBody = await wpRes.text();
    return new NextResponse(rawBody, {
      status: wpRes.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof StoreApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
