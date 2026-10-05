"use client";

import { useState } from "react";

export interface MixMatchProduct {
  name: string;
  price: number;
  wooProductId: number | null;
  image?: string;
}

interface BogoModalProps {
  tier: number;
  tierPrice: number;
  products: MixMatchProduct[];
  onConfirm: (freeProduct: MixMatchProduct) => void;
  onClose: () => void;
  isAdding: boolean;
}

export function BogoModal({
  tier,
  tierPrice,
  products,
  onConfirm,
  onClose,
  isAdding,
}: BogoModalProps) {
  const [selected, setSelected] = useState<MixMatchProduct | null>(null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 md:p-8"
        style={{ backgroundColor: "var(--pl-white)", boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div
            className="inline-block rounded-full px-4 py-1 mb-3 text-xs font-black uppercase tracking-[0.18em]"
            style={{ background: "linear-gradient(90deg, #0B1728 0%, #2E4A8A 100%)", color: "white" }}
          >
            Tier {tier} — Free Vial
          </div>
          <h2
            className="text-2xl font-semibold mb-1"
            style={{ color: "var(--pl-navy)", fontFamily: "var(--pl-font-display)" }}
          >
            Pick Your Free Vial
          </h2>
          <p className="text-sm" style={{ color: "var(--pl-text-secondary)" }}>
            Choose any Tier {tier} product (${tierPrice} value) — on us!
          </p>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {products.map((product) => {
            const isSelected = selected?.name === product.name;
            return (
              <button
                key={product.name}
                onClick={() => setSelected(product)}
                className="relative flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-all duration-150"
                style={{
                  border: `2px solid ${isSelected ? "var(--pl-navy)" : "var(--pl-border)"}`,
                  backgroundColor: isSelected ? "rgba(27,42,74,0.06)" : "var(--pl-ivory-soft)",
                  cursor: "pointer",
                }}
              >
                {isSelected && (
                  <div
                    className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: "var(--pl-navy)" }}
                  >
                    ✓
                  </div>
                )}
                {/* Placeholder image */}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "rgba(27,42,74,0.08)" }}
                >
                  <span className="text-2xl">🧪</span>
                </div>
                <span
                  className="text-xs font-medium leading-tight"
                  style={{ color: "var(--pl-navy)", fontFamily: "var(--pl-font-body)" }}
                >
                  {product.name}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--pl-muted)" }}
                >
                  ${product.price}
                </span>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <button
          onClick={() => selected && onConfirm(selected)}
          disabled={!selected || isAdding}
          className="w-full rounded-full py-4 text-sm font-black uppercase tracking-[0.15em] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background: selected
              ? "linear-gradient(90deg, #0B1728 0%, #2E4A8A 100%)"
              : "var(--pl-border)",
            color: selected ? "white" : "var(--pl-muted)",
          }}
        >
          {isAdding
            ? "Adding to cart…"
            : selected
            ? `Add Free Vial · $0.00`
            : "Select a product above"}
        </button>
      </div>
    </div>
  );
}
