import { NextRequest, NextResponse } from "next/server";
import { addCartItem, StoreApiError } from "@/lib/cart/storeApi";
import { ensureTokens, readTokens, writeTokens } from "@/lib/cart/session";
import { syncBacWaterPromo } from "@/lib/cart/bacWaterPromo";

import type { Cart } from "@/lib/cart/types";

export async function POST(request: NextRequest) {
  try {
    const { id, quantity } = await request.json();
    if (typeof id !== "number" || typeof quantity !== "number") {
      return NextResponse.json(
        { message: "id and quantity must be numbers" },
        { status: 400 }
      );
    }

    const tokens = await ensureTokens(await readTokens());
    const { data, tokens: nextTokens } = await addCartItem(tokens, id, quantity);

    // Auto-apply free recon solution promo
    const { cart: bacCart, tokens: bacTokens } = await syncBacWaterPromo(data as Cart, nextTokens);

    await writeTokens(bacTokens);
    const res = NextResponse.json(bacCart);
    if (bacTokens.cartToken) res.headers.set("x-cart-token", bacTokens.cartToken);
    return res;
  } catch (error) {
    if (error instanceof StoreApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
