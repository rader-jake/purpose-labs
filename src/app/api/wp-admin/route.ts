import { NextRequest, NextResponse } from "next/server";

const WC_URL = "https://purposelabs.shop/wp-json/wc/v3";
const WC_KEY = "ck_f7138959a5bb8acdcd20841a473028fe1139f86d";
const WC_SECRET = "cs_fb8754b74f8dd9cd6feec5a6fe50320e2a161a19";
const AUTH = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");

export async function POST(req: NextRequest) {
  const { action } = await req.json();

  if (action === "create_swrv_coupon") {
    // First find GHK-CU product ID
    const productsRes = await fetch(`${WC_URL}/products?per_page=100&status=publish`, {
      headers: { Authorization: `Basic ${AUTH}` },
    });
    const products = await productsRes.json();
    const ghkcu = products.find((p: { name: string }) =>
      p.name.toLowerCase().includes("ghk")
    );
    if (!ghkcu) return NextResponse.json({ error: "GHK-CU product not found" }, { status: 404 });

    // Create SWRV coupon - free product (100% off, restricted to GHK-CU)
    const couponRes = await fetch(`${WC_URL}/coupons`, {
      method: "POST",
      headers: { Authorization: `Basic ${AUTH}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        code: "swrv",
        discount_type: "percent",
        amount: "100",
        product_ids: [ghkcu.id],
        individual_use: false,
        usage_limit: null,
        description: "Free GHK-CU - SWRV affiliate code",
      }),
    });
    const coupon = await couponRes.json();
    return NextResponse.json({ ghkcu_id: ghkcu.id, ghkcu_name: ghkcu.name, coupon });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
