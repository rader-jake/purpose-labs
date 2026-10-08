import { NextRequest, NextResponse } from "next/server";
import { addCartItem, StoreApiError } from "@/lib/cart/storeApi";
import { ensureTokens, readTokens, writeTokens } from "@/lib/cart/session";
import { syncBacWaterPromo } from "@/lib/cart/bacWaterPromo";
import type { Cart } from "@/lib/cart/types";

const WC_BASE = process.env.WOOCOMMERCE_URL?.replace(/\/+$/, "") ?? "https://joshuar120.sg-host.com";
const WC_AUTH = "Basic " + Buffer.from("Info@purposelabs.shop:KH5x vzQv rq6Y 9ccl peq7 NbCs").toString("base64");

// Step 1: Add item to cart + create coupon code, return both to frontend
// Step 2: Frontend applies the coupon via /api/cart/apply-coupon (which already works)
export async function POST(request: NextRequest) {
  try {
    const { productId, applyCode } = await request.json();
    if (typeof productId !== "number") {
      return NextResponse.json({ message: "productId must be a number" }, { status: 400 });
    }

    // If frontend is applying the coupon code (step 2), delegate to apply-coupon
    if (applyCode) {
      const { applyCoupon } = await import("@/lib/cart/storeApi");
      let tokens = await ensureTokens(await readTokens());
      const { data, tokens: nextTokens } = await applyCoupon(tokens, applyCode);
      await writeTokens(nextTokens);
      return NextResponse.json(data);
    }

    // Step 1: Create coupon first (before adding item so WC cache has time to settle)
    const couponCode = `pl-bogo-${productId}-${Date.now()}`;
    const couponRes = await fetch(`${WC_BASE}/wp-json/wc/v3/coupons`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: WC_AUTH },
      body: JSON.stringify({
        code: couponCode,
        discount_type: "percent",
        amount: "100",
        product_ids: [productId],
        usage_limit: 2,
        individual_use: false,
      }),
    });
    if (!couponRes.ok) {
      const err = await couponRes.json().catch(() => ({}));
      return NextResponse.json({ message: (err as { message?: string }).message ?? "Failed to create coupon" }, { status: 500 });
    }

    // Add the item to cart
    let tokens = await ensureTokens(await readTokens());
    const { data, tokens: afterAddTokens } = await addCartItem(tokens, productId, 1);
    tokens = afterAddTokens;

    // Sync bac water
    const { cart: finalCart, tokens: finalTokens } = await syncBacWaterPromo(data as Cart, tokens);
    await writeTokens(finalTokens);

    // Return cart + coupon code — frontend will apply the coupon separately
    return NextResponse.json({ cart: finalCart, couponCode });
  } catch (error) {
    if (error instanceof StoreApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    throw error;
  }
}
