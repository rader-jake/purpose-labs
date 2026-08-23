import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getCustomerPoints, getTier, getNextTier, POINTS_PER_CREDIT } from "@/lib/loyalty";

const WC_BASE = "https://joshuar120.sg-host.com/wp-json/wc/v3";
const WC_KEY = "ck_f7138959a5bb8acdcd20841a473028fe1139f86d";
const WC_SECRET = "cs_fb8754b74f8dd9cd6feec5a6fe50320e2a161a19";
const JWT_VALIDATE = "https://joshuar120.sg-host.com/wp-json/jwt-auth/v1/token/validate";

function wcAuth() {
  return "Basic " + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");
}

function getTokenFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const cookie = req.cookies.get("pl_auth_token");
  return cookie?.value ?? null;
}

async function getCustomerFromNextAuth() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;
    const res = await fetch(`${WC_BASE}/customers?email=${encodeURIComponent(session.user.email)}&per_page=1`, {
      headers: { Authorization: wcAuth() },
    });
    const customers = await res.json();
    return Array.isArray(customers) && customers.length > 0 ? customers[0] : null;
  } catch { return null; }
}

async function validateTokenAndGetCustomer(token: string) {
  const res = await fetch(JWT_VALIDATE, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return null;
  const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
  const wpUserId = payload.data?.user?.id ?? "";
  if (!wpUserId) return null;
  const wpAuth = "Basic " + Buffer.from("Info@purposelabs.shop:KH5x vzQv rq6Y 9ccl peq7 NbCs").toString("base64");
  const wpRes = await fetch(`https://joshuar120.sg-host.com/wp-json/wp/v2/users/${wpUserId}?context=edit`, { headers: { Authorization: wpAuth } });
  if (!wpRes.ok) return null;
  const wpUser = await wpRes.json();
  const email = wpUser.email ?? "";
  if (!email) return null;
  const custRes = await fetch(`${WC_BASE}/customers?email=${encodeURIComponent(email)}&per_page=1`, { headers: { Authorization: wcAuth() } });
  const customers = await custRes.json();
  return Array.isArray(customers) && customers.length > 0 ? customers[0] : null;
}

export async function GET(req: NextRequest) {
  let customer = await getCustomerFromNextAuth().catch(() => null);
  if (!customer) {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    customer = await validateTokenAndGetCustomer(token).catch(() => null);
  }
  if (!customer) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const { balance, lifetime } = await getCustomerPoints(customer.id);
  const tier = getTier(lifetime);
  const { tier: nextTier, pointsNeeded } = getNextTier(lifetime);

  return NextResponse.json({
    balance,
    lifetime,
    tier: { name: tier.name, emoji: tier.emoji, bonusPercent: tier.bonusPercent, freeShipping: tier.freeShipping },
    nextTier: nextTier ? { name: nextTier.name, emoji: nextTier.emoji, minLifetime: nextTier.minLifetime } : null,
    pointsToNextTier: pointsNeeded,
    redeemableValue: Math.floor(balance / 100) * (1 / POINTS_PER_CREDIT) * 100,
  });
}
