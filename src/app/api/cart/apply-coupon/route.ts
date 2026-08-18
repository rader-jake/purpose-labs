import { NextRequest, NextResponse } from "next/server";
import { applyCoupon, StoreApiError } from "@/lib/cart/storeApi";
import { ensureTokens, readTokens, writeTokens } from "@/lib/cart/session";
import { syncBacWaterPromo } from "@/lib/cart/bacWaterPromo";
import type { Cart } from "@/lib/cart/types";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    if (typeof code !== "string") {
      return NextResponse.json({ message: "code must be a string" }, { status: 400 });
    }

    const tokens = await ensureTokens(await readTokens());
    const { data, tokens: nextTokens } = await applyCoupon(tokens, code);

    // Re-apply pl-auto-bacwater if an affiliate code knocked it off
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
