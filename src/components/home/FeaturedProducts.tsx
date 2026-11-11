import Link from "next/link";
import type { WooProduct } from "@/lib/woocommerce";
import { FeaturedProductCard } from "./FeaturedProductCard";
import { Reveal } from "./Reveal";

type FeaturedProductsProps = {
  products: WooProduct[];
};

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const featuredList = (products ?? []).slice(0, 4);

  return (
    <section
      className="bg-white py-16 md:py-24"
      style={{ fontFamily: "var(--pl-font-body)" }}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10">

        {/* Header */}
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-[0.18em] mb-2"
                style={{ color: "#6C7688" }}
              >
                Most Requested.
              </p>
              <h2
                className="font-black tracking-tight"
                style={{
                  color: "#0D1A30",
                  fontFamily: "var(--pl-font-display)",
                  fontSize: "clamp(2rem, 5vw, 3rem)",
                  lineHeight: 1.0,
                }}
              >
                Best Sellers
              </h2>
            </div>
            <Link
              href="/products"
              className="mt-4 md:mt-0 text-sm font-medium hover:opacity-60 transition-opacity"
              style={{ color: "#6C7688" }}
            >
              View all compounds →
            </Link>
          </div>
        </Reveal>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {featuredList.map((product, idx) => (
            <Reveal key={product.id} delay={idx * 80}>
              <FeaturedProductCard product={product} />
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
