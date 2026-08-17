"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart/CartContext";

/**
 * Reads the ?discount= URL param and silently applies it as a coupon.
 * Fires once on mount — no UI, no noise.
 */
export function DiscountAutoApply() {
  const searchParams = useSearchParams();
  const { applyCoupon } = useCart();

  useEffect(() => {
    const code = searchParams.get("discount");
    if (!code) return;
    applyCoupon(code).catch(() => {/* silent fail */});
  }, [searchParams, applyCoupon]);

  return null;
}
