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

    // Auto-apply free bac water promo after adding an item
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
