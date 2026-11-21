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
      email?: string;
    };

    const { amountCents, currencyCode, email } = body;

    if (typeof amountCents !== "number" || !currencyCode) {
      return NextResponse.json(
        { message: "amountCents and currencyCode are required" },
        { status: 400 }
      );
    }

    // Look up or create a Stripe Customer by email so returning buyers see
    // their saved cards in the PaymentElement automatically.
    let customerId: string | undefined;
    if (email) {
      try {
        const existing = await stripe.customers.list({ email, limit: 1 });
        if (existing.data.length > 0) {
          customerId = existing.data[0].id;
        } else {
          const created = await stripe.customers.create({ email });
          customerId = created.id;
        }
      } catch (e) {
        // Non-fatal — fall through without a customer
        console.error("[stripe-intent] customer lookup/create failed:", e);
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: currencyCode.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      ...(customerId ? { customer: customerId } : {}),
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
