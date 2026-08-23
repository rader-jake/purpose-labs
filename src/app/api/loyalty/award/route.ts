import { NextRequest, NextResponse } from "next/server";
import { awardPoints, getTier, POINTS_PER_DOLLAR, getCustomerPoints } from "@/lib/loyalty";

const LOYALTY_SECRET = "pl-loyalty-2026";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-loyalty-secret");
  if (secret !== LOYALTY_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { customerId, orderTotal } = body;

  if (!customerId || !orderTotal) {
    return NextResponse.json({ error: "Missing customerId or orderTotal" }, { status: 400 });
  }

  const total = parseFloat(String(orderTotal));
  if (isNaN(total) || total <= 0) {
    return NextResponse.json({ error: "Invalid orderTotal" }, { status: 400 });
  }

  // Get current tier based on lifetime points BEFORE award
  const { lifetime } = await getCustomerPoints(Number(customerId));
  const tier = getTier(lifetime);

  // Calculate points: $1 = 10 pts + tier bonus
  const basePoints = Math.floor(total * POINTS_PER_DOLLAR);
  const bonusPoints = Math.floor(basePoints * (tier.bonusPercent / 100));
  const totalPoints = basePoints + bonusPoints;

  const result = await awardPoints(Number(customerId), totalPoints);

  return NextResponse.json({
    awarded: totalPoints,
    basePoints,
    bonusPoints,
    tier: tier.name,
    newBalance: result.balance,
    newLifetime: result.lifetime,
  });
}
