import { NextRequest, NextResponse } from "next/server";

const WC_URL = "https://purposelabs.shop/wp-json/wc/v3";
const WC_KEY = "ck_f7138959a5bb8acdcd20841a473028fe1139f86d";
const WC_SECRET = "cs_fb8754b74f8dd9cd6feec5a6fe50320e2a161a19";

export async function POST(req: NextRequest) {
  const { action } = await req.json();

  if (action === "create_swrv_coupon") {
    try {
      // Use query params instead of Basic auth header (bypasses some WAF rules)
      const authParams = `consumer_key=${WC_KEY}&consumer_secret=${WC_SECRET}`;
      
      // Find GHK-CU product
      const productsRes = await fetch(`${WC_URL}/products?per_page=100&status=publish&${authParams}`);
      const productsText = await productsRes.text();
      
      let products;
      try { products = JSON.parse(productsText); } 
      catch { return NextResponse.json({ error: "products parse fail", raw: productsText.slice(0,300) }); }
      
      const ghkcu = products.find((p: { name: string; id: number }) =>
        p.name.toLowerCase().includes("ghk")
      );
      if (!ghkcu) return NextResponse.json({ error: "GHK-CU not found", products: products.map((p: {name:string;id:number}) => p.name) });

      // Create SWRV coupon
      const couponRes = await fetch(`${WC_URL}/coupons?${authParams}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      const couponText = await couponRes.text();
      let coupon;
      try { coupon = JSON.parse(couponText); }
      catch { return NextResponse.json({ error: "coupon parse fail", raw: couponText.slice(0,300) }); }

      return NextResponse.json({ success: true, ghkcu_id: ghkcu.id, ghkcu_name: ghkcu.name, coupon_id: coupon.id, coupon_code: coupon.code });
    } catch (e) {
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
