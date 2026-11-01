import { NextRequest, NextResponse } from "next/server";
import { sendTikTokEvent } from "@/lib/tiktok-events";
import { cookies } from "next/headers";

const WP_BASE = "https://joshuar120.sg-host.com";
const WC_KEY = "ck_a1f40e9cce84ad42533a358083d6b819b670d7c9";
const WC_SECRET = "cs_7964f8082bcbe98d4688a0697eb40a611b538de8";
const AUTH = "Basic " + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");

const TELEGRAM_BOT_TOKEN = "8713242356:AAFmo0Kn90HqFVwmHBDl_BZLJ4QjSQsZ81g";
const TELEGRAM_CHAT_ID = "-1003911597013";
const TELEGRAM_TOPIC_ID = 297; // Website topic

async function sendTelegramAlert(message: string) {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        message_thread_id: TELEGRAM_TOPIC_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });
  } catch (e) {
    console.error("[telegram-alert] failed:", e);
  }
}

async function createWCOrder(orderPayload: Record<string, unknown>, retries = 2): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  for (let attempt = 1; attempt <= retries; attempt++) {
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
    if (wcRes.ok) return { ok: true, data };
    console.error(`[create-order] WC API error (attempt ${attempt}/${retries}):`, data);
    if (attempt < retries) await new Promise((r) => setTimeout(r, 1500 * attempt));
    if (attempt === retries) return { ok: false, data };
  }
  return { ok: false, data: {} };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      payment_intent_id: string;
      billing_address?: Record<string, string>;
      shipping_address?: Record<string, string>;
      line_items?: Array<{ product_id: number; quantity: number; variation_id?: number }>;
      coupon_lines?: string[];
      amount_minor?: number;
      currency?: string;
      aff_id?: string;
    };

    const { payment_intent_id, billing_address, shipping_address, line_items, coupon_lines, amount_minor, aff_id } = body;

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
      line_items: await (async () => {
        // Read BOGO free picks from cookie
        const store = await cookies();
        const bogoRaw = store.get("pl_bogo_free_ids")?.value;
        const bogoFreeIds: number[] = bogoRaw ? JSON.parse(bogoRaw) : [];
        const bogoFreeRemaining = new Map<number, number>();
        for (const id of bogoFreeIds) {
          bogoFreeRemaining.set(id, (bogoFreeRemaining.get(id) ?? 0) + 1);
        }
        const BOGO_DEDUP_EXCLUDED = new Set([94, 837, 840, 842, 846, 848]);
        return (line_items ?? []).map((item) => {
          if (BOGO_DEDUP_EXCLUDED.has(item.product_id)) return item;
          const remaining = bogoFreeRemaining.get(item.product_id) ?? 0;
          if (remaining > 0) {
            bogoFreeRemaining.set(item.product_id, remaining - 1);
            return { ...item, subtotal: "0", total: "0", meta_data: [{ key: "Promotion", value: "BOGO Free" }] };
          }
          return item;
        });
      })(),
      coupon_lines: (coupon_lines ?? []).map((code) => ({ code })),
      meta_data: [
        { key: "_stripe_payment_intent", value: payment_intent_id },
        ...(aff_id ? [
          { key: "_affiliatly_ref", value: aff_id },
          { key: "affiliatly_ref", value: aff_id },
        ] : []),
      ],
    };

    const { ok: wcOk, data } = await createWCOrder(orderPayload);

    if (!wcOk) {
      // Alert via Telegram — payment charged but order not in WooCommerce
      const name = `${billing_address?.first_name ?? ""} ${billing_address?.last_name ?? ""}`.trim() || "Unknown";
      const email = billing_address?.email ?? "unknown";
      const amount = amount_minor ? `$${(amount_minor / 100).toFixed(2)}` : "unknown amount";
      await sendTelegramAlert(
        `⚠️ <b>MISSED ORDER — Action Required</b>\n\n` +
        `Customer <b>${name}</b> (${email}) paid <b>${amount}</b> on Stripe but the WooCommerce order failed to create after 2 attempts.\n\n` +
        `<b>Stripe Payment Intent:</b> <code>${payment_intent_id}</code>\n\n` +
        `You need to manually create this order in WooCommerce. The customer has been charged.`
      );
      console.error("[create-order] WC order creation failed after retries. Telegram alert sent.", payment_intent_id);
      // Still return success so customer sees confirmation — they paid and it went through on Stripe
      return NextResponse.json({ order_id: payment_intent_id, wc_error: data }, { status: 200 });
    }

    // Track affiliate sale in Affiliatly
    if (aff_id && wcOk) {
      try {
        const affId = parseInt(aff_id, 10);
        const orderId = String(data.id ?? payment_intent_id);
        const orderTotal = amount_minor ? (amount_minor / 100).toFixed(2) : "0.00";
        const couponStr = (coupon_lines ?? []).join(",");
        const emailStr = billing_address?.email ?? "";
        const affBody = new URLSearchParams({
          mode: "mark_php",
          id_affiliatly: "AF-1074151",
          id_user: "0",
          id_hash: "",
          aff_uid: String(affId),
          order: orderId,
          price: orderTotal,
          from: "php",
          hash: "fa08a8afbe2c98444b7feddfc00625e2",
          coupon_code: couponStr,
          skus: "[]",
          client_email: emailStr,
        });
        await fetch("https://www.affiliatly.com/api_request.php", {
          method: "POST",
          body: affBody.toString(),
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        // Also fire order status = 2 (approved)
        const affStatusBody = new URLSearchParams({
          mode: "order_status",
          id_affiliatly: "AF-1074151",
          order: orderId,
          status: "2",
          hash: "fa08a8afbe2c98444b7feddfc00625e2",
        });
        await fetch("https://www.affiliatly.com/api_request.php", {
          method: "POST",
          body: affStatusBody.toString(),
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        console.log("[affiliatly] tracked order", orderId, "for affiliate", affId);
      } catch (e) {
        console.error("[affiliatly] tracking failed:", e);
      }
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
