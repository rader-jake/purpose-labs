import { NextRequest, NextResponse } from "next/server";
import { updateCustomer, StoreApiError } from "@/lib/cart/storeApi";
import type { AddressInput } from "@/lib/cart/types";
import { ensureTokens, readTokens, writeTokens } from "@/lib/cart/session";

export async function POST(request: NextRequest) {
  try {
    const { shipping_address, billing_address } = (await request.json()) as {
      shipping_address?: AddressInput;
      billing_address?: AddressInput;
    };
    if (!shipping_address || !billing_address) {
      return NextResponse.json(
        { message: "shipping_address and billing_address are required" },
        { status: 400 }
      );
    }

    const tokens = await ensureTokens(await readTokens());
    const { data, tokens: nextTokens } = await updateCustomer(tokens, {
      shipping_address,
      billing_address,
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
