"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";

type FeaturedAddToCartProps = {
  productId: number;
  productSlug: string;
  productType: string;
  stockStatus: string;
};

export function FeaturedAddToCart({
  productId,
  productSlug,
  productType,
  stockStatus,
}: FeaturedAddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  const outOfStock = stockStatus === "outofstock";

  async function handleAddToCart() {
    setIsAdding(true);
    setError(null);
    try {
      await addItem(productId, quantity);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error adding to cart");
    } finally {
      setIsAdding(false);
    }
  }

  if (productType === "variable") {
    // Variable products (currently just GHK-CU) need a size picked before
    // anything can be added — same reasoning as ProductCard.tsx.
    return (
      <div className="mt-auto pt-3">
        <Link
          href={`/products/${productSlug}`}
          className="flex h-10 w-full items-center justify-center rounded-full text-[10px] font-bold uppercase tracking-[0.12em] transition-all duration-300"
          style={{
            backgroundColor: "var(--pl-navy)",
            color: "var(--pl-ivory)",
            fontFamily: "var(--pl-font-body)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--pl-navy-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--pl-navy)";
          }}
        >
          Select Options
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full mt-auto pt-3">
      <div className="flex items-center gap-3">
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          disabled={outOfStock}
          className="w-16 h-10 rounded border text-center text-xs font-semibold focus:outline-none transition-colors duration-200"
          style={{
            borderColor: "var(--pl-border)",
            color: "var(--pl-navy)",
            backgroundColor: outOfStock ? "rgba(155,164,180,0.05)" : "var(--pl-white)",
            fontFamily: "var(--pl-font-body)",
          }}
        />
        <button
          onClick={handleAddToCart}
          disabled={outOfStock || isAdding}
          className="flex-1 h-10 rounded-full text-[10px] font-bold uppercase tracking-[0.12em] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed text-center"
          style={{
            backgroundColor: "var(--pl-navy)",
            color: "var(--pl-ivory)",
            fontFamily: "var(--pl-font-body)",
          }}
          onMouseEnter={(e) => {
            if (!outOfStock && !isAdding) {
              e.currentTarget.style.backgroundColor = "var(--pl-navy-hover)";
            }
          }}
          onMouseLeave={(e) => {
            if (!outOfStock && !isAdding) {
              e.currentTarget.style.backgroundColor = "var(--pl-navy)";
            }
          }}
        >
          {outOfStock ? "Out of Stock" : isAdding ? "Adding..." : "Add to Cart"}
        </button>
      </div>
      {error && (
        <span className="text-[10px] text-red-600 font-medium" style={{ fontFamily: "var(--pl-font-body)" }}>
          {error}
        </span>
      )}
    </div>
  );
}
