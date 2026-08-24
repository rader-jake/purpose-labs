import { NextRequest, NextResponse } from "next/server";

const PIXEL_ID = process.env.TIKTOK_PIXEL_ID!;
const ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN!;
const TT_API_URL = `https://business-api.tiktok.com/open_api/v1.3/event/track/`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, event_id, properties, user } = body;

    const payload = {
      pixel_code: PIXEL_ID,
      event,
      event_id,
      timestamp: new Date().toISOString(),
      context: {
        user_agent: req.headers.get("user-agent") || "",
        ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "",
        page: {
          url: properties?.url || "",
          referrer: req.headers.get("referer") || "",
        },
      },
      properties: {
        currency: properties?.currency || "USD",
        value: properties?.value,
        content_id: properties?.content_id,
        content_name: properties?.content_name,
        content_type: properties?.content_type || "product",
        quantity: properties?.quantity,
        order_id: properties?.order_id,
      },
      user: user || {},
    };

    const res = await fetch(TT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": ACCESS_TOKEN,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[TikTok Events API]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
