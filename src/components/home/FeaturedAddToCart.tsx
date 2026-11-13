"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";

type FeaturedAddToCartProps = {
  productId: number;
  productSlug: string;
  productType: string;
  stockStatus: string;
  dosage?: string | null;
};

export function FeaturedAddToCart({
  productId,
  productSlug,
  productType,
  stockStatus,
  dosage,
}: FeaturedAddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  const outOfStock = stockStatus === "outofstock";

  async function handleAddToCart() {
    setIsAdding(true);
    setError(null);
    try {
      await addItem(productId, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error adding to cart");
    } finally {
      setIsAdding(false);
    }
  }

  if (productType === "variable") {
    return (
      <div className="flex flex-col gap-3 w-full">
        {dosage && (
          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
              style={{ background: "#0D1A30" }}
            >
              {dosage}
            </span>
          </div>
        )}
        <Link
          href={`/products/${productSlug}`}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-black text-white transition-opacity duration-200 hover:opacity-85"
          style={{ background: "#0D1A30" }}
        >
          <CartIcon /> Select Options
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">

      {/* Row: dosage pill on left, qty stepper on right */}
      <div className="flex items-center justify-between">
        {dosage ? (
          <span
            className="rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white flex-shrink-0"
            style={{ background: "#0D1A30" }}
          >
            {dosage}
          </span>
        ) : <span />}

        {/* +/- stepper — right side */}
        <div
          className="flex items-center rounded-lg overflow-hidden border"
          style={{ borderColor: "rgba(0,0,0,0.12)" }}
        >
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            disabled={outOfStock || quantity <= 1}
            className="w-9 h-9 flex items-center justify-center text-lg font-bold disabled:opacity-30 hover:bg-gray-100 transition-colors"
            style={{ color: "#0D1A30" }}
          >
            −
          </button>
          <span
            className="w-8 text-center text-sm font-bold select-none"
            style={{ color: "#0D1A30" }}
          >
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(q => q + 1)}
            disabled={outOfStock}
            className="w-9 h-9 flex items-center justify-center text-lg font-bold disabled:opacity-30 hover:bg-gray-100 transition-colors"
            style={{ color: "#0D1A30" }}
          >
            +
          </button>
        </div>
      </div>

      {/* Add to Cart button — full width, dark rounded */}
      <button
        onClick={handleAddToCart}
        disabled={outOfStock || isAdding}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-black text-white transition-opacity duration-200 hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: "#0D1A30" }}
      >
        <CartIcon />
        {outOfStock ? "Out of Stock" : isAdding ? "Adding..." : added ? "Added ✓" : "Add to Cart"}
      </button>

      {error && (
        <span className="text-[11px] text-red-500 font-medium">{error}</span>
      )}
    </div>
  );
}

function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  );
}
