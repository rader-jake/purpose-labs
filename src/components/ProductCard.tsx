"use client";

import { useState } from "react";
import Link from "next/link";
import type { WooProduct } from "@/lib/woocommerce";
import { useCart } from "@/lib/cart/CartContext";
import { CoaButton } from "@/components/CoaButton";

export type Product = WooProduct;

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const { addItem, openDrawer } = useCart();

  const image = product.images?.[0];
  const outOfStock = product.stock_status === "outofstock";

  async function handleAddToCart() {
    setIsAdding(true);
    setAddError(null);
    try {
      await addItem(product.id, quantity);
      openDrawer();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Couldn't add to cart");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex flex-col overflow-hidden rounded-lg transition-all duration-200"
      style={{
        backgroundColor: "var(--pl-white)",
        border: `1px solid ${
          isHovered ? "var(--pl-border-strong)" : "var(--pl-border)"
        }`,
        boxShadow: isHovered
          ? "var(--pl-shadow-hover)"
          : "var(--pl-shadow-subtle)",
        transform: isHovered ? "translateY(-3px)" : "translateY(0)",
      }}
    >
      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="flex h-64 items-center justify-center p-8"
        style={{ backgroundColor: "var(--pl-ivory-soft)" }}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.src}
            alt={image.alt || product.name}
            className="h-full w-full object-contain"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            className="text-xs"
            style={{ color: "var(--pl-muted)" }}
          >
            No image
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3
          className="text-2xl leading-tight"
          style={{
            color: "var(--pl-navy)",
            fontFamily: "var(--pl-font-display)",
            fontWeight: 500,
            letterSpacing: "-0.012em",
          }}
        >
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>

        {/* Dosage pill + quantity box row */}
        {(() => {
          const dosage = product.attributes?.[0]?.options?.[0];
          return (
            <div className="flex items-center gap-2" style={{ fontFamily: "var(--pl-font-body)" }}>
              {dosage && (
                <span
                  className="rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.08em]"
                  style={{
                    backgroundColor: "var(--pl-navy)",
                    color: "var(--pl-ivory)",
                  }}
                >
                  {dosage}
                </span>
              )}
              {product.type !== "variable" && (
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Number(e.target.value) || 1))
                  }
                  className="w-16 rounded-lg border px-2 py-1.5 text-center text-sm"
                  style={{
                    borderColor: "var(--pl-border-strong)",
                    color: "var(--pl-navy)",
                    fontFamily: "var(--pl-font-body)",
                  }}
                />
              )}
            </div>
          );
        })()}

        {/* Price */}
        <div style={{ fontFamily: "var(--pl-font-body)" }}>
          <p className="text-xl font-semibold" style={{ color: "var(--pl-navy)" }}>
            ${product.price}
          </p>
        </div>

        <CoaButton productSlug={product.slug} />

        {/* Add to cart */}
        {product.type === "variable" ? (
          <div className="mt-auto pt-1">
            <Link
              href={`/products/${product.slug}`}
              className="flex items-center justify-center gap-2 rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors duration-200"
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
              🛒 Select Options
            </Link>
          </div>
        ) : (
          <div className="mt-auto pt-1">
            <button
              onClick={handleAddToCart}
              disabled={outOfStock || isAdding}
              className="flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: "var(--pl-navy)",
                color: "var(--pl-ivory)",
                fontFamily: "var(--pl-font-body)",
              }}
              onMouseEnter={(e) => {
                if (!outOfStock)
                  e.currentTarget.style.backgroundColor = "var(--pl-navy-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--pl-navy)";
              }}
            >
              🛒 {outOfStock ? "Out of stock" : isAdding ? "Adding…" : "Add to cart"}
            </button>
            {addError && (
              <p className="mt-1 text-xs" style={{ color: "var(--pl-slate)" }}>
                {addError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
