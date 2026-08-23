import { NextRequest, NextResponse } from "next/server";

const JWT_ENDPOINT = "https://joshuar120.sg-host.com/wp-json/jwt-auth/v1/token";
const WC_BASE = "https://joshuar120.sg-host.com/wp-json/wc/v3";
const WC_KEY = "ck_f7138959a5bb8acdcd20841a473028fe1139f86d";
const WC_SECRET = "cs_fb8754b74f8dd9cd6feec5a6fe50320e2a161a19";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  // 1. Get JWT token
  const tokenRes = await fetch(JWT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: email, password }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.token) {
    return NextResponse.json({ error: tokenData.message ?? "Invalid credentials" }, { status: 401 });
  }

  // 2. Get WC customer data
  const auth = "Basic " + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");
  const custRes = await fetch(`${WC_BASE}/customers?email=${encodeURIComponent(email)}`, {
    headers: { Authorization: auth },
  });
  const customers = await custRes.json();
  const customer = Array.isArray(customers) ? customers[0] : null;

  const user = {
    id: customer?.id ?? tokenData.user_id,
    email,
    firstName: customer?.first_name ?? tokenData.user_display_name ?? "",
    lastName: customer?.last_name ?? "",
    displayName: tokenData.user_display_name ?? email,
    token: tokenData.token,
  };

  const res = NextResponse.json({ user });
  res.cookies.set("pl_auth_token", tokenData.token, {
    httpOnly: false, path: "/", maxAge: 30 * 24 * 60 * 60, sameSite: "lax",
  });
  res.cookies.set("pl_auth_name", user.firstName || user.displayName || "", {
    httpOnly: false, path: "/", maxAge: 30 * 24 * 60 * 60, sameSite: "lax",
  });
  return res;
}
