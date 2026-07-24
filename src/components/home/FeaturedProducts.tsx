import Link from "next/link";
import type { WooProduct } from "@/lib/woocommerce";
import { FeaturedProductCard } from "./FeaturedProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "./Reveal";

type FeaturedProductsProps = {
  products: WooProduct[];
};

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const featuredList = products.slice(0, 4);

  return (
    <section 
      className="bg-[#F1F6F9] py-16 md:py-24"
      style={{ fontFamily: "var(--pl-font-body)" }}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        
        {/* Section Title */}
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
            <SectionHeading 
              eyebrow="Selected Catalog" 
              title="Best Sellers" 
            />
            <Link
              href="/products"
              className="mt-4 md:mt-0 text-xs font-semibold uppercase tracking-[0.08em] underline underline-offset-4 hover:opacity-75 transition-opacity duration-200"
              style={{ color: "var(--pl-navy)" }}
            >
              Explore the Full Catalog &rarr;
            </Link>
          </div>
        </Reveal>

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredList.map((product, idx) => (
            <Reveal key={product.id} delay={idx * 100}>
              <FeaturedProductCard product={product} />
            </Reveal>
          ))}
        </div>

        {/* Bottom CTA for catalog */}
        <Reveal delay={200}>
          <div className="mt-12 flex justify-center">
            <Link
              href="/products"
              className="rounded-full border px-8 py-3.5 text-xs font-bold uppercase tracking-[0.12em] bg-transparent border-[#14274E] text-[#14274E] hover:bg-[#14274E] hover:text-[#F1F6F9] transition-all duration-300"
            >
              Explore the Catalog
            </Link>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
