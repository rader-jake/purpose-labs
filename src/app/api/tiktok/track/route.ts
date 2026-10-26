import { NextRequest, NextResponse } from "next/server";

const PIXEL_CODE = "DBFN6OBC77U4J2JQG780";
const TIKTOK_ENDPOINT =
  "https://business-api.tiktok.com/open_api/v1.3/pixel/track/";

const ALLOWED_EVENTS = new Set([
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
  "AddPaymentInfo",
  "Purchase",
  "CompleteRegistration",
  "Search",
]);

export async function POST(req: NextRequest) {
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json({ error: "Missing access token" }, { status: 500 });
  }

  let body: { event?: string; properties?: Record<string, unknown>; event_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event, properties = {}, event_id } = body;

  if (!event || !ALLOWED_EVENTS.has(event)) {
    return NextResponse.json({ error: "Invalid or missing event" }, { status: 400 });
  }

  // Enrich with server-side context
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "0.0.0.0";
  const userAgent = req.headers.get("user-agent") || "";

  const timestamp = new Date().toISOString();

  const payload = {
    pixel_code: PIXEL_CODE,
    event,
    event_id: event_id ?? undefined,
    timestamp,
    context: {
      page: {
        url: (properties.page_url as string) || "",
      },
      ip,
      user_agent: userAgent,
    },
    properties: {
      ...properties,
    },
  };

  // Remove page_url from properties if it was passed (it belongs in context)
  delete (payload.properties as Record<string, unknown>).page_url;

  try {
    const res = await fetch(TIKTOK_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": accessToken,
      },
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as { code?: number; message?: string };

    if (!res.ok || data.code !== 0) {
      console.error("[TikTok CAPI] Error response:", data);
      return NextResponse.json(
        { error: "TikTok API error", details: data },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, event, event_id: payload.event_id });
  } catch (err) {
    console.error("[TikTok CAPI] Fetch failed:", err);
    return NextResponse.json({ error: "Failed to reach TikTok API" }, { status: 502 });
  }
}
