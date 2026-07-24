import { NextResponse } from "next/server";
import { getCart, StoreApiError } from "@/lib/cart/storeApi";
import { readTokens, writeTokens } from "@/lib/cart/session";

export async function GET() {
  try {
    const tokens = await readTokens();
    const { data, tokens: nextTokens } = await getCart(tokens);
    await writeTokens(nextTokens);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof StoreApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
