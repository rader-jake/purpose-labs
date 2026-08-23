import { NextRequest, NextResponse } from "next/server";
import { awardPoints, getTier, POINTS_PER_DOLLAR, getCustomerPoints } from "@/lib/loyalty";
import { createHmac } from "crypto";

const WEBHOOK_SECRET = "pl-loyalty-2026";

function verifyWCSignature(body: string, signature: string | null): boolean {
  if (!signature) return false;
  const hmac = createHmac("sha256", WEBHOOK_SECRET).update(body).digest("base64");
  return hmac === signature;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-wc-webhook-signature");

  if (!verifyWCSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try { body = JSON.parse(rawBody); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // WooCommerce sends the full order object
  const customerId = body.customer_id ?? body.customerId;
  const orderTotal = body.total ?? body.orderTotal;
  const status = body.status;

  // Only award points on completed orders
  if (status && status !== "completed") {
    return NextResponse.json({ skipped: true, reason: `status=${status}` });
  }

  if (!customerId || customerId === 0) {
    return NextResponse.json({ skipped: true, reason: "guest order" });
  }

  if (!orderTotal) {
    return NextResponse.json({ error: "Missing orderTotal" }, { status: 400 });
  }

  const total = parseFloat(String(orderTotal));
  if (isNaN(total) || total <= 0) {
    return NextResponse.json({ error: "Invalid orderTotal" }, { status: 400 });
  }

  const { lifetime } = await getCustomerPoints(Number(customerId));
  const tier = getTier(lifetime);

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
