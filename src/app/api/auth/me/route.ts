import { NextRequest, NextResponse } from "next/server";

const JWT_VALIDATE = "https://joshuar120.sg-host.com/wp-json/jwt-auth/v1/token/validate";
const WC_BASE = "https://joshuar120.sg-host.com/wp-json/wc/v3";
const WC_KEY = "ck_f7138959a5bb8acdcd20841a473028fe1139f86d";
const WC_SECRET = "cs_fb8754b74f8dd9cd6feec5a6fe50320e2a161a19";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("pl_auth_token")?.value
    ?? req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return NextResponse.json({ user: null }, { status: 401 });

  const validateRes = await fetch(JWT_VALIDATE, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!validateRes.ok) return NextResponse.json({ user: null }, { status: 401 });

  const validateData = await validateRes.json();
  const userData = validateData.data;

  // Get WC customer by email
  const auth = "Basic " + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");
  const custRes = await fetch(`${WC_BASE}/customers?email=${encodeURIComponent(userData?.user?.user_email ?? "")}`, {
    headers: { Authorization: auth },
  });
  const customers = await custRes.json();
  const customer = Array.isArray(customers) ? customers[0] : null;

  return NextResponse.json({
    user: {
      id: customer?.id ?? userData?.user?.ID,
      email: userData?.user?.user_email ?? customer?.email,
      firstName: customer?.first_name ?? userData?.user?.user_display_name ?? "",
      lastName: customer?.last_name ?? "",
      displayName: customer?.first_name ?? userData?.user?.user_display_name ?? "",
      token,
    }
  });
}
