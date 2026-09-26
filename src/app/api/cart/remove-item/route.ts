import { NextRequest, NextResponse } from "next/server";
import { removeCartItem, StoreApiError } from "@/lib/cart/storeApi";
import { ensureTokens, readTokens, writeTokens } from "@/lib/cart/session";
import { syncBacWaterPromo } from "@/lib/cart/bacWaterPromo";
import type { Cart } from "@/lib/cart/types";

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json();
    if (typeof key !== "string") {
      return NextResponse.json({ message: "key must be a string" }, { status: 400 });
    }

    const tokens = await ensureTokens(await readTokens());
    const { data, tokens: nextTokens } = await removeCartItem(tokens, key);

    // Auto-remove free recon solution promo if no qualifying items remain
    const { cart: finalCart, tokens: finalTokens } = await syncBacWaterPromo(
      data as Cart,
      nextTokens
    );

    await writeTokens(finalTokens);
    return NextResponse.json(finalCart);
  } catch (error) {
    if (error instanceof StoreApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
