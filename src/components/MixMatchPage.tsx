"use client";

import { useState } from "react";
import { BogoModal, type MixMatchProduct } from "@/components/BogoModal";

// ─── Product Data ────────────────────────────────────────────────────────────

interface Tier {
  number: number;
  price: number;
  label: string;
  products: MixMatchProduct[];
}

const TIERS: Tier[] = [
  {
    number: 1,
    price: 49.99,
    label: "Tier 1 — $49.99 each",
    products: [
      { name: "Glutathione", price: 49.99, wooProductId: null },
      { name: "MT2 (Melanotan II)", price: 49.99, wooProductId: null },
      { name: "GHK-Cu 50mg", price: 49.99, wooProductId: null },
      { name: "Selank Vial", price: 49.99, wooProductId: null },
      { name: "Semax Vial", price: 49.99, wooProductId: null },
      { name: "L-Carnitine", price: 49.99, wooProductId: null },
    ],
  },
  {
    number: 2,
    price: 75,
    label: "Tier 2 — $75 each",
    products: [
      { name: "NAD+", price: 75, wooProductId: null },
      { name: "MOTS-C", price: 75, wooProductId: null },
      { name: "Selank Spray", price: 75, wooProductId: null },
      { name: "Semax Spray", price: 75, wooProductId: null },
      { name: "GHK-Cu 100mg", price: 75, wooProductId: null },
    ],
  },
  {
    number: 3,
    price: 90,
    label: "Tier 3 — $90 each",
    products: [
      { name: "GLP-3RT", price: 90, wooProductId: null },
      { name: "BPC-157", price: 90, wooProductId: null },
      { name: "TB-500", price: 90, wooProductId: null },
      { name: "BPC-157 + TB-500 Stack", price: 90, wooProductId: null },
      { name: "CJC-1295 + Ipamorelin", price: 90, wooProductId: null },
      { name: "KLOW 80mg (peptide blend)", price: 90, wooProductId: null },
      { name: "PL TZ (Tirzepatide)", price: 90, wooProductId: null },
      { name: "PL TESA (Tesamorelin)", price: 90, wooProductId: null },
      { name: "IGF-1 LR3", price: 90, wooProductId: null },
      { name: "GHK-Cu 50mg x3", price: 90, wooProductId: null },
    ],
  },
];

const CART_URL = "https://joshuar120.sg-host.com/cart";
const API_BASE = "https://joshuar120.sg-host.com/wp-json/wc/store/v1/cart/add-item";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function addToCart(productId: number, quantity = 1) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ id: productId, quantity }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message ?? "Failed to add to cart");
  }
}

// ─── Product Card ─────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: MixMatchProduct;
  onAddToCart: (product: MixMatchProduct) => void;
  isLoading: boolean;
}

