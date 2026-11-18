import { NextRequest, NextResponse } from "next/server";
import { addCartItem, StoreApiError } from "@/lib/cart/storeApi";
import { ensureTokens, readTokens, writeTokens } from "@/lib/cart/session";
import { finalizeCart } from "@/lib/cart/bogoSync";
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

    const serverTokens = await readTokens();
    // If client sends a cart token (from localStorage) and we don't have one server-side,
    // use it so the item is added to the correct existing WC session instead of creating a new one.
    const clientCartToken = request.headers.get("x-wc-cart-token");
    const mergedTokens = {
      ...serverTokens,
      cartToken: serverTokens.cartToken || clientCartToken || undefined,
    };
    const tokens = await ensureTokens(mergedTokens);
    const { data, tokens: nextTokens } = await addCartItem(tokens, id, quantity);

    const { cart: finalCart, tokens: finalTokens } = await finalizeCart(
      data as Cart,
      nextTokens
    );

    await writeTokens(finalTokens);
    const res = NextResponse.json(finalCart);
    if (finalTokens.cartToken) res.headers.set("x-cart-token", finalTokens.cartToken);
    return res;
  } catch (error) {
    if (error instanceof StoreApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
