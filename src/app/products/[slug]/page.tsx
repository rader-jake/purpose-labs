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
                  const isLiquid = slug.includes("l-carnitine") || slug.includes("reconstitution") || slug.includes("bac-water") || slug.includes("nad");
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
