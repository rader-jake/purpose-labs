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
  const { addItem } = useCart();

  const image = product.images?.[0];
  const outOfStock = product.stock_status === "outofstock";

  async function handleAddToCart() {
    setIsAdding(true);
    setAddError(null);
    try {
      await addItem(product.id, quantity);
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

        <p
          className="text-sm font-medium"
          style={{
            color: "var(--pl-slate)",
            fontFamily: "var(--pl-font-body)",
          }}
          // WooCommerce prices arrive as a plain numeric string, not HTML
        >
          ${product.price}
        </p>

        {product.short_description && (
          <div
            className="line-clamp-3 text-sm leading-relaxed"
            style={{
              color: "var(--pl-text-secondary)",
              fontFamily: "var(--pl-font-body)",
            }}
            // short_description comes from WooCommerce as trusted HTML
            // you control via wp-admin — safe to render, but worth a
            // second look if product descriptions ever accept public input
            dangerouslySetInnerHTML={{ __html: product.short_description }}
          />
        )}

        {product.casNumber && (
          <span
            className="inline-block w-fit rounded px-3 py-1 text-xs font-semibold"
            style={{
              backgroundColor: "var(--pl-navy)",
              color: "var(--pl-ivory)",
              fontFamily: "var(--pl-font-body)",
            }}
          >
            CAS: {product.casNumber}
          </span>
        )}

        <CoaButton productSlug={product.slug} />

        {product.type === "variable" ? (
          // Variable products (currently just GHK-CU) need a size picked
          // before anything can be added — the Store API rejects the
          // parent product id outright ("Missing attributes for variable
          // product"). Send shoppers to the real selector on the product
          // page instead of a quick-add button that would just error.
          <div className="mt-auto pt-2">
            <Link
              href={`/products/${product.slug}`}
              className="flex items-center justify-center rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors duration-200"
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
        ) : (
          <>
            <div className="mt-auto flex items-center gap-3 pt-2">
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Number(e.target.value) || 1))
                }
                className="w-16 rounded border px-3 py-2 text-center text-sm"
                style={{
                  borderColor: "var(--pl-border)",
                  color: "var(--pl-navy)",
                  fontFamily: "var(--pl-font-body)",
                }}
              />

              <button
                onClick={handleAddToCart}
                disabled={outOfStock || isAdding}
                className="flex-1 rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
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
                {outOfStock ? "Out of stock" : isAdding ? "Adding…" : "Add to cart"}
              </button>
            </div>

            {addError && (
              <p
                className="text-xs"
                style={{ color: "var(--pl-slate)", fontFamily: "var(--pl-font-body)" }}
              >
                {addError}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
