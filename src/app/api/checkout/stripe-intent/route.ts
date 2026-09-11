import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-08-26.dahlia",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      amountCents?: number;
      currencyCode?: string;
    };

    const { amountCents, currencyCode } = body;

    if (typeof amountCents !== "number" || !currencyCode) {
      return NextResponse.json(
        { message: "amountCents and currencyCode are required" },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: currencyCode.toLowerCase(),
      payment_method_types: ["card", "apple_pay", "google_pay", "link"],
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
