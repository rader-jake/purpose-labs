import { NextResponse, NextRequest } from "next/server";
import { getCart, StoreApiError } from "@/lib/cart/storeApi";
import type { CartTokens } from "@/lib/cart/storeApi";
import { readTokens, writeTokens } from "@/lib/cart/session";
import { finalizeCart } from "@/lib/cart/bogoSync";
import { planBogoClaims } from "@/lib/cart/bogoRules";
import type { Cart } from "@/lib/cart/types";

export async function GET(request: NextRequest) {
  try {
    const tokens = await readTokens();
    // If client sends a cart token (from localStorage) and we don't have one server-side,
    // use the client's token to reconnect to the WC session
    const clientCartToken = request.headers.get("x-wc-cart-token");
    const effectiveTokens: CartTokens = {
      ...tokens,
      cartToken: tokens.cartToken || clientCartToken || undefined,
    };
    const { data, tokens: nextTokens } = await getCart(effectiveTokens);

    // Self-heal carts that already hold a free pick they haven't earned.
    // Only touches the cart when a claim is actually invalid.
    let cart = data as Cart;
    let finalTokens = nextTokens;
    if (planBogoClaims(cart).rejected.length > 0) {
      const healed = await finalizeCart(cart, nextTokens);
      cart = healed.cart;
      finalTokens = healed.tokens;
    }

    await writeTokens(finalTokens);
    const res = NextResponse.json(cart);
    // Expose Cart-Token to client so Beacon can save it to localStorage
    if (finalTokens.cartToken) res.headers.set("x-cart-token", finalTokens.cartToken);
    return res;
  } catch (error) {
    if (error instanceof StoreApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
