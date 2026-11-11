import type { Metadata } from "next";
import { getProducts, NON_MERCHANDISABLE_PRODUCT_IDS } from "@/lib/woocommerce";
import { FeaturedProductCard } from "@/components/home/FeaturedProductCard";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Catalog | Purpose Labs",
  description: "High-purity research compounds backed by third-party testing and batch-specific documentation.",
};

export default async function CatalogPage() {
  const products = await getProducts({ orderby: "menu_order", exclude: NON_MERCHANDISABLE_PRODUCT_IDS });

  return (
    <main
      className="mx-auto max-w-7xl px-6 py-16 sm:px-10"
      style={{ fontFamily: "var(--pl-font-body)" }}
    >
      <SectionHeading eyebrow="Purpose Labs" title="Research Compounds" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <FeaturedProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
