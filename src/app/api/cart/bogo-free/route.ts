import { NextRequest, NextResponse } from "next/server";
import { addCartItem, getCart, StoreApiError } from "@/lib/cart/storeApi";
import { ensureTokens, readTokens, writeTokens } from "@/lib/cart/session";
import { syncBacWaterPromo } from "@/lib/cart/bacWaterPromo";
import type { Cart } from "@/lib/cart/types";
import type { CartTokens } from "@/lib/cart/storeApi";

const WC_BASE = process.env.WOOCOMMERCE_URL?.replace(/\/+$/, "") ?? "https://joshuar120.sg-host.com";
const WC_STORE = `${WC_BASE}/wp-json/wc/store/v1`;
const WC_REST = `${WC_BASE}/wp-json/wc/v3`;
const WC_AUTH = "Basic " + Buffer.from("Info@purposelabs.shop:KH5x vzQv rq6Y 9ccl peq7 NbCs").toString("base64");

// Fetch a fresh nonce+cartToken pair directly from WooCommerce
async function getFreshTokens(existingCartToken?: string): Promise<CartTokens> {
  const headers: Record<string, string> = { "Accept": "application/json" };
  if (existingCartToken) headers["Cart-Token"] = existingCartToken;
  const res = await fetch(`${WC_STORE}/cart`, { headers, cache: "no-store" });
  return {
    cartToken: res.headers.get("cart-token") ?? existingCartToken,
    nonce: res.headers.get("nonce") ?? undefined,
  };
}

// Apply coupon directly via WooCommerce Store API with explicit nonce
async function applyBogoDirectly(cartToken: string, nonce: string, couponCode: string): Promise<Cart> {
  const res = await fetch(`${WC_STORE}/cart/apply-coupon`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Cart-Token": cartToken,
      "Nonce": nonce,
    },
    body: JSON.stringify({ code: couponCode }),
    cache: "no-store",
  });
  const body = await res.json();
  if (!res.ok) {
    const msg = (body as { message?: string }).message ?? "Coupon apply failed";
    throw new Error(msg);
  }
  return body as Cart;
}

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json();
    if (typeof productId !== "number") {
      return NextResponse.json({ message: "productId must be a number" }, { status: 400 });
    }

    // 1. Create 100% off coupon for this product via WC REST API
    const couponCode = `pl-bogo-${productId}-${Date.now()}`;
    const couponRes = await fetch(`${WC_REST}/coupons`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: WC_AUTH },
      body: JSON.stringify({
        code: couponCode,
        discount_type: "percent",
        amount: "100",
        product_ids: [productId],
        usage_limit: 1,
        individual_use: false,
      }),
    });
    if (!couponRes.ok) {
      const err = await couponRes.json().catch(() => ({}));
      return NextResponse.json({ message: (err as { message?: string }).message ?? "Failed to create coupon" }, { status: 500 });
    }

    // 2. Add product to cart using stored session tokens
    let tokens = await ensureTokens(await readTokens());
    const { tokens: afterAddTokens } = await addCartItem(tokens, productId, 1);
    tokens = afterAddTokens;

    // 3. Get a guaranteed fresh nonce directly from WooCommerce
    const freshTokens = await getFreshTokens(tokens.cartToken);
    if (!freshTokens.nonce || !freshTokens.cartToken) {
      return NextResponse.json({ message: "Could not get session nonce" }, { status: 500 });
    }

    // 4. Apply coupon with fresh nonce
    const cartWithCoupon = await applyBogoDirectly(freshTokens.cartToken, freshTokens.nonce, couponCode);

    // 5. Sync bac water and write tokens
    const finalTokens: CartTokens = { cartToken: freshTokens.cartToken, nonce: freshTokens.nonce };
    const { cart: finalCart, tokens: syncedTokens } = await syncBacWaterPromo(cartWithCoupon, finalTokens);
    await writeTokens(syncedTokens);

    return NextResponse.json(finalCart);
  } catch (error) {
    if (error instanceof StoreApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    throw error;
  }
}
