import { getProducts } from "@/lib/woocommerce";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const products = query
    ? await getProducts({ search: query, per_page: 20 })
    : [];

  return (
    <main className="mx-auto max-w-7xl px-6 py-16 sm:px-10" style={{ fontFamily: "var(--pl-font-body)" }}>
      <h1 style={{ color: "var(--pl-navy)", fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em" }}>
        {query ? `Results for "${query}"` : "Search"}
      </h1>

      {query && (
        <p style={{ color: "var(--pl-slate)", fontSize: 14, marginBottom: 32 }}>
          {products.length} product{products.length !== 1 ? "s" : ""} found
        </p>
      )}

      {!query && (
        <p style={{ color: "var(--pl-slate)", fontSize: 14, marginBottom: 32 }}>
          Enter a search term to find products.
        </p>
      )}

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : query ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <p style={{ color: "var(--pl-slate)", fontSize: 16, marginBottom: 16 }}>No products found.</p>
          <Link href="/products" style={{ color: "var(--pl-navy)", fontWeight: 600, textDecoration: "underline" }}>
            Browse all products
          </Link>
        </div>
      ) : null}
    </main>
  );
}
