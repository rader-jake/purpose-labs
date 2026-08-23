const WC_BASE = "https://joshuar120.sg-host.com/wp-json/wc/v3";
const WC_KEY = "ck_f7138959a5bb8acdcd20841a473028fe1139f86d";
const WC_SECRET = "cs_fb8754b74f8dd9cd6feec5a6fe50320e2a161a19";

function wcAuth() {
  return "Basic " + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");
}

// $1 spent = 10 points, 100 points = $1 store credit
export const POINTS_PER_DOLLAR = 10;
export const POINTS_PER_CREDIT = 100; // 100 pts = $1

export interface Tier {
  name: string;
  emoji: string;
  minLifetime: number;
  bonusPercent: number;
  freeShipping: boolean;
}

export const TIERS: Tier[] = [
  { name: "Researcher",        emoji: "🥈", minLifetime: 0,    bonusPercent: 0,  freeShipping: false },
  { name: "Senior Researcher", emoji: "🥇", minLifetime: 500,  bonusPercent: 5,  freeShipping: false },
  { name: "Elite",             emoji: "💎", minLifetime: 2000, bonusPercent: 10, freeShipping: true  },
];

export function getTier(lifetimePoints: number): Tier {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (lifetimePoints >= TIERS[i].minLifetime) return TIERS[i];
  }
  return TIERS[0];
}

export function getNextTier(lifetimePoints: number): { tier: Tier | null; pointsNeeded: number } {
  for (const tier of TIERS) {
    if (lifetimePoints < tier.minLifetime) {
      return { tier, pointsNeeded: tier.minLifetime - lifetimePoints };
    }
  }
  return { tier: null, pointsNeeded: 0 };
}

export interface CustomerPoints {
  balance: number;
  lifetime: number;
}

export async function getCustomerPoints(customerId: number): Promise<CustomerPoints> {
  const res = await fetch(`${WC_BASE}/customers/${customerId}`, {
    headers: { Authorization: wcAuth() },
  });
  if (!res.ok) return { balance: 0, lifetime: 0 };
  const customer = await res.json();
  const meta: { key: string; value: string }[] = customer.meta_data ?? [];
  const balance = parseInt(meta.find(m => m.key === "pl_points_balance")?.value ?? "0", 10) || 0;
  const lifetime = parseInt(meta.find(m => m.key === "pl_points_lifetime")?.value ?? "0", 10) || 0;
  return { balance, lifetime };
}

export async function awardPoints(customerId: number, points: number): Promise<{ balance: number; lifetime: number }> {
  const current = await getCustomerPoints(customerId);
  const newBalance = current.balance + points;
  const newLifetime = current.lifetime + points;

  await fetch(`${WC_BASE}/customers/${customerId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: wcAuth() },
    body: JSON.stringify({
      meta_data: [
        { key: "pl_points_balance", value: String(newBalance) },
        { key: "pl_points_lifetime", value: String(newLifetime) },
      ],
    }),
  });

  return { balance: newBalance, lifetime: newLifetime };
}

export async function redeemPoints(
  customerId: number,
  points: number
): Promise<{ couponCode: string; value: number; newBalance: number }> {
  if (points < 100 || points % 100 !== 0) {
    throw new Error("Points must be a multiple of 100 (minimum 100)");
  }

  const { balance } = await getCustomerPoints(customerId);
  if (balance < points) throw new Error("Insufficient points balance");

  const dollarValue = points / POINTS_PER_CREDIT;
  const newBalance = balance - points;

  // Create coupon
  function randomCode(n: number) {
    return Array.from({ length: n }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]).join("");
  }
  const code = `PLPTS-${randomCode(8)}`;

  const couponRes = await fetch(`${WC_BASE}/coupons`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: wcAuth() },
    body: JSON.stringify({
      code,
      discount_type: "fixed_cart",
      amount: String(dollarValue),
      individual_use: true,
      usage_limit: 1,
      date_expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    }),
  });

  if (!couponRes.ok) throw new Error("Failed to create coupon");

  // Deduct points
  await fetch(`${WC_BASE}/customers/${customerId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: wcAuth() },
    body: JSON.stringify({
      meta_data: [{ key: "pl_points_balance", value: String(newBalance) }],
    }),
  });

  return { couponCode: code, value: dollarValue, newBalance };
}
