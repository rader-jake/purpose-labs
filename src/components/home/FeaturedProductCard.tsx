import Link from "next/link";
import type { WooProduct } from "@/lib/woocommerce";
import { FeaturedAddToCart } from "./FeaturedAddToCart";

type FeaturedProductCardProps = {
  product: WooProduct;
};

const DOSAGE_OVERRIDES: Record<string, string> = {
  "pl-rt": "10MG",
  "pl-tz": "5MG",
  "pl-tesa": "5MG / 10MG",
  "klow-80mg": "80MG",
  "wolverine-stack-bpc-157-tb-500": "BPC-157 + TB-500",
  "the-jimmy-neutron-stack-semax-selank-dispersal-kit": "Semax + Selank",
};

function extractDosage(productName: string, slug: string): string | null {
  const override = DOSAGE_OVERRIDES[slug];
  if (override) return override;
  const match = productName.match(/(\d+(?:\.\d+)?\s?(?:mg|mcg|iu|ml|g)(?:\/(?:ml|vial))?)/i);
  return match ? match[1].toUpperCase() : null;
}

export function FeaturedProductCard({ product }: FeaturedProductCardProps) {
  const image = product.images?.[0];
  const dosage = extractDosage(product.name, product.slug);
  const displayPrice = product.price ? `$${parseFloat(product.price).toFixed(2)}` : null;

  return (
    <div
      className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-[rgba(0,0,0,0.07)] hover:shadow-[0_8px_32px_rgba(20,39,78,0.10)] transition-all duration-300"
      style={{ fontFamily: "var(--pl-font-body)" }}
    >
      {/* Image — soft tinted background like AminoHaus */}
      <Link
        href={`/products/${product.slug}`}
        className="relative flex items-center justify-center overflow-hidden"
        style={{ background: "#DDE3EE", aspectRatio: "1/1" }}
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

        {/* Product name */}
        <h3 className="text-base font-bold leading-tight" style={{ color: "#0D1A30" }}>
          <Link href={`/products/${product.slug}`} className="hover:opacity-70 transition-opacity">
            {product.name}
          </Link>
        </h3>

        {/* Price */}
        {displayPrice && (
          <p className="text-xl font-bold" style={{ color: "#0D1A30" }}>
            {displayPrice}
          </p>
        )}

        {/* Dosage pill + quantity stepper + Add to Cart */}
        <FeaturedAddToCart
          productId={product.id}
          productSlug={product.slug}
          productType={product.type}
          stockStatus={product.stock_status}
          dosage={dosage}
        />

      </div>
    </div>
  );
}
