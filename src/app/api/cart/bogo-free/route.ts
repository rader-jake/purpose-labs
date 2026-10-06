import { NextRequest, NextResponse } from "next/server";
import { addCartItem, applyCoupon, StoreApiError } from "@/lib/cart/storeApi";
import { ensureTokens, readTokens, writeTokens } from "@/lib/cart/session";
import { syncBacWaterPromo } from "@/lib/cart/bacWaterPromo";
import type { Cart } from "@/lib/cart/types";

const WC_BASE = "https://joshuar120.sg-host.com/wp-json/wc/v3";
const WC_AUTH = "Basic " + Buffer.from("Info@purposelabs.shop:KH5x vzQv rq6Y 9ccl peq7 NbCs").toString("base64");

// Creates a single-use 100% off coupon for a specific product, then applies it to cart
export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json();
    if (typeof productId !== "number") {
      return NextResponse.json({ message: "productId must be a number" }, { status: 400 });
    }

    // 1. Create a single-use 100% coupon restricted to this product
    const couponCode = `pl-bogo-${productId}-${Date.now()}`;
    const couponRes = await fetch(`${WC_BASE}/coupons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: WC_AUTH,
      },
      body: JSON.stringify({
        code: couponCode,
        discount_type: "percent",
        amount: "100",
        product_ids: [productId],
        usage_limit: 1,
        usage_limit_per_user: 1,
        individual_use: false,
      }),
    });

    if (!couponRes.ok) {
      const err = await couponRes.json().catch(() => ({}));
      return NextResponse.json({ message: (err as { message?: string }).message ?? "Failed to create coupon" }, { status: 500 });
    }

    const coupon = await couponRes.json() as { code: string };

    // 2. Add the product to cart
    let tokens = await ensureTokens(await readTokens());
    const { tokens: afterAddTokens } = await addCartItem(tokens, productId, 1);
    tokens = afterAddTokens;

    // 3. Apply the coupon
    const { data, tokens: afterCouponTokens } = await applyCoupon(tokens, coupon.code);
    tokens = afterCouponTokens;

    // 4. Sync bac water promo
    const { cart: finalCart, tokens: finalTokens } = await syncBacWaterPromo(data as Cart, tokens);
    await writeTokens(finalTokens);

    return NextResponse.json(finalCart);
  } catch (error) {
    if (error instanceof StoreApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
