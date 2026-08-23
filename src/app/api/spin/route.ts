import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

const WC_BASE = "https://joshuar120.sg-host.com/wp-json/wc/v3";
const JWT_VALIDATE = "https://joshuar120.sg-host.com/wp-json/jwt-auth/v1/token/validate";
const WC_KEY = "ck_f7138959a5bb8acdcd20841a473028fe1139f86d";
const WC_SECRET = "cs_fb8754b74f8dd9cd6feec5a6fe50320e2a161a19";

function wcAuth() {
  return "Basic " + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");
}

function randomCode(n: number) {
  return Array.from({ length: n }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]).join("");
}

const PRIZES = [
  { id: "10_OFF",        label: "10% OFF",          weight: 30 },
  { id: "FREE_SHIPPING", label: "Free Shipping",     weight: 25 },
  { id: "15_OFF",        label: "15% OFF",           weight: 20 },
  { id: "FREE_PRODUCT",  label: "Free Item",         weight: 10 },
  { id: "20_OFF",        label: "20% OFF",           weight: 10 },
  { id: "TRY_AGAIN",     label: "Try Again",         weight:  5 },
];

function pickPrize() {
  const total = PRIZES.reduce((a, p) => a + p.weight, 0);
  let r = Math.random() * total;
  for (const p of PRIZES) { r -= p.weight; if (r <= 0) return p; }
  return PRIZES[0];
}

function getTokenFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const cookie = req.cookies.get("pl_auth_token");
  return cookie?.value ?? null;
}

async function getCustomerFromNextAuth(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;
    const email = session.user.email;
    const auth = "Basic " + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");
    const custRes = await fetch(`${WC_BASE}/customers?email=${encodeURIComponent(email)}&per_page=1`, { headers: { Authorization: auth } });
    const customers = await custRes.json();
    return Array.isArray(customers) && customers.length > 0 ? customers[0] : null;
  } catch { return null; }
}

async function validateTokenAndGetCustomer(token: string) {
  const res = await fetch(JWT_VALIDATE, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;

  // Decode WP user ID from JWT
  const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
  const wpUserId = payload.data?.user?.id ?? "";
  if (!wpUserId) return null;

  // Get WP user email
  const wpAuth = "Basic " + Buffer.from("Info@purposelabs.shop:KH5x vzQv rq6Y 9ccl peq7 NbCs").toString("base64");
  const wpRes = await fetch(`https://joshuar120.sg-host.com/wp-json/wp/v2/users/${wpUserId}?context=edit`, { headers: { Authorization: wpAuth } });
  if (!wpRes.ok) return null;
  const wpUser = await wpRes.json();
  const email = wpUser.email ?? "";
  if (!email) return null;

  // Look up WC customer by email
  const custRes = await fetch(`${WC_BASE}/customers?email=${encodeURIComponent(email)}&per_page=1`, { headers: { Authorization: wcAuth() } });
  const customers = await custRes.json();
  return Array.isArray(customers) && customers.length > 0 ? customers[0] : null;
}

// GET — status check
export async function GET(req: NextRequest) {
  // Try NextAuth session first (Google OAuth users), then fall back to JWT cookie
  let customer = await getCustomerFromNextAuth(req).catch(() => null);
  if (!customer) {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ isLoggedIn: false, hasSpun: false, nextSpin: null, prize: null, coupon: null });
    customer = await validateTokenAndGetCustomer(token).catch(() => null);
  }
  if (!customer) return NextResponse.json({ isLoggedIn: false, hasSpun: false, nextSpin: null, prize: null, coupon: null });

  const meta: { key: string; value: string }[] = customer.meta_data ?? [];
  const lastSpin = meta.find(m => m.key === "pl_last_spin")?.value ?? null;
  const lastPrize = meta.find(m => m.key === "pl_last_spin_prize")?.value ?? null;
  const lastCoupon = meta.find(m => m.key === "pl_last_coupon")?.value ?? null;

  if (!lastSpin) return NextResponse.json({ isLoggedIn: true, hasSpun: false, nextSpin: null, prize: null, coupon: null });

  const spinDate = new Date(lastSpin);
  const nextSpin = new Date(spinDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const hasSpun = Date.now() < nextSpin.getTime();

  return NextResponse.json({ isLoggedIn: true, hasSpun, nextSpin: hasSpun ? nextSpin.toISOString() : null, prize: lastPrize, coupon: lastCoupon });
}

// POST — spin
export async function POST(req: NextRequest) {
  // Try NextAuth session first (Google OAuth users), then fall back to JWT cookie
  let customer = await getCustomerFromNextAuth(req).catch(() => null);
  if (!customer) {
    const token = getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    customer = await validateTokenAndGetCustomer(token).catch(() => null);
  }
  if (!customer) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const meta: { key: string; value: string }[] = customer.meta_data ?? [];
  const lastSpin = meta.find(m => m.key === "pl_last_spin")?.value ?? null;

  if (lastSpin) {
    const nextSpin = new Date(new Date(lastSpin).getTime() + 7 * 24 * 60 * 60 * 1000);
    if (Date.now() < nextSpin.getTime()) {
      return NextResponse.json({ code: "already_spun", nextSpin: nextSpin.toISOString() }, { status: 400 });
    }
  }

  const prize = pickPrize();
  const now = new Date().toISOString();

  // TRY_AGAIN = free retry, don't set cooldown
  if (prize.id === "TRY_AGAIN") {
    return NextResponse.json({ prize: "TRY_AGAIN" });
  }

  // Save spin time only on real prizes
  await fetch(`${WC_BASE}/customers/${customer.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: wcAuth() },
    body: JSON.stringify({ meta_data: [{ key: "pl_last_spin", value: now }, { key: "pl_last_spin_prize", value: prize.id }] }),
  });

  // Build coupon
  const code = `PL-${randomCode(8)}-${prize.id.replace("_", "")}`;
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const expiresIso = expiresAt.toISOString();

  let discountType = "percent";
  let amount = "0";
  if (prize.id === "10_OFF") { discountType = "percent"; amount = "10"; }
  else if (prize.id === "15_OFF") { discountType = "percent"; amount = "15"; }
  else if (prize.id === "20_OFF") { discountType = "percent"; amount = "20"; }
  else if (prize.id === "FREE_SHIPPING") { discountType = "free_shipping"; amount = "0"; }
  else if (prize.id === "FREE_PRODUCT") { discountType = "percent"; amount = "100"; }

  const couponRes = await fetch(`${WC_BASE}/coupons`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: wcAuth() },
    body: JSON.stringify({
      code,
      discount_type: discountType,
      amount,
      individual_use: true,
      usage_limit: 1,
      limit_usage_to_x_items: prize.id === "FREE_PRODUCT" ? 1 : null,
      email_restrictions: [customer.email],
      date_expires: expiresIso,
    }),
  });

  if (!couponRes.ok) {
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }

  // Save coupon to meta
  await fetch(`${WC_BASE}/customers/${customer.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: wcAuth() },
    body: JSON.stringify({ meta_data: [{ key: "pl_last_coupon", value: code }] }),
  });

  return NextResponse.json({ prize: prize.id, couponCode: code, expiresAt: expiresIso });
}
