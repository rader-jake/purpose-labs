import { NextRequest, NextResponse } from "next/server";

const WC_URL = "https://joshuar120.sg-host.com/wp-json/wc/v3";
const WC_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY ?? "ck_f7138959a5bb8acdcd20841a473028fe1139f86d";
const WC_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET ?? "cs_fb8754b74f8dd9cd6feec5a6fe50320e2a161a19";
const AUTH = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");
const HEADERS = { Authorization: `Basic ${AUTH}`, "Content-Type": "application/json" };

export async function POST(req: NextRequest) {
  const { action } = await req.json();

  if (action === "update_swrv_coupon") {
    // Find existing SWRV coupon
    const listRes = await fetch(`${WC_URL}/coupons?code=swrv`, { headers: HEADERS, cache: "no-store" });
    const list = await listRes.json();
    if (!list.length) return NextResponse.json({ error: "SWRV coupon not found" });
    const couponId = list[0].id;

    // Update it: 100% off, GHK-CU (id 98) only
    const patchRes = await fetch(`${WC_URL}/coupons/${couponId}`, {
      method: "PUT",
      headers: HEADERS,
      cache: "no-store",
      body: JSON.stringify({
        discount_type: "percent",
        amount: "100",
        product_ids: [98],
        individual_use: false,
        description: "Free GHK-CU - SWRV affiliate code",
      }),
    });
    const result = await patchRes.json();
    return NextResponse.json({ success: true, coupon_id: couponId, result });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
