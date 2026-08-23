import { NextRequest, NextResponse } from "next/server";
import { StoreApiError } from "@/lib/cart/storeApi";
import { readTokens } from "@/lib/cart/session";
import { sendTikTokEvent } from "@/lib/tiktok-events";

const WP_BASE = "https://joshuar120.sg-host.com";

async function fetchBeaconNonce(): Promise<string> {
  const response = await fetch(`${WP_BASE}/wp-json/purpose-labs/v1/beacon-nonce`, {
    cache: "no-store",
  });
  if (!response.ok) throw new StoreApiError("Could not mint nonce for wallet-order", response.status, {});
  const data = (await response.json()) as { wp_rest_nonce?: string };
  if (!data.wp_rest_nonce) throw new StoreApiError("Invalid nonce response", 502, data);
  return data.wp_rest_nonce;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      payment_intent_id: string;
      cart_token?: string | null;
      billing_address?: Record<string, string>;
      shipping_address?: Record<string, string>;
      amount_minor?: number;
      currency?: string;
    };

    const { payment_intent_id, cart_token, billing_address, shipping_address, amount_minor, currency } = body;

    if (!payment_intent_id) {
      return NextResponse.json({ message: "payment_intent_id is required" }, { status: 400 });
    }

    // Get cart token from server cookie as fallback
    const tokens = await readTokens();
    const effectiveCartToken = cart_token ?? tokens.cartToken;

    const nonce = await fetchBeaconNonce();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "X-WP-Nonce": nonce,
    };
    if (effectiveCartToken) headers["Cart-Token"] = effectiveCartToken;

    const wpRes = await fetch(`${WP_BASE}/wp-json/beacon-checkout/v1/wallet-order`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        payment_intent_id,
        ...(effectiveCartToken ? { cart_token: effectiveCartToken } : {}),
        ...(billing_address ? { billing_address } : {}),
        ...(shipping_address ? { shipping_address } : {}),
        ...(amount_minor ? { amount_minor } : {}),
        ...(currency ? { currency } : {}),
      }),
      cache: "no-store",
    });

    const rawBody = await wpRes.text();
    let data: unknown;
    try { data = JSON.parse(rawBody); } catch { data = {}; }

    if (wpRes.ok) {
      // Fire TikTok purchase event
      sendTikTokEvent({
        eventName: "CompletePayment",
        ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] ?? undefined,
        userAgent: request.headers.get("user-agent") ?? undefined,
        pageUrl: request.headers.get("referer") ?? undefined,
        email: billing_address?.email,
        value: amount_minor ? amount_minor / 100 : undefined,
        orderId: String((data as Record<string, unknown>)?.order_id ?? payment_intent_id),
      }).catch((e) => console.error("[TikTok] event failed:", e));
    }

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
