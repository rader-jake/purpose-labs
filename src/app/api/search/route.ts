import { NextRequest, NextResponse } from "next/server";

const WC_BASE = "https://joshuar120.sg-host.com/wp-json/wc/v3";
const WC_KEY = "ck_a1f40e9cce84ad42533a358083d6b819b670d7c9";
const WC_SECRET = "cs_7964f8082bcbe98d4688a0697eb40a611b538de8";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ products: [] });

  const auth = "Basic " + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");
  const res = await fetch(`${WC_BASE}/products?search=${encodeURIComponent(q)}&per_page=8&status=publish`, {
    headers: { Authorization: auth },
    next: { revalidate: 60 },
  });

  if (!res.ok) return NextResponse.json({ products: [] });
  const products = await res.json();
  return NextResponse.json({ products });
}
