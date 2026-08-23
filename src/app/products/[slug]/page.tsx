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

  return (
    <main>
      {/* Hero: gradient (not solid) navy, fading to transparent only at
          the very edges so it blends into the page rather than reading
          as a hard box. The original stops (80% 80% ellipse, transparent
          from 75%) faded out well before reaching the buy box column —
          confirmed by screenshot, not just eyeballing the CSS — leaving
          the ivory CTA button and tier selectors low-contrast against a
          washed-out background. Holding solid navy out to 65% of a
          full-size ellipse keeps that whole column legible while still
          tapering at the corners for the "open" feel. */}
      <section
        className="relative flex min-h-[calc(100vh-92px-34px)] items-center overflow-hidden px-6 py-6 sm:px-10 sm:py-10 lg:py-16"
        style={{
          background:
            "radial-gradient(ellipse 100% 100% at 50% 45%, var(--pl-navy) 0%, var(--pl-navy) 65%, transparent 100%)",
        }}
      >
        <ParticleBackground count={70} />

        <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-6 lg:grid-cols-2 lg:gap-12">
          {slug.includes("ghk-cu") && !slug.includes("stack") && !slug.includes("glow") && !slug.includes("bundle") ? (
            <GhkCuVialViewer
              productId={product.id}
              productSlug={product.slug}
              name={product.name}
              price={product.price}
              regularPrice={product.regular_price}
              salePrice={product.sale_price}
              outOfStock={product.stock_status === "outofstock"}
              variations={variations}
            />
          ) : (
            <>
              <div>
                {(() => {
                  const labelMap: Record<string, string> = {
                    "wolverine-stack": "/3d/label-wolverine.png",
                    "wolverine": "/3d/label-wolverine.png",
                    "gluta": "/3d/label-glutathione.png",
                    "l-carnitine": "/3d/label-lcarnitine.png",
                    "nad": "/3d/label-nad.png",
                    "reconstitution": "/3d/label-bacwater.png",
                    "bac-water": "/3d/label-bacwater.png",
                    "glp-3-10mg": "/3d/label-glp3rt.png",
                    "glp-3rt": "/3d/label-glp3rt.png",
                    "bpc-157": "/3d/label-bpc157.png",
                    "bpc157": "/3d/label-bpc157.png",
                    "tb-500": "/3d/label-tb500.png",
                    "tb500": "/3d/label-tb500.png",
                    "cjc-1295": "/3d/label-cjc1295.png",
                    "cjc1295": "/3d/label-cjc1295.png",
                    "mt-2": "/3d/label-mt2.png",
                    "melanotan": "/3d/label-mt2.png",
                    "semax": "/3d/label-semax.png",
                    "selank": "/3d/label-selank.png",
                    "tirzepatide": "/3d/label-tirzepatide.png",
                    "igf-1": "/3d/label-igf1lr3.png",
                    "igf1": "/3d/label-igf1lr3.png",
                    "tesamorelin": "/3d/label-tesamorelin.png",
                    "tesa": "/3d/label-tesamorelin.png",
                    "klow": "/3d/label-klow.png",
                    "mots-c": "/3d/label-motsc.png",
                    "motsc": "/3d/label-motsc.png",
                  };
                  const isSingleVial = !slug.includes("spray") && !slug.includes("bundle") && !slug.includes("glow") && (!slug.includes("stack") || slug.includes("wolverine"));
                  const labelSrc = isSingleVial ? Object.entries(labelMap).find(([key]) => slug.includes(key))?.[1] : undefined;
                  const isLiquid = slug.includes("l-carnitine") || slug.includes("reconstitution") || slug.includes("bac-water");
                  const modelSrc = slug.includes("klow") ? "/3d/vial_powder_blue.glb" : isLiquid ? "/3d/vial_new.glb" : "/3d/vial_powder_white.glb";
                  if (labelSrc) return <ProductVialViewer labelSrc={labelSrc} modelSrc={modelSrc} />;
                  if (image) return <ProductTilt imageSrc={image.src} imageAlt={image.alt || product.name} />;
                  return null;
                })()}
              </div>
              <ProductBuyBox
                productId={product.id}
                productSlug={product.slug}
                name={product.name}
                price={product.price}
                regularPrice={product.regular_price}
                salePrice={product.sale_price}
                outOfStock={product.stock_status === "outofstock"}
                variations={variations}
              />
            </>
          )}
        </div>
      </section>

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
            {slug.includes("reconstitution") || slug.includes("bac-water") ? (
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
