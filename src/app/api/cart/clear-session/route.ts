import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Delete both cart session cookies so a fresh WC session is bootstrapped
  res.cookies.set("wc_cart_token", "", { maxAge: 0, path: "/" });
  res.cookies.set("wc_nonce", "", { maxAge: 0, path: "/" });
  return res;
}
