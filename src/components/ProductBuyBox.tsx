"use client";

// src/components/ProductBuyBox.tsx

import { useMemo, useState, useEffect } from "react";
import { useCart } from "@/lib/cart/CartContext";
import { trackViewContent, trackAddToCart } from "@/lib/tiktok-pixel";
import { BulkDiscountTiers } from "./BulkDiscountTiers";
import { PaymentIcons } from "./PaymentIcons";
import { CoaButton } from "./CoaButton";
import type { WooProductVariation } from "@/lib/woocommerce";

type ProductBuyBoxProps = {
  productId: number;
  productSlug: string;
  name: string;
  price: string;
  regularPrice?: string;
  salePrice?: string;
  outOfStock: boolean;
  /** Empty for simple products — only GHK-CU currently has real variations. */
  variations: WooProductVariation[];
  onVariantChange?: (variationId: number) => void;
};

/** Leading number in the option label (e.g. "100mg" -> 100), for sorting
 * variants smallest-first regardless of the order WooCommerce returns
 * them in. Falls back to 0 (stable original order) if unparseable. */
function leadingNumber(option: string): number {
  const match = option.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

export function ProductBuyBox({
  productId,
  productSlug,
  name,
  price,
  regularPrice,
  salePrice,
  outOfStock,
  variations = [],
  onVariantChange,
}: ProductBuyBoxProps) {
  const sortedVariations = useMemo(
    () =>
      [...variations].sort(
        (a, b) => leadingNumber(a.attributes[0]?.option ?? "") - leadingNumber(b.attributes[0]?.option ?? "")
      ),
    [variations]
  );
  const hasVariations = sortedVariations.length > 0;
  const [selectedVariationId, setSelectedVariationId] = useState<number | null>(
    hasVariations ? sortedVariations[0].id : null
  );
  const selectedVariation = sortedVariations.find((v) => v.id === selectedVariationId) ?? null;

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const { addItem, openDrawer } = useCart();

  // Fire ViewContent on mount
  useEffect(() => {
    trackViewContent({
      contentId: String(productId),
      contentName: name,
      value: parseFloat(price) || undefined,
      productId,
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Variable products add the selected variation's id, not the parent
  // product id — WooCommerce needs the variation id to know which
  // size/price to actually add.
  const effectiveId = selectedVariation ? selectedVariation.id : productId;
  const effectivePrice = selectedVariation ? selectedVariation.price : price;
  const effectiveRegularPrice = selectedVariation ? selectedVariation.regular_price : regularPrice;
  const effectiveSalePrice = selectedVariation ? null : salePrice;

  // RESEARCH25: always show 25% off on product pages
  // Compute display price as 75% of regular price (or current price if no regular)
  const research25BasePrice = parseFloat(effectiveRegularPrice || effectivePrice || "0");
  const research25DisplayPrice = research25BasePrice > 0
    ? (research25BasePrice * 0.75).toFixed(2)
    : null;
  // Use RESEARCH25 display if no existing sale price
  const hasDiscount = research25DisplayPrice !== null;
  const displayedRegularPrice = effectiveRegularPrice || effectivePrice;
  const displayedSalePrice = effectiveSalePrice || research25DisplayPrice;

  const effectiveOutOfStock = selectedVariation
    ? selectedVariation.stock_status !== "instock"
    : outOfStock;

  async function handleAddToCart() {
    setIsAdding(true);
    setAddError(null);
    try {
      await addItem(effectiveId, quantity);
      openDrawer();
      await trackAddToCart({
        contentId: String(effectiveId),
        contentName: name,
        value: parseFloat(effectivePrice) || undefined,
        quantity,
        productId: effectiveId,
      });
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

      <div className="mb-3 flex items-baseline gap-3 sm:mb-6">
        {hasDiscount && (
          <span
            className="text-lg line-through opacity-50"
            style={{ color: "var(--pl-ivory)" }}
          >
            ${displayedRegularPrice}
          </span>
        )}
        <p
          className="text-xl font-semibold sm:text-2xl"
          style={{ color: hasDiscount ? "#4ade80" : "var(--pl-ivory)" }}
        >
          ${displayedSalePrice || effectivePrice}
        </p>
        {hasDiscount && (
          <span
            className="rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wide"
            style={{ backgroundColor: "#1B2A4A", color: "#ffffff" }}
          >
            25% OFF
          </span>
        )}
      </div>

      {/* BOGO Callout — Sunday style */}
      <div
        className="mb-4 sm:mb-6 rounded-xl px-5 py-4"
        style={{
          background: "#F8F6F1",
          border: "1px solid #E0D9CE",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: "#EAE6DF", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1B2A4A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="8" width="18" height="13" rx="2" />
              <path d="M12 8v13" />
              <path d="M19 8H5a2 2 0 0 1 0-4h.5" />
              <path d="M12 4c0-1.1.9-2 2-2s2 .9 2 2-2 4-2 4" />
              <path d="M12 4c0-1.1-.9-2-2-2s-2 .9-2 2 2 4 2 4" />
            </svg>
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 13, color: "#1B2A4A", letterSpacing: "0.02em", marginBottom: 4, fontFamily: "var(--pl-font-body)" }}>
              BUY 1, GET 1 FREE
            </p>
            <p style={{ fontSize: 12, color: "#6B6258", lineHeight: 1.5, fontFamily: "var(--pl-font-body)" }}>
              Add an eligible product and choose your free vial of equal or lesser value.
            </p>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#1B2A4A", marginTop: 4, fontFamily: "var(--pl-font-body)" }}>
              No code needed. Choose your free vial in the cart.
            </p>
          </div>
        </div>
      </div>

      {hasVariations && (
        <div className="mb-3 grid grid-cols-2 gap-3 sm:mb-6">
          {sortedVariations.map((variation) => {
            const label = variation.attributes[0]?.option ?? "Option";
            const selected = variation.id === selectedVariationId;
            return (
              <button
                key={variation.id}
                onClick={() => { setSelectedVariationId(variation.id); onVariantChange?.(variation.id); }}
                aria-pressed={selected}
                className="rounded-lg border px-3 py-3 text-center text-xs font-medium transition-colors duration-200 hover:border-current"
                style={{
                  borderColor: selected ? "var(--pl-ivory)" : "rgba(255,255,255,0.25)",
                  backgroundColor: selected ? "var(--pl-ivory)" : "transparent",
                  color: selected ? "var(--pl-navy)" : "var(--pl-ivory)",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

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
          disabled={effectiveOutOfStock || isAdding}
          className="flex-1 rounded-full px-8 py-3 text-xs font-semibold uppercase tracking-[0.1em] transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            backgroundColor: "var(--pl-ivory)",
            color: "var(--pl-navy)",
          }}
        >
          {effectiveOutOfStock ? "Out of stock" : isAdding ? "Adding…" : "Add to Cart"}
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
