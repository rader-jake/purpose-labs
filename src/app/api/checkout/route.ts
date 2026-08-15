import { NextRequest, NextResponse } from "next/server";
import { submitCheckout, StoreApiError } from "@/lib/cart/storeApi";
import type { AddressInput } from "@/lib/cart/types";
import { ensureTokens, readTokens, writeTokens } from "@/lib/cart/session";
import { sendTikTokEvent } from "@/lib/tiktok-events";

export async function POST(request: NextRequest) {
  try {
    const { billing_address, shipping_address, payment_method, payment_data, extensions } =
      (await request.json()) as {
        billing_address?: AddressInput;
        shipping_address?: AddressInput;
        payment_method?: string;
        payment_data?: Array<{ key: string; value: string }>;
        extensions?: Record<string, unknown>;
      };
    if (!billing_address || !payment_method) {
      return NextResponse.json(
        { message: "billing_address and payment_method are required" },
        { status: 400 }
      );
    }

    const tokens = await ensureTokens(await readTokens());
    const { data, tokens: nextTokens } = await submitCheckout(tokens, {
      billing_address,
      shipping_address: shipping_address ?? billing_address,
      payment_method,
      payment_data,
      extensions,
    });
    await writeTokens(nextTokens);

    // Fire TikTok server-side purchase event
    sendTikTokEvent({
      eventName: "CompletePayment",
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0] ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
      pageUrl: request.headers.get("referer") ?? undefined,
      email: billing_address?.email,
      value: typeof data?.totals?.total_price === "string"
        ? parseFloat(data.totals.total_price) / 100
        : undefined,
      orderId: String(data?.order_id ?? ""),
    }).catch((e) => console.error("[TikTok] event failed:", e));

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof StoreApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
