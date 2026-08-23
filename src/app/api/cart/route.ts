import { NextResponse } from "next/server";
import { getCart, StoreApiError } from "@/lib/cart/storeApi";
import { readTokens, writeTokens } from "@/lib/cart/session";

export async function GET() {
  try {
    const tokens = await readTokens();
    const { data, tokens: nextTokens } = await getCart(tokens);
    await writeTokens(nextTokens);
    const res = NextResponse.json(data);
    // Expose Cart-Token to client so Beacon can save it to localStorage
    if (nextTokens.cartToken) res.headers.set("x-cart-token", nextTokens.cartToken);
    return res;
  } catch (error) {
    if (error instanceof StoreApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
