import { NextRequest, NextResponse } from "next/server";
import { removeCoupon, StoreApiError } from "@/lib/cart/storeApi";
import { ensureTokens, readTokens, writeTokens } from "@/lib/cart/session";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    if (typeof code !== "string") {
      return NextResponse.json({ message: "code must be a string" }, { status: 400 });
    }

    const tokens = await ensureTokens(await readTokens());
    const { data, tokens: nextTokens } = await removeCoupon(tokens, code);
    await writeTokens(nextTokens);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof StoreApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
