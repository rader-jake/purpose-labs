"use client";

// src/components/ProductBuyBox.tsx

import { useMemo, useState, useEffect } from "react";
import { useCart } from "@/lib/cart/CartContext";
import { trackViewContent, trackAddToCart } from "@/lib/tiktok-pixel";
import { gtmViewItem, gtmAddToCart } from "@/lib/gtm";
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

  // Fire ViewContent + GTM view_item on mount
  useEffect(() => {
    trackViewContent({
      contentId: String(productId),
      contentName: name,
      value: parseFloat(price) || undefined,
      productId,
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
    });
    gtmViewItem({
      item_id: String(productId),
      item_name: name,
      price: parseFloat(price) || undefined,
      quantity: 1,
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

  const hasDiscount = !!effectiveSalePrice && effectiveSalePrice !== effectiveRegularPrice;
  const displayedRegularPrice = effectiveRegularPrice || effectivePrice;
  const displayedSalePrice = effectiveSalePrice || null;

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
      gtmAddToCart({
        item_id: String(effectiveId),
        item_name: name,
        price: parseFloat(effectivePrice) || undefined,
        quantity,
      });
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Couldn't add to cart");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div style={{ fontFamily: "var(--pl-font-body)", color: "#0d1b2e" }}>

      {/* Name */}
      <h1
        className="mb-1"
        style={{ fontFamily: "var(--pl-font-display)", fontWeight: 700, fontSize: "clamp(1.6rem, 4vw, 2.4rem)", lineHeight: 1.1, color: "#0d1b2e" }}
      >
        {name}
      </h1>
      <p className="mb-4 text-sm" style={{ color: "#6b7280" }}>For research use only. Not for human or veterinary consumption.</p>

      {/* Price */}
      <div className="mb-1 flex items-baseline gap-3">
        {hasDiscount && (
          <span className="text-lg line-through" style={{ color: "#9ca3af" }}>${displayedRegularPrice}</span>
        )}
        <span className="text-3xl font-black" style={{ color: "#0d1b2e" }}>${displayedSalePrice || effectivePrice}</span>
      </div>

      {/* Per-vial savings */}
      {productId !== 840 && parseFloat(displayedSalePrice || effectivePrice || "0") > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: "#6b7280" }}>
            = ${(parseFloat(displayedSalePrice || effectivePrice || "0") / 2).toFixed(2)}/vial with BOGO
          </span>
          <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: "#eef2f8", color: "#0d1b2e" }}>
            Buy 1 Get 1 Free
          </span>
        </div>
      )}

      {/* Size pills */}
      {hasVariations && (
        <div className="mb-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: "#6b7280" }}>Size (MG)</p>
          <div className="flex flex-wrap gap-2">
            {sortedVariations.map((variation) => {
              const label = variation.attributes[0]?.option ?? "Option";
              const selected = variation.id === selectedVariationId;
              return (
                <button
                  key={variation.id}
                  onClick={() => { setSelectedVariationId(variation.id); onVariantChange?.(variation.id); }}
                  aria-pressed={selected}
                  className="rounded-full px-5 py-2.5 text-sm font-bold border transition-all duration-150"
                  style={{
                    background: selected ? "#0d1b2e" : "#fff",
                    color: selected ? "#fff" : "#0d1b2e",
                    borderColor: selected ? "#0d1b2e" : "#d1d5db",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* THE ROW: − qty + | Add to Cart | COA */}
      <div className="mb-5 flex items-center gap-3">

        {/* Qty stepper */}
        <div className="flex items-center rounded-full border flex-shrink-0" style={{ borderColor: "#d1d5db", background: "#fff" }}>
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-11 h-12 flex items-center justify-center text-xl font-bold hover:bg-gray-50 transition-colors rounded-full"
            style={{ color: "#0d1b2e" }}
          >−</button>
          <span className="w-8 text-center text-sm font-bold select-none" style={{ color: "#0d1b2e" }}>{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="w-11 h-12 flex items-center justify-center text-xl font-bold hover:bg-gray-50 transition-colors rounded-full"
            style={{ color: "#0d1b2e" }}
          >+</button>
        </div>

        {/* Add to Cart — big pill */}
        <button
          onClick={handleAddToCart}
          disabled={effectiveOutOfStock || isAdding}
          className="flex-1 h-12 flex items-center justify-center rounded-full text-sm font-black transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "#0d1b2e", color: "#fff", fontSize: 15 }}
        >
          {effectiveOutOfStock ? "Out of Stock" : isAdding ? "Adding…" : "Add to Cart"}
        </button>

        {/* COA icon button */}
        <div style={{ ["--pl-navy" as string]: "#0d1b2e" }}>
          <CoaButton productSlug={productSlug} />
        </div>

      </div>

      {addError && <p className="mb-3 text-xs text-red-500">{addError}</p>}

      {/* BOGO callout */}
      {productId !== 840 && (
        <div className="mb-5 rounded-2xl px-5 py-4" style={{ background: "#f0f4ff", border: "1.5px solid #d0d9e8" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: "#0d1b2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13"/>
                <path d="M19 8H5a2 2 0 0 1 0-4h.5"/>
                <path d="M12 4c0-1.1.9-2 2-2s2 .9 2 2-2 4-2 4"/>
                <path d="M12 4c0-1.1-.9-2-2-2s-2 .9-2 2 2 4 2 4"/>
              </svg>
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 13, color: "#0d1b2e", marginBottom: 3 }}>BUY 1, GET 1 FREE</p>
              <p style={{ fontSize: 12, color: "#5a6a7a", lineHeight: 1.5 }}>Add an eligible product and choose your free vial. No code needed.</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4"><PaymentIcons /></div>
      <div className="mb-4"><BulkDiscountTiers onSelectQuantity={setQuantity} /></div>

    </div>
  );
}
