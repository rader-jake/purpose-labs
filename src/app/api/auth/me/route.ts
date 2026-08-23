import { NextRequest, NextResponse } from "next/server";

const JWT_VALIDATE = "https://joshuar120.sg-host.com/wp-json/jwt-auth/v1/token/validate";
const WC_BASE = "https://joshuar120.sg-host.com/wp-json/wc/v3";
const WC_KEY = "ck_f7138959a5bb8acdcd20841a473028fe1139f86d";
const WC_SECRET = "cs_fb8754b74f8dd9cd6feec5a6fe50320e2a161a19";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("pl_auth_token")?.value
    ?? req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return NextResponse.json({ user: null }, { status: 401 });

  // Validate JWT
  const validateRes = await fetch(JWT_VALIDATE, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!validateRes.ok) return NextResponse.json({ user: null }, { status: 401 });

  // Decode JWT payload to get WP user ID
  const [, payloadB64] = token.split(".");
  let wpUserId: string | null = null;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64").toString());
    wpUserId = String(payload?.data?.user?.id ?? "");
  } catch {}
  if (!wpUserId) return NextResponse.json({ user: null }, { status: 401 });

  const auth = "Basic " + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");

  // Get WP user email via WP REST API
  const wpAuth = "Basic " + Buffer.from(`Info@purposelabs.shop:KH5x vzQv rq6Y 9ccl peq7 NbCs`).toString("base64");
  const wpUserRes = await fetch(`https://joshuar120.sg-host.com/wp-json/wp/v2/users/${wpUserId}`, {
    headers: { Authorization: wpAuth },
  });
  const wpUser = wpUserRes.ok ? await wpUserRes.json() : null;
  const email = wpUser?.email ?? "";

  // Look up WC customer by email directly
  const custRes = await fetch(`${WC_BASE}/customers?email=${encodeURIComponent(email)}`, {
    headers: { Authorization: auth },
  });
  const customers = custRes.ok ? await custRes.json() : [];
  const customer = Array.isArray(customers) ? customers[0] : null;

  // Parse display name: use WC first_name if real, else split WP display name
  const wpDisplayParts = (wpUser?.name ?? "").split(" ");
  const wcFirstName = customer?.first_name;
  const wcLastName = customer?.last_name;

  // If WC name looks like a placeholder (Joe Doe, Test User, etc.) use WP display name
  const isPlaceholder = !wcFirstName || wcFirstName.toLowerCase() === "joe" || wcFirstName.toLowerCase() === "test";
  const firstName = isPlaceholder ? (wpDisplayParts[0] ?? "") : (wcFirstName ?? "");
  const lastName = isPlaceholder ? (wpDisplayParts.slice(1).join(" ") ?? "") : (wcLastName ?? "");

  return NextResponse.json({
    user: {
      id: customer?.id ?? wpUserId,
      email,
      firstName,
      lastName,
      displayName: firstName || email,
      token,
    }
  });
}
