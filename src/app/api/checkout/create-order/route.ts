import { NextRequest, NextResponse } from "next/server";
import { sendTikTokEvent } from "@/lib/tiktok-events";

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

// WooCommerce fires the order emails, Affiliatly tracking, stock reduction and
// the Meta/TikTok purchase events the moment an order is marked paid. The
// "BOGO Auto-Discount (Order Hook)" snippet zeroes the free line on
// woocommerce_rest_insert_shop_order_object, which fires AFTER the order has
// been saved and (with set_paid) already marked paid — so everything above
// saw the un-zeroed, doubled order. Creating the order as "pending" lets the
// snippet zero the free line first; the second call then marks it paid.
async function markOrderPaid(orderId: number, transactionId: string, retries = 3): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(`${WP_BASE}/wp-json/wc/v3/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: AUTH },
      body: JSON.stringify({ set_paid: true, transaction_id: transactionId }),
      cache: "no-store",
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (res.ok) return { ok: true, data };
    console.error(`[create-order] mark-paid error (attempt ${attempt}/${retries}) for order ${orderId}:`, data);
    if (attempt < retries) await new Promise((r) => setTimeout(r, 1000 * attempt));
  }
  return { ok: false, data: {} };
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
      expected_items_minor?: number;
      currency?: string;
      aff_id?: string;
    };

    const { payment_intent_id, billing_address, shipping_address, line_items, coupon_lines, amount_minor, expected_items_minor, aff_id } = body;

    if (!payment_intent_id) {
      return NextResponse.json({ message: "payment_intent_id is required" }, { status: 400 });
    }

    // Build WooCommerce order payload
    const orderPayload: Record<string, unknown> = {
      payment_method: "stripe",
      payment_method_title: "Credit / Debit Card",
      // Not paid yet: see markOrderPaid().
      set_paid: false,
      transaction_id: payment_intent_id,
      status: "pending",
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
      // Sent as the cart has them (paid line + free twin). Do NOT pre-zero the
      // twin here: the WordPress BOGO snippet owns that, and zeroing it twice
      // makes it zero both lines.
      line_items: line_items ?? [],
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

    const orderId = Number(data.id);

    // Safety net: the order's lines should add up to what the customer's cart
    // showed. A gap means the WordPress BOGO snippet didn't zero the free line.
    const orderLines = (data.line_items as Array<{ total?: string }> | undefined) ?? [];
    const orderItemsMinor = Math.round(orderLines.reduce((sum, l) => sum + Number(l.total ?? 0), 0) * 100);
    const lineMismatch =
      typeof expected_items_minor === "number" && Math.abs(orderItemsMinor - expected_items_minor) >= 2;
    if (lineMismatch) {
      console.error("[create-order] order lines do not match cart", { orderId, orderItemsMinor, expected_items_minor });
      await sendTelegramAlert(
        `⚠️ <b>ORDER LINES DON'T MATCH CART</b>\n\n` +
        `Order <b>#${orderId}</b>: the cart total for items was <b>$${(expected_items_minor / 100).toFixed(2)}</b> but WooCommerce recorded <b>$${(orderItemsMinor / 100).toFixed(2)}</b>.\n\n` +
        `Likely the BOGO free line wasn't zeroed (check the "BOGO Auto-Discount (Order Hook)" snippet). The order is being marked paid now, so its emails and Affiliatly tracking will use the wrong total — fix the order and resend.`
      );
    }

    // Mark paid only now that the free line has been zeroed, so the confirmation
    // emails, stock changes and affiliate/ad tracking all see the real order.
    const paid = await markOrderPaid(orderId, payment_intent_id);
    if (!paid.ok) {
      const name = `${billing_address?.first_name ?? ""} ${billing_address?.last_name ?? ""}`.trim() || "Unknown";
      await sendTelegramAlert(
        `⚠️ <b>ORDER NOT MARKED PAID — Action Required</b>\n\n` +
        `Order <b>#${orderId}</b> for <b>${name}</b> was created, but marking it paid failed after 3 attempts. The customer was charged on Stripe.\n\n` +
        `<b>Stripe Payment Intent:</b> <code>${payment_intent_id}</code>\n\n` +
        `Open the order in WooCommerce and mark it Processing.`
      );
      console.error("[create-order] mark-paid failed after retries. Telegram alert sent.", orderId, payment_intent_id);
    }
    const finalOrder = paid.ok ? paid.data : data;

    // WordPress now reports affiliate sales itself when the order is paid
    // (the Affiliatly snippets set one of these flags). Only report from here
    // when it didn't, so the same sale isn't sent twice.
    const finalMeta = (finalOrder.meta_data as Array<{ key: string }> | undefined) ?? [];
    const wordpressTracked = finalMeta.some((m) => m.key === "_pl_aff_tracked_v2" || m.key === "_pl_affiliatly_tracked");

    // Track affiliate sale in Affiliatly
    if (aff_id && wcOk && !wordpressTracked) {
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
