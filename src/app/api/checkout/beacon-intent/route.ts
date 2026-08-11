import { NextRequest, NextResponse } from "next/server";
import { createBeaconPaymentIntent } from "@/lib/cart/beaconApi";
import { StoreApiError } from "@/lib/cart/storeApi";

export async function POST(request: NextRequest) {
  try {
    const { amountCents, currencyCode } = (await request.json()) as {
      amountCents?: number;
      currencyCode?: string;
    };
    if (typeof amountCents !== "number" || !currencyCode) {
      return NextResponse.json(
        { message: "amountCents and currencyCode are required" },
        { status: 400 }
      );
    }

    // Guest checkout doesn't need cart-session lookup for this call — Beacon
    // takes the amount directly (per their engineer). No Store API
    // Cart-Token/Nonce involved here, only the fresh X-WP-Nonce minted
    // inside createBeaconPaymentIntent.
    const data = await createBeaconPaymentIntent(amountCents, currencyCode);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof StoreApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
