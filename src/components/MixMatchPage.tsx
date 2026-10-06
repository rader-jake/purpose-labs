"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/lib/cart/CartContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  name: string;
  price: number;
  wooProductId: number;
  img: string;
}

interface Group {
  label: string;
  sublabel: string;
  products: Product[];
}

// ─── Product Data ─────────────────────────────────────────────────────────────

const GROUPS: Group[] = [
  {
    label: "Group 1",
    sublabel: "$30 – $75",
    products: [
      { name: "Glutathione", price: 49.99, wooProductId: 2060, img: "https://joshuar120.sg-host.com/wp-content/uploads/2026/08/C3B859D1-19E0-4A7A-AC40-0A866C70C6E0.png" },
      { name: "MT2 / Melanotan II", price: 30.00, wooProductId: 102, img: "https://joshuar120.sg-host.com/wp-content/uploads/2026/02/ChatGPT-Image-Jul-23-2026-06_12_43-PM.png" },
      { name: "GHK-Cu 50mg", price: 45.00, wooProductId: 831, img: "https://joshuar120.sg-host.com/wp-content/uploads/2026/04/ChatGPT-Image-Jul-23-2026-06_26_43-PM.png" },
      { name: "Selank Vial", price: 75.00, wooProductId: 799, img: "https://joshuar120.sg-host.com/wp-content/uploads/2026/04/ChatGPT-Image-Jul-23-2026-05_51_10-PM.png" },
      { name: "Semax Vial", price: 75.00, wooProductId: 796, img: "https://joshuar120.sg-host.com/wp-content/uploads/2026/04/ChatGPT-Image-Jul-23-2026-05_45_50-PM.png" },
      { name: "L-Carnitine", price: 39.99, wooProductId: 1271, img: "https://joshuar120.sg-host.com/wp-content/uploads/2026/06/L-Carnitine.png" },
    ],
  },
  {
    label: "Group 2",
    sublabel: "$55 – $75",
    products: [
      { name: "NAD+ 600mg", price: 70.00, wooProductId: 1188, img: "https://joshuar120.sg-host.com/wp-content/uploads/2026/06/ChatGPT-Image-Jul-23-2026-06_03_09-PM.png" },
      { name: "MOTS-C 10mg", price: 65.00, wooProductId: 1187, img: "https://joshuar120.sg-host.com/wp-content/uploads/2026/06/ChatGPT-Image-Jul-23-2026-06_00_23-PM.png" },
      { name: "Selank Spray", price: 75.00, wooProductId: 801, img: "https://joshuar120.sg-host.com/wp-content/uploads/2026/04/ChatGPT-Image-Jul-24-2026-01_27_20-PM.png" },
      { name: "Semax Spray", price: 75.00, wooProductId: 806, img: "https://joshuar120.sg-host.com/wp-content/uploads/2026/04/ChatGPT-Image-Jul-24-2026-01_29_53-PM.png" },
      { name: "GHK-Cu 100mg", price: 55.00, wooProductId: 832, img: "https://joshuar120.sg-host.com/wp-content/uploads/2026/04/ChatGPT-Image-Jul-23-2026-06_26_43-PM.png" },
    ],
  },
  {
    label: "Group 3",
    sublabel: "$70 – $120",
    products: [
      { name: "GLP-3RT", price: 90.00, wooProductId: 100, img: "https://joshuar120.sg-host.com/wp-content/uploads/2026/09/PL-RT-original.png" },
      { name: "BPC-157 10mg", price: 80.00, wooProductId: 95, img: "https://joshuar120.sg-host.com/wp-content/uploads/2026/02/ChatGPT-Image-Jul-23-2026-06_06_05-PM.png" },
      { name: "TB-500 10mg", price: 80.00, wooProductId: 103, img: "https://joshuar120.sg-host.com/wp-content/uploads/2026/02/ChatGPT-Image-Jul-23-2026-06_18_14-PM.png" },
      { name: "BPC-157 + TB-500 Stack", price: 100.00, wooProductId: 2069, img: "https://joshuar120.sg-host.com/wp-content/uploads/2026/08/3145B71D-B2EB-4BE9-BFB5-6F8F3DBDA33F.png" },
      { name: "CJC-1295 + Ipamorelin", price: 85.00, wooProductId: 97, img: "https://joshuar120.sg-host.com/wp-content/uploads/2026/02/ChatGPT-Image-Jul-23-2026-05_57_26-PM.png" },
      { name: "KLOW 80mg", price: 120.00, wooProductId: 1421, img: "https://joshuar120.sg-host.com/wp-content/uploads/2026/07/ChatGPT-Image-Jul-23-2026-06_37_58-PM.png" },
      { name: "PL TZ / Tirzepatide", price: 80.00, wooProductId: 1936, img: "https://joshuar120.sg-host.com/wp-content/uploads/2026/07/PL-TZ-1.png" },
      { name: "PL TESA / Tesamorelin", price: 70.00, wooProductId: 1546, img: "https://joshuar120.sg-host.com/wp-content/uploads/2026/07/PL-TESA.png" },
      { name: "IGF-1 LR3", price: 100.00, wooProductId: 1931, img: "https://joshuar120.sg-host.com/wp-content/uploads/2026/07/ChatGPT-Image-Jul-23-2026-06_32_54-PM.png" },
      { name: "GHK-Cu 50mg ×3", price: 45.00, wooProductId: 831, img: "https://joshuar120.sg-host.com/wp-content/uploads/2026/04/ChatGPT-Image-Jul-23-2026-06_26_43-PM.png" },
    ],
  },
];

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem, openDrawer } = useCart();

  async function addToCart() {
    if (!product.wooProductId) return;
    setLoading(true);
    try {
      await addItem(product.wooProductId, 1);
      setAdded(true);
      openDrawer();
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--pl-border, #e5e7eb)",
        borderRadius: "1rem",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.2s, transform 0.2s",
        boxShadow: "0 1px 4px rgba(27,42,74,0.07)",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(27,42,74,0.14)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(27,42,74,0.07)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Image */}
      <div style={{ background: "var(--pl-ivory, #f8f7f4)", height: 200, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Image
          src={product.img}
          alt={product.name}
          fill
          unoptimized
          style={{ objectFit: "contain", padding: "12px" }}
        />
        {/* BOGO Badge */}
        <span style={{
          position: "absolute",
          top: 10,
          left: 10,
          background: "var(--pl-navy, #1B2A4A)",
          color: "#fff",
          fontSize: "0.6rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          padding: "3px 8px",
          borderRadius: "999px",
          textTransform: "uppercase",
        }}>
          Buy One Get One Free
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 6, flexGrow: 1 }}>
        <p style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--pl-navy, #1B2A4A)", margin: 0, lineHeight: 1.3 }}>
          {product.name}
        </p>
        <p style={{ fontSize: "0.72rem", color: "var(--pl-slate, #6b7280)", margin: 0 }}>
          For controlled research use.
        </p>
        <p style={{ fontWeight: 700, fontSize: "1rem", color: "var(--pl-navy, #1B2A4A)", margin: "4px 0 0" }}>
          ${product.price.toFixed(2)}
        </p>

        <button
          onClick={addToCart}
          disabled={loading || added}
          style={{
            marginTop: "auto",
            paddingTop: 10,
            background: added ? "#4ade80" : "var(--pl-navy, #1B2A4A)",
            color: "#fff",
            border: "none",
            borderRadius: "999px",
            padding: "10px 0",
            fontWeight: 700,
            fontSize: "0.72rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: loading || added ? "default" : "pointer",
            width: "100%",
            transition: "background 0.2s, opacity 0.2s",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {added ? "Added! Redirecting…" : loading ? "Adding…" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MixMatchPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--pl-ivory, #f8f7f4)" }}>

      {/* Hero */}
      <section style={{
        background: "var(--pl-navy, #1B2A4A)",
        color: "#fff",
        textAlign: "center",
        padding: "64px 24px 56px",
      }}>
        <p style={{ fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.6, marginBottom: 12 }}>
          Limited Offer
        </p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, margin: "0 0 16px", lineHeight: 1.15 }}>
          Buy One, Get One FREE
        </h1>
        <p style={{ fontSize: "1rem", opacity: 0.75, maxWidth: 480, margin: "0 auto 40px", lineHeight: 1.6 }}>
          Mix &amp; match any two products from the same group. Your free vial is applied automatically at checkout.
        </p>

        {/* 3-step explainer */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "24px",
          justifyContent: "center",
          maxWidth: 720,
          margin: "0 auto",
        }}>
          {[
            { step: "01", action: "Choose", desc: "Pick your product" },
            { step: "02", action: "Build", desc: "Review your cart" },
            { step: "03", action: "Reward", desc: "Free vial unlocks" },
          ].map(({ step, action, desc }) => (
            <div key={step} style={{
              background: "rgba(255,255,255,0.08)",
              borderRadius: "0.75rem",
              padding: "20px 28px",
              minWidth: 160,
              flex: "1 1 160px",
            }}>
              <p style={{ fontSize: "0.65rem", letterSpacing: "0.2em", opacity: 0.5, margin: "0 0 6px" }}>{step}</p>
              <p style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 4px" }}>{action}</p>
              <p style={{ fontSize: "0.8rem", opacity: 0.65, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Product Groups */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "60px 24px" }}>
        {GROUPS.map((group) => (
          <section key={group.label} style={{ marginBottom: 64 }}>
            {/* Group Header */}
            <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 16 }}>
              <div>
                <span style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--pl-slate, #6b7280)",
                }}>
                  {group.sublabel}
                </span>
                <h2 style={{
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: "var(--pl-navy, #1B2A4A)",
                  margin: "2px 0 0",
                }}>
                  {group.label}
                </h2>
              </div>
              <div style={{ flex: 1, height: 1, background: "var(--pl-border, #e5e7eb)" }} />
            </div>

            {/* Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "20px",
            }}>
              {group.products.map((product) => (
                <ProductCard key={`${product.wooProductId}-${product.name}`} product={product} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
