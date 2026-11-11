import Link from "next/link";
import type { WooProduct } from "@/lib/woocommerce";
import { FeaturedAddToCart } from "./FeaturedAddToCart";

type FeaturedProductCardProps = {
  product: WooProduct;
};

// Extract dosage from product name e.g. "BPC-157 10mg" → "10MG"
function extractDosage(name: string): string | null {
  const match = name.match(/(\d+\s?mg)/i);
  return match ? match[1].toUpperCase() : null;
}

export function FeaturedProductCard({ product }: FeaturedProductCardProps) {
  const image = product.images?.[0];
  const dosage = extractDosage(product.name);
  const displayPrice = product.price ? `$${parseFloat(product.price).toFixed(2)}` : null;

  return (
    <div
      className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-[rgba(0,0,0,0.07)] hover:shadow-[0_8px_32px_rgba(20,39,78,0.10)] hover:-translate-y-0.5 transition-all duration-300"
      style={{ fontFamily: "var(--pl-font-body)" }}
    >
      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative flex items-center justify-center overflow-hidden"
        style={{ background: "#EAEFF5", aspectRatio: "1/1" }}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.src}
            alt={image.alt || product.name}
            className="w-4/5 h-4/5 object-contain select-none pointer-events-none transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="text-xs text-gray-400">No Image</div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-col p-4 gap-3">
        {/* Name */}
        <h3 className="text-base font-semibold leading-tight" style={{ color: "#0D1A30" }}>
          <Link href={`/products/${product.slug}`} className="hover:opacity-70 transition-opacity">
            {product.name}
          </Link>
        </h3>

        {/* Dosage pill */}
        {dosage && (
          <span
            className="self-start rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
            style={{ background: "#EEF2F8", color: "#14274E" }}
          >
            {dosage}
          </span>
        )}

        {/* Price */}
        {displayPrice && (
          <p className="text-lg font-bold" style={{ color: "#0D1A30" }}>
            {displayPrice}
          </p>
        )}

        {/* Add to cart */}
        <FeaturedAddToCart
          productId={product.id}
          productSlug={product.slug}
          productType={product.type}
          stockStatus={product.stock_status}
        />
      </div>
    </div>
  );
}
