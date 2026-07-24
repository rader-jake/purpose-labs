import { getBestSellers } from "@/lib/woocommerce";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";

export default async function BestSellersPage() {
  const products = await getBestSellers();

  return (
    <main
      className="mx-auto max-w-7xl px-6 py-16 sm:px-10"
      style={{ fontFamily: "var(--pl-font-body)" }}
    >
      <SectionHeading eyebrow="Purpose Labs" title="Best Sellers" />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
