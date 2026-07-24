"use client";

// src/components/ProductBuyBox.tsx

import { useState } from "react";
import { useCart } from "@/lib/cart/CartContext";
import { BulkDiscountTiers } from "./BulkDiscountTiers";
import { PaymentIcons } from "./PaymentIcons";
import { CoaButton } from "./CoaButton";

type ProductBuyBoxProps = {
  productId: number;
  productSlug: string;
  name: string;
  price: string;
  outOfStock: boolean;
};

export function ProductBuyBox({
  productId,
  productSlug,
  name,
  price,
  outOfStock,
}: ProductBuyBoxProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const { addItem } = useCart();

  async function handleAddToCart() {
    setIsAdding(true);
    setAddError(null);
    try {
      await addItem(productId, quantity);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Couldn't add to cart");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div style={{ fontFamily: "var(--pl-font-body)" }}>
      <h1
        className="mb-1 text-3xl sm:mb-2 sm:text-4xl lg:text-5xl"
        style={{
          color: "var(--pl-ivory)",
          fontFamily: "var(--pl-font-display)",
          fontWeight: 500,
        }}
      >
        {name}
      </h1>

      <p
        className="mb-3 text-xl font-semibold sm:mb-6 sm:text-2xl"
        style={{ color: "var(--pl-ivory)" }}
      >
        ${price}
      </p>

      <div className="mb-3 sm:mb-6">
        <BulkDiscountTiers onSelectQuantity={setQuantity} />
      </div>

      <div className="mb-3 flex items-center gap-3 sm:mb-5">
        <div
          className="flex items-center rounded-full border"
          style={{ borderColor: "rgba(255,255,255,0.25)" }}
        >
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-4 py-3 text-lg"
            style={{ color: "var(--pl-ivory)" }}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span
            className="w-8 text-center text-sm font-medium"
            style={{ color: "var(--pl-ivory)" }}
          >
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="px-4 py-3 text-lg"
            style={{ color: "var(--pl-ivory)" }}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={outOfStock || isAdding}
          className="flex-1 rounded-full px-8 py-3 text-xs font-semibold uppercase tracking-[0.1em] transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            backgroundColor: "var(--pl-ivory)",
            color: "var(--pl-navy)",
          }}
        >
          {outOfStock ? "Out of stock" : isAdding ? "Adding…" : "Add to Cart"}
        </button>
      </div>

      {addError && (
        <p className="mb-3 text-xs" style={{ color: "var(--pl-ivory)" }}>
          {addError}
        </p>
      )}

      <div className="mb-3 sm:mb-6">
        <PaymentIcons />
      </div>

      {/* CoaButton was styled for the light page — override its color
          variable locally so it reads correctly against this dark hero */}
      <div style={{ ["--pl-navy" as string]: "var(--pl-ivory)" }}>
        <CoaButton productSlug={productSlug} />
      </div>
    </div>
  );
}
