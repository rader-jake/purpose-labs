import { NextRequest, NextResponse } from "next/server";
import { sendTikTokEvent, type TikTokEventName } from "@/lib/tiktok-events";

const EVENT_NAMES: TikTokEventName[] = [
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
  "PlaceAnOrder",
  "CompletePayment",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, event_id, properties, user } = body as {
      event?: string;
      event_id?: string;
      properties?: Record<string, unknown>;
      user?: { email?: string; phone?: string };
    };
    if (!event || !EVENT_NAMES.includes(event as TikTokEventName)) {
      return NextResponse.json({ error: "Unsupported TikTok event" }, { status: 400 });
    }

    await sendTikTokEvent({
      eventName: event as TikTokEventName,
      eventId: event_id,
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
      pageUrl: typeof properties?.url === "string" ? properties.url : req.headers.get("referer") || undefined,
      email: user?.email,
      phone: user?.phone,
      currency: typeof properties?.currency === "string" ? properties.currency : undefined,
      value: typeof properties?.value === "number" ? properties.value : undefined,
      contentId: typeof properties?.content_id === "string" ? properties.content_id : undefined,
      contentName: typeof properties?.content_name === "string" ? properties.content_name : undefined,
      quantity: typeof properties?.quantity === "number" ? properties.quantity : undefined,
      orderId: typeof properties?.order_id === "string" ? properties.order_id : undefined,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[TikTok Events API]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
