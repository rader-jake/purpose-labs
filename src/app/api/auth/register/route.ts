import { NextRequest, NextResponse } from "next/server";

const WC_BASE = "https://joshuar120.sg-host.com/wp-json/wc/v3";
const WC_KEY = "ck_f7138959a5bb8acdcd20841a473028fe1139f86d";
const WC_SECRET = "cs_fb8754b74f8dd9cd6feec5a6fe50320e2a161a19";
const JWT_ENDPOINT = "https://joshuar120.sg-host.com/wp-json/jwt-auth/v1/token";

export async function POST(req: NextRequest) {
  const { email, password, firstName, lastName } = await req.json();
  const auth = "Basic " + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");

  // Create WC customer
  const createRes = await fetch(`${WC_BASE}/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: auth },
    body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName, username: email }),
  });

  const created = await createRes.json();
  if (!createRes.ok) {
    return NextResponse.json({ error: created.message ?? "Registration failed" }, { status: 400 });
  }

  // Auto-login
  const tokenRes = await fetch(JWT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: email, password }),
  });
  const tokenData = await tokenRes.json();

  const user = {
    id: created.id,
    email,
    firstName,
    lastName,
    displayName: `${firstName} ${lastName}`.trim(),
    token: tokenData.token,
  };

  const res = NextResponse.json({ user });
  if (tokenData.token) {
    res.cookies.set("pl_auth_token", tokenData.token, {
      httpOnly: false,
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      sameSite: "lax",
    });
  }
  return res;
}
