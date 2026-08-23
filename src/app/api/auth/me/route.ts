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
  // JWT validate returns: { code, data: { status } } — doesn't include user info
  // We need the email stored in the cookie or passed separately
  // Instead, decode the JWT payload to get user ID, then fetch WC customer
  const [, payloadB64] = token.split(".");
  let userId: string | null = null;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64").toString());
    userId = payload?.data?.user?.id ?? null;
  } catch {}

  if (!userId) return NextResponse.json({ user: null }, { status: 401 });

  // Get WC customer by WP user ID
  const auth = "Basic " + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");

  // Try fetching by ID directly (WC customer ID may differ from WP user ID, so search by role)
  const custRes = await fetch(`${WC_BASE}/customers?per_page=100`, {
    headers: { Authorization: auth },
  });
  const allCustomers = await custRes.json();

  // Also try fetching WP user info
  const wpUserRes = await fetch(`https://joshuar120.sg-host.com/wp-json/wp/v2/users/${userId}`, {
    headers: { Authorization: "Basic " + Buffer.from(`Info@purposelabs.shop:KH5x vzQv rq6Y 9ccl peq7 NbCs`).toString("base64") },
  });
  const wpUser = wpUserRes.ok ? await wpUserRes.json() : null;
  const email = wpUser?.email ?? null;

  const customer = Array.isArray(allCustomers) && email
    ? allCustomers.find((c: any) => c.email === email)
    : null;

  return NextResponse.json({
    user: {
      id: customer?.id ?? userId,
      email: email ?? customer?.email ?? "",
      firstName: customer?.first_name ?? wpUser?.name?.split(" ")[0] ?? "",
      lastName: customer?.last_name ?? "",
      displayName: customer?.first_name ?? wpUser?.name ?? "",
      token,
    }
  });
}
