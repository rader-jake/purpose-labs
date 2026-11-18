import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.WOOCOMMERCE_URL ?? "MISSING";
  const ck = process.env.WOOCOMMERCE_CONSUMER_KEY ?? "MISSING";
  const cs = process.env.WOOCOMMERCE_CONSUMER_SECRET ?? "MISSING";
  
  const endpoint = `${url.replace(/\/+$/, "")}/wp-json/wc/v3/products?per_page=1&status=publish`;
  const basicAuth = Buffer.from(`${ck}:${cs}`).toString("base64");
  
  try {
    const r = await fetch(endpoint, { 
      headers: { Authorization: `Basic ${basicAuth}` },
      cache: "no-store"
    });
    const body = await r.text();
    return NextResponse.json({ 
      status: r.status, 
      url: url.substring(0, 30) + "...",
      ckPrefix: ck.substring(0, 10),
      bodyPreview: body.substring(0, 200)
    });
  } catch (e) {
    return NextResponse.json({ error: String(e), url });
  }
}
