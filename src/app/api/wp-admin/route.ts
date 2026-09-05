import { NextRequest, NextResponse } from "next/server";

const WC_URL = "https://joshuar120.sg-host.com/wp-json/wc/v3";
const WC_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY ?? "ck_f7138959a5bb8acdcd20841a473028fe1139f86d";
const WC_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET ?? "cs_fb8754b74f8dd9cd6feec5a6fe50320e2a161a19";
const AUTH = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");

export async function POST(req: NextRequest) {
  const { action } = await req.json();

  if (action === "create_swrv_coupon") {
    try {
      // Find GHK-CU product
      const productsRes = await fetch(`${WC_URL}/products?per_page=100&status=publish`, {
        headers: { Authorization: `Basic ${AUTH}` },
        cache: "no-store",
      });
      const products = await productsRes.json();
      const ghkcu = products.find((p: { name: string; id: number }) =>
        p.name.toLowerCase().includes("ghk")
      );
      if (!ghkcu) return NextResponse.json({ error: "GHK-CU not found", names: products.map((p: {name:string}) => p.name) });

      // Create SWRV coupon — 100% off, restricted to GHK-CU only
      const couponRes = await fetch(`${WC_URL}/coupons`, {
        method: "POST",
        headers: { Authorization: `Basic ${AUTH}`, "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          code: "swrv",
          discount_type: "percent",
          amount: "100",
          product_ids: [ghkcu.id],
          individual_use: false,
          description: "Free GHK-CU - SWRV affiliate code",
        }),
      });
      const coupon = await couponRes.json();
      return NextResponse.json({ success: true, ghkcu_id: ghkcu.id, ghkcu_name: ghkcu.name, coupon });
    } catch (e) {
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
