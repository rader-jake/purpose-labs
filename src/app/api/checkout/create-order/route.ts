import { NextRequest, NextResponse } from "next/server";
import { sendTikTokEvent } from "@/lib/tiktok-events";

const WP_BASE = "https://joshuar120.sg-host.com";
const WC_KEY = "ck_a1f40e9cce84ad42533a358083d6b819b670d7c9";
const WC_SECRET = "cs_7964f8082bcbe98d4688a0697eb40a611b538de8";
const AUTH = "Basic " + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      payment_intent_id: string;
      billing_address?: Record<string, string>;
      shipping_address?: Record<string, string>;
      line_items?: Array<{ product_id: number; quantity: number; variation_id?: number }>;
      amount_minor?: number;
      currency?: string;
    };

    const { payment_intent_id, billing_address, shipping_address, line_items, amount_minor } = body;

    if (!payment_intent_id) {
      return NextResponse.json({ message: "payment_intent_id is required" }, { status: 400 });
    }

    // Build WooCommerce order payload
    const orderPayload: Record<string, unknown> = {
      payment_method: "stripe",
      payment_method_title: "Credit / Debit Card",
      set_paid: true,
      transaction_id: payment_intent_id,
      status: "processing",
      billing: billing_address ? {
        first_name: billing_address.first_name ?? "",
        last_name: billing_address.last_name ?? "",
        email: billing_address.email ?? "",
        address_1: billing_address.address_1 ?? "",
        address_2: billing_address.address_2 ?? "",
        city: billing_address.city ?? "",
        state: billing_address.state ?? "",
        postcode: billing_address.postcode ?? "",
        country: billing_address.country ?? "US",
        phone: billing_address.phone ?? "",
      } : undefined,
      shipping: shipping_address ? {
        first_name: shipping_address.first_name ?? "",
        last_name: shipping_address.last_name ?? "",
        address_1: shipping_address.address_1 ?? "",
        address_2: shipping_address.address_2 ?? "",
        city: shipping_address.city ?? "",
        state: shipping_address.state ?? "",
        postcode: shipping_address.postcode ?? "",
        country: shipping_address.country ?? "US",
        phone: shipping_address.phone ?? "",
      } : undefined,
      line_items: line_items ?? [],
      meta_data: [
        { key: "_stripe_payment_intent", value: payment_intent_id },
      ],
    };

    const wcRes = await fetch(`${WP_BASE}/wp-json/wc/v3/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": AUTH,
      },
      body: JSON.stringify(orderPayload),
      cache: "no-store",
    });

    const data = await wcRes.json() as Record<string, unknown>;

    if (!wcRes.ok) {
      console.error("[create-order] WC API error:", data);
      // Still return success with payment_intent_id so customer sees confirmation
      return NextResponse.json({ order_id: payment_intent_id, wc_error: data }, { status: 200 });
    }

    // Fire TikTok purchase event
    sendTikTokEvent({
      eventName: "CompletePayment",
      eventId: `order_${String(data.id ?? payment_intent_id)}`,
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
      pageUrl: request.headers.get("referer") ?? undefined,
      email: billing_address?.email,
      value: amount_minor ? amount_minor / 100 : undefined,
      orderId: String(data.id ?? payment_intent_id),
    }).catch((e) => console.error("[TikTok] event failed:", e));

    return NextResponse.json({ order_id: data.id });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
