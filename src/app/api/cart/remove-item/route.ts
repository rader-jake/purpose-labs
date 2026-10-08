import { NextRequest, NextResponse } from "next/server";
import { removeCartItem, removeCoupon, StoreApiError } from "@/lib/cart/storeApi";
import { ensureTokens, readTokens, writeTokens } from "@/lib/cart/session";
import { syncBacWaterPromo } from "@/lib/cart/bacWaterPromo";
import type { Cart } from "@/lib/cart/types";

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json();
    if (typeof key !== "string") {
      return NextResponse.json({ message: "key must be a string" }, { status: 400 });
    }

    let tokens = await ensureTokens(await readTokens());
    const { data, tokens: nextTokens } = await removeCartItem(tokens, key);
    tokens = nextTokens;
    let cart = data as Cart;

    // After removing item, clean up any orphaned pl-bogo-* coupons.
    // A pl-bogo coupon is orphaned when there are no longer enough paid items
    // to justify that many free picks. Count paid BOGO-eligible items vs bogo coupons.
    const bogoCoupons = cart.coupons.filter((c) => c.code.startsWith("pl-bogo-"));
    if (bogoCoupons.length > 0) {
      // Count paid items (line_total > 0, not bac water)
      const BAC_WATER_ID = 94;
      const paidCount = cart.items.filter(
        (item) => item.id !== BAC_WATER_ID && Number(item.totals.line_total) > 0
      ).length;

      // Remove excess bogo coupons (can only have 1 free pick per paid item)
      const excessCount = bogoCoupons.length - paidCount;
      if (excessCount > 0) {
        const toRemove = bogoCoupons.slice(0, excessCount);
        for (const coupon of toRemove) {
          try {
            const { data: updated, tokens: t } = await removeCoupon(tokens, coupon.code);
            tokens = t;
            cart = updated as Cart;
          } catch {
            // best effort
          }
        }
      }
    }

    // Auto-remove free recon solution promo if no qualifying items remain
    const { cart: finalCart, tokens: finalTokens } = await syncBacWaterPromo(cart, tokens);

    await writeTokens(finalTokens);
    return NextResponse.json(finalCart);
  } catch (error) {
    if (error instanceof StoreApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
