"use client";

import { useState } from "react";
import Link from "next/link";
import type { WooProduct } from "@/lib/woocommerce";
import { useCart } from "@/lib/cart/CartContext";

type FeaturedProductCardProps = {
  product: WooProduct;
};

const DOSAGE_OVERRIDES: Record<string, string> = {
  "pl-rt": "10MG",
  "pl-tz": "5MG",
  "pl-tesa": "5MG / 10MG",
  "klow-80mg": "80MG",
  "wolverine-stack-bpc-157-tb-500": "BPC-157 + TB-500",
  "the-jimmy-neutron-stack-semax-selank-dispersal-kit": "Semax + Selank",
};

function extractDosage(name: string, slug: string): string | null {
  const override = DOSAGE_OVERRIDES[slug];
  if (override) return override;
  const match = name.match(/(\d+(?:\.\d+)?\s?(?:mg|mcg|iu|ml|g)(?:\/(?:ml|vial))?)/i);
  return match ? match[1].toUpperCase() : null;
}

export function FeaturedProductCard({ product }: FeaturedProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem, openDrawer } = useCart();

  const image = product.images?.[0];
  const outOfStock = product.stock_status === "outofstock";
  const dosage = extractDosage(product.name, product.slug);
  const displayPrice = product.price ? `$${parseFloat(product.price).toFixed(2)}` : null;

  async function handleAddToCart() {
    setIsAdding(true);
    try {
      await addItem(product.id, quantity);
      setAdded(true);
      openDrawer();
      setTimeout(() => setAdded(false), 1800);
    } catch {
      // silent
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-[rgba(0,0,0,0.07)] hover:shadow-[0_8px_32px_rgba(20,39,78,0.10)] transition-all duration-300">

      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative flex items-center justify-center overflow-hidden"
        style={{ background: "#DDE3EE", aspectRatio: "1/1" }}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.src}
            alt={image.alt || product.name}
            className="w-4/5 h-4/5 object-contain select-none pointer-events-none transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="text-xs text-gray-400">No Image</div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-col p-4 gap-3">

        {/* 1. Product name */}
        <h3 className="text-base font-bold leading-tight" style={{ color: "#0D1A30" }}>
          <Link href={`/products/${product.slug}`} className="hover:opacity-70 transition-opacity">
            {product.name}
          </Link>
        </h3>

        {/* 2. Dosage pill (left) + qty stepper (right) */}
        {product.type !== "variable" && (
          <div className="flex items-center justify-between">
            {dosage ? (
              <span className="rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white" style={{ background: "#0D1A30" }}>
                {dosage}
              </span>
            ) : <span />}

            <div className="flex items-center rounded-lg overflow-hidden border" style={{ borderColor: "rgba(0,0,0,0.12)" }}>
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={outOfStock || quantity <= 1}
                className="w-9 h-9 flex items-center justify-center text-lg font-bold disabled:opacity-30 hover:bg-gray-100 transition-colors"
                style={{ color: "#0D1A30" }}
              >−</button>
              <span className="w-8 text-center text-sm font-bold select-none" style={{ color: "#0D1A30" }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                disabled={outOfStock}
                className="w-9 h-9 flex items-center justify-center text-lg font-bold disabled:opacity-30 hover:bg-gray-100 transition-colors"
                style={{ color: "#0D1A30" }}
              >+</button>
            </div>
          </div>
        )}

        {/* 3. Price */}
        {displayPrice && (
          <p className="text-xl font-bold" style={{ color: "#0D1A30" }}>
            {displayPrice}
          </p>
        )}

        {/* 4. Add to Cart / Select Options */}
        {product.type === "variable" ? (
          <Link
            href={`/products/${product.slug}`}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-black text-white transition-opacity hover:opacity-85"
            style={{ background: "#0D1A30" }}
          >
            <CartIcon /> Select Options
          </Link>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={outOfStock || isAdding}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-black text-white transition-opacity hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "#0D1A30" }}
          >
            <CartIcon />
            {outOfStock ? "Out of Stock" : isAdding ? "Adding..." : added ? "Added ✓" : "Add to Cart"}
          </button>
        )}

      </div>
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
