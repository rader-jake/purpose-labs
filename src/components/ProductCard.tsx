"use client";

import { useState } from "react";
import Link from "next/link";
import type { WooProduct } from "@/lib/woocommerce";
import { useCart } from "@/lib/cart/CartContext";

export type Product = WooProduct;

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { addItem, openDrawer } = useCart();

  const image = product.images?.[0];
  const outOfStock = product.stock_status === "outofstock";
  // Extract dosage from product name e.g. "BPC-157 – 10MG" → "10MG"
  const dosageMatch = product.name.match(/(\d+(?:\.\d+)?\s*(?:mg|mcg|iu|ml|g)(?:\s*\/\s*\d+\s*(?:mg|ml))?)/i);
  const dosage = dosageMatch ? dosageMatch[0].toUpperCase() : null;
  const price = parseFloat(product.price || "0");

  async function handleAddToCart() {
    setIsAdding(true);
    try {
      await addItem(product.id, 1);
      openDrawer();
    } catch {
      // silent — drawer still opens
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white border border-[#EBEBEB] transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">

      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative flex items-center justify-center"
        style={{ backgroundColor: "#F2F2F2", minHeight: 240 }}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.src}
            alt={image.alt || product.name}
            className="h-full w-full object-contain"
            style={{ maxHeight: 240 }}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="text-xs text-gray-400">No image</div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-col gap-3 p-5">

        {/* Product name */}
        <h3 className="text-lg font-semibold leading-snug text-[#111]">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>

        {/* Dosage pill */}
        {dosage && (
          <div>
            <span className="inline-block rounded-full bg-[#1a1a1a] px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
              {dosage}
            </span>
          </div>
        )}

        {/* Price */}
        {price > 0 && (
          <p className="text-xl font-semibold text-[#111]">
            ${product.price}
          </p>
        )}

        {/* Add to cart / Select options */}
        {product.type === "variable" ? (
          <Link
            href={`/products/${product.slug}`}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1a1a1a] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
          >
            🛒 Select Options
          </Link>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={outOfStock || isAdding}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1a1a1a] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            🛒 {outOfStock ? "Out of stock" : isAdding ? "Adding…" : "Add to cart"}
          </button>
        )}
      </div>
    </div>
  );
}
