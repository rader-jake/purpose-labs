/**
 * TikTok Events API — server-side integration
 * Pixel: DA09HT3C77UDBOEDNA70
 */

const PIXEL_ID = process.env.TIKTOK_PIXEL_ID!;
const ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN!;
const API_URL = `https://business-api.tiktok.com/open_api/v1.3/event/track/`;

export type TikTokEventName =
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "PlaceAnOrder"
  | "CompletePayment";

interface TikTokEventProps {
  eventName: TikTokEventName;
  eventId?: string; // for deduplication with browser pixel
  ipAddress?: string;
  userAgent?: string;
  pageUrl?: string;
  email?: string;
  phone?: string;
  currency?: string;
  value?: number;
  contentId?: string;
  contentName?: string;
  quantity?: number;
  orderId?: string;
}

function hashSHA256(value: string): string {
  // Use Node crypto — available in Next.js server context
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export async function sendTikTokEvent(props: TikTokEventProps): Promise<void> {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.warn("[TikTok Events] Missing TIKTOK_PIXEL_ID or TIKTOK_ACCESS_TOKEN");
    return;
  }

  const {
    eventName,
    eventId,
    ipAddress,
    userAgent,
    pageUrl,
    email,
    phone,
    currency = "USD",
    value,
    contentId,
    contentName,
    quantity,
    orderId,
  } = props;

  const userProperties: Record<string, string> = {};
  if (email) userProperties.email = hashSHA256(email);
  if (phone) userProperties.phone_number = hashSHA256(phone);
  if (ipAddress) userProperties.ip = ipAddress;
  if (userAgent) userProperties.user_agent = userAgent;

  const properties: Record<string, unknown> = { currency };
  if (value !== undefined) properties.value = value;
  if (contentId) properties.content_id = contentId;
  if (contentName) properties.content_name = contentName;
  if (quantity !== undefined) properties.quantity = quantity;
  if (orderId) properties.order_id = orderId;

  const payload = {
    pixel_code: PIXEL_ID,
    event: eventName,
    event_id: eventId ?? `${eventName}-${Date.now()}`,
    timestamp: new Date().toISOString(),
    context: {
      page: { url: pageUrl },
      user: userProperties,
    },
    properties,
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Access-Token": ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: [payload] }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[TikTok Events] API error:", res.status, text);
    }
  } catch (err) {
    console.error("[TikTok Events] Fetch failed:", err);
  }
}
