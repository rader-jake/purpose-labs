// src/app/products/[slug]/page.tsx
//
// Server Component — data fetching happens here. All interactive state
// (quantity, add to cart) lives in the separate ProductBuyBox client
// component. Don't merge these back into one "use client" file — that
// breaks async data fetching in the App Router.

import { getProduct, getProductVariations, getRelatedProducts } from "@/lib/woocommerce";
import { ParticleBackground } from "@/components/ParticleBackground";
import { ProductTilt } from "@/components/ProductTilt";
import { ProductVialViewer } from "@/components/ProductVialViewer";
import { ProductBuyBox } from "@/components/ProductBuyBox";
import { GhkCuVialViewer } from "@/components/GhkCuVialViewer";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { notFound } from "next/navigation";

// Revalidate every 60s so price/sale changes from WooCommerce show up quickly
export const revalidate = 60;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const image = product.images?.[0];
  // related_ids is reliably populated on real products (verified against
  // the live catalog) but empty for at least one dev-only product, so
  // this section simply doesn't render rather than assuming data exists.
  const relatedProducts = await getRelatedProducts(product.related_ids);
  // Only variable products (currently just GHK-CU) have real variations to
  // fetch — skip the extra request for the other 21 simple products.
  const variations = product.type === "variable" ? await getProductVariations(product.id) : [];

  const inStock = product.stock_status !== "outofstock";

  return (
    <main style={{ background: "#f2f4f7", minHeight: "100vh" }}>
      {/* Product Hero — NextGen style */}
      <section className="w-full px-4 py-8 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-start">

            {/* LEFT: Image card */}
            <div
              className="relative w-full overflow-hidden"
              style={{
                borderRadius: 24,
                background: "#356ba9",
                aspectRatio: "1 / 1",
              }}
            >
              {image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image.src}
                  alt={image.alt || product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              )}

              {/* Purity badge — top left */}
              <div
                className="absolute top-4 left-4"
                style={{
                  background: "rgba(13,27,46,0.75)",
                  backdropFilter: "blur(8px)",
                  borderRadius: 100,
                  padding: "6px 14px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  fontFamily: "var(--pl-font-body)",
                }}
              >
                ≥99% (HPLC Verified) Purity
              </div>

              {/* In Stock badge — top right */}
              <div
                className="absolute top-4 right-4"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: 100,
                  padding: "6px 14px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  fontFamily: "var(--pl-font-body)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: inStock ? "#4ade80" : "#f87171", display: "inline-block", flexShrink: 0 }} />
                {inStock ? "In Stock" : "Out of Stock"}
              </div>
            </div>

            {/* RIGHT: Info + Buy Box */}
            <div style={{ fontFamily: "var(--pl-font-body)" }}>

              {/* Category eyebrow */}
              <p style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#356ba9",
                marginBottom: 10,
              }}>
                Peptides
              </p>

              {/* Product name */}
              <h1 style={{
                fontFamily: "var(--pl-font-display, 'Barlow Condensed', sans-serif)",
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: 900,
                color: "#0d1b2e",
                lineHeight: 1.1,
                marginBottom: 16,
              }}>
                {product.name}
              </h1>

              {/* Short description */}
              {product.short_description && (
                <div
                  style={{ color: "#5a6a7a", fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}
                  dangerouslySetInnerHTML={{ __html: product.short_description }}
                />
              )}

              {/* Trust chips */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 28 }}>
                {["≥99% HPLC Purity", "Lot-linked COA", "Research use only"].map((chip) => (
                  <div key={chip} style={{
                    display: "flex", alignItems: "center", gap: 7,
                    border: "1.5px solid #d0d9e8",
                    borderRadius: 100,
                    padding: "6px 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#0d1b2e",
                    background: "#fff",
                  }}>
                    <svg width="13" height="13" fill="none" stroke="#356ba9" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {chip}
                  </div>
                ))}
              </div>

              {/* Buy Box */}
              <ProductBuyBox
                productId={product.id}
                productSlug={product.slug}
                name={product.name}
                price={product.price}
                regularPrice={product.regular_price}
                salePrice={product.sale_price}
                outOfStock={!inStock}
                variations={variations}
              />
            </div>

          </div>
        </div>
      </section>

      {/* BOGO Banner — shown on all single-unit product pages that have a 2-pack */}
      {(() => {
        const bogoMap: Record<string, { twoPackSlug: string; perUnit: string }> = {
          "pl-rt": { twoPackSlug: "purpose-labs-3rt-2-pack", perUnit: "$45" },
          "bpc-157-10mg": { twoPackSlug: "bpc-157-10mg-2-pack", perUnit: "$40" },
          "tb-500-10mg": { twoPackSlug: "tb-500-10mg-2-pack", perUnit: "$40" },
          "cjc-1295-no-dac-ipamorelin": { twoPackSlug: "cjc-1295-ipamorelin-2-pack", perUnit: "$50" },
          "mt-2": { twoPackSlug: "mt-2-2-pack", perUnit: "$30" },
          "selank-10mg": { twoPackSlug: "selank-10mg-2-pack", perUnit: "$40" },
          "semax-10mg": { twoPackSlug: "semax-10mg-2-pack", perUnit: "$40" },
          "mots-c-10mg": { twoPackSlug: "mots-c-10mg-2-pack", perUnit: "$40" },
          "nad-600mg": { twoPackSlug: "nad-600mg-2-pack", perUnit: "$40" },
          "l-carnitine-6000mg": { twoPackSlug: "l-carnitine-600-mg-ml-2-pack", perUnit: "$40" },
          "klow-80mg": { twoPackSlug: "klow-80mg-2-pack", perUnit: "$71" },
          "pl-tesa": { twoPackSlug: "pl-tesa-2-pack", perUnit: "$50" },
          "igf-1-lr3-1mg": { twoPackSlug: "igf-1-lr3-1mg-2-pack", perUnit: "$60" },
          "pl-tz": { twoPackSlug: "pl-tz-2-pack", perUnit: "$55" },
          "pink-korean-gluta-1200mg": { twoPackSlug: "gluta-2-pack", perUnit: "$50" },
          "wolverine-stack-bpc-157-tb-500": { twoPackSlug: "bpc-157-tb-500-stack-2-pack", perUnit: "$60" },
        };
        const bogo = bogoMap[slug];
        if (!bogo) return null;
        return (
          <a
            href={`/products/${bogo.twoPackSlug}`}
            className="block w-full text-center py-4 px-6 font-semibold text-sm uppercase tracking-widest transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(90deg, #1B2A4A 0%, #243760 50%, #1B2A4A 100%)",
              color: "var(--pl-ivory)",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              letterSpacing: "0.12em",
            }}
          >
            <strong>BOGO</strong> — Buy One Get One &nbsp;·&nbsp; <span style={{ color: "#4ade80" }}>{bogo.perUnit} per unit</span> &nbsp;→
          </a>
        );
      })()}

      <section
        className="mx-auto max-w-3xl px-6 py-16"
        style={{ fontFamily: "var(--pl-font-body)" }}
      >
        {product.short_description && (
          <div
            className="text-base leading-relaxed"
            style={{ color: "var(--pl-text-secondary)" }}
            dangerouslySetInnerHTML={{ __html: product.short_description }}
          />
        )}

        {/* Compliance Sections */}
        <div style={{ marginTop: 48 }}>
          {/* Storage & Stability */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 32, marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--pl-text-primary)", marginBottom: 16 }}>Storage &amp; Stability</h2>
            {slug.includes("reconstitution")  ? (
              <>
                <p style={{ fontWeight: 700, color: "var(--pl-text-primary)", marginBottom: 8 }}>Research Solution</p>
                <ul style={{ color: "var(--pl-text-secondary)", fontSize: 14, lineHeight: 2, listStyle: "none", padding: 0 }}>
                  <li>Store refrigerated at <strong>2–8°C</strong></li>
                  <li>Protect from excessive heat and direct light</li>
                  <li>Keep vial tightly sealed when not in use</li>
                  <li>Avoid contamination during handling</li>
                </ul>
              </>
            ) : (
              <>
                <p style={{ fontWeight: 700, color: "var(--pl-text-primary)", marginBottom: 8 }}>Lyophilized Compound</p>
                <ul style={{ color: "var(--pl-text-secondary)", fontSize: 14, lineHeight: 2, listStyle: "none", padding: 0 }}>
                  <li>Store at <strong>-20°C or below</strong></li>
                  <li>Protect from heat, moisture, and direct light</li>
                  <li>Keep vial tightly sealed until use</li>
                  <li>Avoid repeated freeze-thaw cycles</li>
                </ul>
              </>
            )}
          </div>

          {/* Laboratory Applications */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 32, marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--pl-text-primary)", marginBottom: 16 }}>Laboratory Applications</h2>
            <p style={{ color: "var(--pl-text-secondary)", fontSize: 14, lineHeight: 1.8 }}>
              Suitable for <em>in vitro</em> laboratory applications, including biochemical, analytical, cell culture, and other controlled experimental studies conducted in accordance with institutional research protocols.
            </p>
          </div>

          {/* Research Use Only Disclaimer */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 32, marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--pl-text-primary)", marginBottom: 16 }}>Research Use Only Disclaimer</h2>
            <p style={{ fontWeight: 700, color: "var(--pl-text-primary)", fontSize: 13, letterSpacing: "0.05em", marginBottom: 12 }}>
              FOR RESEARCH USE ONLY (RUO). NOT FOR HUMAN OR VETERINARY USE.
            </p>
            <p style={{ color: "var(--pl-text-secondary)", fontSize: 14, lineHeight: 1.8, marginBottom: 12 }}>
              This product is intended solely for laboratory research by qualified professionals. It is not intended for human or veterinary use, clinical applications, food production, cosmetics, or dietary supplements.
            </p>
            <p style={{ color: "var(--pl-text-secondary)", fontSize: 14, lineHeight: 1.8 }}>
              This product has not been evaluated by the U.S. Food and Drug Administration. No claims are made regarding the diagnosis, treatment, cure, or prevention of any disease.
            </p>
          </div>

          {/* Purchaser Acknowledgement */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 32, marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--pl-text-primary)", marginBottom: 16 }}>Purchaser Acknowledgement</h2>
            <p style={{ color: "var(--pl-text-secondary)", fontSize: 14, lineHeight: 1.8 }}>
              By purchasing this product, the buyer certifies that they are a qualified researcher or authorized institution and assume full responsibility for its handling, storage, transportation, and lawful use of this material.
            </p>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section
          className="mx-auto max-w-7xl px-6 pb-16 sm:px-10"
          style={{ fontFamily: "var(--pl-font-body)" }}
        >
          <SectionHeading eyebrow="Purpose Labs" title="You May Also Like" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
