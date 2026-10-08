import { NextRequest, NextResponse } from "next/server";
import { addCartItem, StoreApiError } from "@/lib/cart/storeApi";
import { ensureTokens, readTokens, writeTokens } from "@/lib/cart/session";
import { syncBacWaterPromo } from "@/lib/cart/bacWaterPromo";
import type { Cart } from "@/lib/cart/types";
import { cookies } from "next/headers";

const BOGO_FREE_COOKIE = "pl_bogo_free_items";
const COOKIE_MAX_AGE = 60 * 60 * 48;

// Read free item keys from cookie: { [cartItemKey]: productId }
export async function readBogoFreeItems(): Promise<Record<string, number>> {
  const store = await cookies();
  const raw = store.get(BOGO_FREE_COOKIE)?.value;
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

// Adds the free item to cart and tags it in a cookie
export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json();
    if (typeof productId !== "number") {
      return NextResponse.json({ message: "productId must be a number" }, { status: 400 });
    }

    // Add the product to cart
    let tokens = await ensureTokens(await readTokens());
    const { data, tokens: afterAddTokens } = await addCartItem(tokens, productId, 1);
    tokens = afterAddTokens;

    // Sync bac water
    const { cart: finalCart, tokens: finalTokens } = await syncBacWaterPromo(data as Cart, tokens);
    await writeTokens(finalTokens);

    // Find the newly added item key (last item matching productId that isn't already tagged free)
    const store = await cookies();
    const existingFree = store.get(BOGO_FREE_COOKIE)?.value;
    const freeMap: Record<string, number> = existingFree ? JSON.parse(existingFree).catch?.(() => {}) ?? JSON.parse(existingFree) : {};

    // Find the cart item key for this product that isn't already tagged
    const newItem = finalCart.items.find(
      (item) => item.id === productId && !freeMap[item.key]
    );
    if (newItem) {
      freeMap[newItem.key] = productId;
    }

    const response = NextResponse.json(finalCart);
    response.cookies.set(BOGO_FREE_COOKIE, JSON.stringify(freeMap), {
      httpOnly: false, // client needs to read this
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
