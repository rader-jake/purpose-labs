import { NextRequest, NextResponse } from "next/server";

const WC_BASE = "https://joshuar120.sg-host.com/wp-json/wc/v3";
const WC_KEY = "ck_f7138959a5bb8acdcd20841a473028fe1139f86d";
const WC_SECRET = "cs_fb8754b74f8dd9cd6feec5a6fe50320e2a161a19";

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
