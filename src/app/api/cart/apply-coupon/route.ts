import { NextRequest, NextResponse } from "next/server";
import { applyCoupon, addCartItem, getCart, StoreApiError } from "@/lib/cart/storeApi";
import { ensureTokens, readTokens, writeTokens } from "@/lib/cart/session";
import { syncBacWaterPromo } from "@/lib/cart/bacWaterPromo";
import type { Cart } from "@/lib/cart/types";

// GHK-CU 50mg variation ID — auto-added when SWRV coupon is applied
const SWRV_PRODUCT_ID = 831;

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    if (typeof code !== "string") {
      return NextResponse.json({ message: "code must be a string" }, { status: 400 });
    }

    let tokens = await ensureTokens(await readTokens());

    // If SWRV code, auto-add GHK-CU 50mg if not already in cart before applying coupon
    if (code.trim().toLowerCase() === "swrv") {
      const { data: cartBefore } = await getCart(tokens);
      const cart = cartBefore as Cart;
      // Cart items for variable products have id = variation ID
      // Also check parent IDs 98, 830, 831, 832 (all GHK-CU variants)
      const GHK_CU_IDS = new Set([98, 830, 831, 832]);
      const alreadyHasGhkCu = cart.items.some((item) => GHK_CU_IDS.has(item.id));
      if (!alreadyHasGhkCu) {
        const { tokens: afterAddTokens } = await addCartItem(tokens, SWRV_PRODUCT_ID, 1);
        tokens = afterAddTokens;
      }
    }

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
