import { NextRequest, NextResponse } from "next/server";
import { updateCartItem, StoreApiError } from "@/lib/cart/storeApi";
import { ensureTokens, readTokens, writeTokens } from "@/lib/cart/session";
import { finalizeCart } from "@/lib/cart/bogoSync";
import type { Cart } from "@/lib/cart/types";

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

    const changedProductId = (data as Cart).items.find((item) => item.key === key)?.id;
    const { cart: finalCart, tokens: finalTokens } = await finalizeCart(data as Cart, nextTokens, {
      changedProductId,
    });

    await writeTokens(finalTokens);
    return NextResponse.json(finalCart);
  } catch (error) {
    if (error instanceof StoreApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
