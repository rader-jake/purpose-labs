import { NextRequest, NextResponse } from "next/server";
import { updateCartItem, StoreApiError } from "@/lib/cart/storeApi";
import { ensureTokens, readTokens, writeTokens } from "@/lib/cart/session";

export async function POST(request: NextRequest) {
  try {
    const { key, quantity } = await request.json();
    if (typeof key !== "string" || typeof quantity !== "number") {
      return NextResponse.json(
        { message: "key must be a string and quantity a number" },
        { status: 400 }
      );
    }

    const tokens = await ensureTokens(await readTokens());
    const { data, tokens: nextTokens } = await updateCartItem(tokens, key, quantity);
    await writeTokens(nextTokens);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof StoreApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
