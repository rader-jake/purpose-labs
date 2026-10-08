import { NextRequest, NextResponse } from "next/server";
import { addCartItem, StoreApiError } from "@/lib/cart/storeApi";
import { ensureTokens, readTokens, writeTokens } from "@/lib/cart/session";
import { syncBacWaterPromo } from "@/lib/cart/bacWaterPromo";
import type { Cart } from "@/lib/cart/types";
import { cookies } from "next/headers";

// Cookie stores an array of product IDs claimed as free: [1421, 95, ...]
// One entry per free pick — so 2x KLOW paid = 2x KLOW free = [1421, 1421]
export const BOGO_FREE_COOKIE = "pl_bogo_free_ids";
const COOKIE_MAX_AGE = 60 * 60 * 48;

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json();
    if (typeof productId !== "number") {
      return NextResponse.json({ message: "productId must be a number" }, { status: 400 });
    }

    // Add the product to cart normally
    let tokens = await ensureTokens(await readTokens());
    const { data, tokens: afterAddTokens } = await addCartItem(tokens, productId, 1);
    tokens = afterAddTokens;

    // Sync bac water
    const { cart: finalCart, tokens: finalTokens } = await syncBacWaterPromo(data as Cart, tokens);
    await writeTokens(finalTokens);

    // Append this productId to the free claims cookie
    const store = await cookies();
    const existing = store.get(BOGO_FREE_COOKIE)?.value;
    const freeIds: number[] = existing ? JSON.parse(existing) : [];
    freeIds.push(productId);

    const response = NextResponse.json(finalCart);
    response.cookies.set(BOGO_FREE_COOKIE, JSON.stringify(freeIds), {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
    return response;
  } catch (error) {
    if (error instanceof StoreApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
