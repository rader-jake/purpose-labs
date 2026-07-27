import { NextRequest, NextResponse } from "next/server";
import { submitCheckout, StoreApiError } from "@/lib/cart/storeApi";
import type { AddressInput } from "@/lib/cart/types";
import { ensureTokens, readTokens, writeTokens } from "@/lib/cart/session";

export async function POST(request: NextRequest) {
  try {
    const { billing_address, shipping_address, payment_method } = (await request.json()) as {
      billing_address?: AddressInput;
      shipping_address?: AddressInput;
      payment_method?: string;
    };
    if (!billing_address || !payment_method) {
      return NextResponse.json(
        { message: "billing_address and payment_method are required" },
        { status: 400 }
      );
    }

    const tokens = await ensureTokens(await readTokens());
    const { data, tokens: nextTokens } = await submitCheckout(tokens, {
      billing_address,
      shipping_address: shipping_address ?? billing_address,
      payment_method,
    });
    await writeTokens(nextTokens);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof StoreApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