function MixMatchCard({ product, onAddToCart, isLoading }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const unavailable = product.wooProductId === null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col overflow-hidden rounded-xl transition-all duration-200"
      style={{
        backgroundColor: "var(--pl-white)",
        border: `1px solid ${hovered ? "var(--pl-border-strong)" : "var(--pl-border)"}`,
        boxShadow: hovered ? "var(--pl-shadow-hover)" : "var(--pl-shadow-subtle)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
      }}
    >
      {/* Image placeholder */}
      <div
        className="flex h-40 items-center justify-center"
        style={{ backgroundColor: "var(--pl-ivory-soft)" }}
      >
        <span className="text-5xl">🧪</span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3
          className="text-base leading-tight font-medium"
          style={{ color: "var(--pl-navy)", fontFamily: "var(--pl-font-display)" }}
        >
          {product.name}
        </h3>
        <p className="text-sm" style={{ color: "var(--pl-slate)", fontFamily: "var(--pl-font-body)" }}>
          ${product.price.toFixed(2)}
        </p>

        <div className="mt-auto">
          {unavailable ? (
            <div
              className="w-full rounded-full py-3 text-center text-xs font-semibold uppercase tracking-[0.1em]"
              style={{
                backgroundColor: "var(--pl-border)",
                color: "var(--pl-muted)",
                fontFamily: "var(--pl-font-body)",
              }}
            >
              Coming Soon
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(product)}
              disabled={isLoading}
              className="w-full rounded-full py-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--pl-navy)",
                color: "var(--pl-ivory)",
                fontFamily: "var(--pl-font-body)",
              }}
              onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = "var(--pl-navy-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--pl-navy)"; }}
            >
              {isLoading ? "Adding…" : "Add to Cart"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step Explainer ───────────────────────────────────────────────────────────

const STEPS = [
  { number: "1", label: "Choose your tier", desc: "Three price points — pick the one that fits." },
  { number: "2", label: "Pick your product", desc: "Select the product you want to buy." },
  { number: "3", label: "Select your free vial", desc: "Choose any product from the same tier — free." },
];

function StepExplainer() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
      {STEPS.map((step, i) => (
        <div key={step.number} className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div
            className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl font-black"
            style={{ background: "linear-gradient(135deg, #0B1728 0%, #2E4A8A 100%)", color: "white" }}
          >
            {step.number}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm" style={{ color: "var(--pl-navy)", fontFamily: "var(--pl-font-display)" }}>
              {step.label}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--pl-text-secondary)" }}>
              {step.desc}
            </div>
          </div>
          {i < STEPS.length - 1 && (
            <div className="hidden md:block text-gray-300 text-2xl font-light ml-2">→</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

interface ModalState {
  tier: Tier;
  paidProduct: MixMatchProduct;
}

export function MixMatchPage() {
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleAddToCart(tier: Tier, product: MixMatchProduct) {
    setError(null);
    setModalState({ tier, paidProduct: product });
  }

  async function handleConfirmFreeVial(freeProduct: MixMatchProduct) {
    if (!modalState) return;
    const { paidProduct } = modalState;

    // Both must have real IDs (free vial is also checked because modal only shows available products,
    // but the paid product was already checked before modal opened)
    if (!paidProduct.wooProductId || !freeProduct.wooProductId) {
      setError("One or more products is not yet available. Please check back soon.");
      return;
    }

    setIsAdding(true);
    setError(null);

    try {
      await addToCart(paidProduct.wooProductId, 1);
      await addToCart(freeProduct.wooProductId, 1);
      window.location.href = CART_URL;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add to cart. Please try again.");
      setIsAdding(false);
    }
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--pl-background)" }}>
      {/* Hero */}
      <section
        className="py-16 px-4 text-center"
        style={{ background: "linear-gradient(135deg, #0B1728 0%, #1B2A4A 60%, #2E4A8A 100%)" }}
      >
        <div className="max-w-3xl mx-auto">
          <div
            className="inline-block rounded-full px-5 py-1.5 mb-5 text-xs font-black uppercase tracking-[0.2em]"
            style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)" }}
          >
            Limited Promotion
          </div>
          <h1
            className="text-4xl md:text-6xl font-semibold mb-4 text-white"
            style={{ fontFamily: "var(--pl-font-display)", letterSpacing: "-0.02em" }}
          >
            Mix &amp; Match BOGO
          </h1>
          <p className="text-lg md:text-xl mb-2" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "var(--pl-font-body)" }}>
            Buy one, get one free — within any tier.
          </p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            Mix any two products from the same tier. No codes needed.
          </p>
        </div>
      </section>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        {/* Steps */}
        <StepExplainer />

        {error && (
          <div className="mb-8 p-4 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">
            {error}
          </div>
        )}

        {/* Tier sections */}
        {TIERS.map((tier) => (
          <section key={tier.number} className="mb-14">
            {/* Tier header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
              <div
                className="inline-flex items-center gap-3 rounded-full px-5 py-2"
                style={{ background: "linear-gradient(90deg, #0B1728 0%, #2E4A8A 100%)" }}
              >
                <span className="text-white font-black text-sm uppercase tracking-[0.15em]">
                  Tier {tier.number}
                </span>
                <span
                  className="rounded-full px-3 py-0.5 text-xs font-bold"
                  style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white" }}
                >
                  ${tier.price % 1 === 0 ? tier.price.toFixed(0) : tier.price.toFixed(2)} each
                </span>
              </div>
              <p className="text-sm" style={{ color: "var(--pl-text-secondary)" }}>
                Buy any product below → get one free from this tier
              </p>
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {tier.products.map((product) => (
                <MixMatchCard
                  key={product.name}
                  product={product}
                  onAddToCart={(p) => handleAddToCart(tier, p)}
                  isLoading={isAdding}
                />
              ))}
            </div>
          </section>
        ))}

        {/* Fine print */}
        <p className="text-center text-xs" style={{ color: "var(--pl-muted)" }}>
          * Free vial must be from the same tier as the purchased product. One free vial per transaction. While supplies last.
        </p>
      </div>

      {/* Modal */}
      {modalState && (
        <BogoModal
          tier={modalState.tier.number}
          tierPrice={modalState.tier.price}
          products={modalState.tier.products}
          onConfirm={handleConfirmFreeVial}
          onClose={() => { if (!isAdding) setModalState(null); }}
          isAdding={isAdding}
        />
      )}
    </main>
  );
}
