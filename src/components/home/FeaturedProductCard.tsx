import Link from "next/link";
import type { WooProduct } from "@/lib/woocommerce";
import { CoaButton } from "@/components/CoaButton";
import { FeaturedAddToCart } from "./FeaturedAddToCart";

type FeaturedProductCardProps = {
  product: WooProduct;
};

export function FeaturedProductCard({ product }: FeaturedProductCardProps) {
  const image = product.images?.[0];

  return (
    <div
      className="group flex flex-col overflow-hidden rounded-lg bg-white border border-[rgba(155,164,180,0.25)] hover:border-[rgba(20,39,78,0.35)] hover:shadow-[0_12px_30px_rgba(20,39,78,0.06)] hover:-translate-y-1 transition-all duration-300"
      style={{ fontFamily: "var(--pl-font-body)" }}
    >
      {/* Image Container */}
      <Link
        href={`/products/${product.slug}`}
        className="relative flex h-60 items-center justify-center p-8 bg-[#f7fafb] overflow-hidden"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.src}
            alt={image.alt || product.name}
            className="h-full w-full object-contain select-none pointer-events-none transition-transform duration-500 group-hover:scale-104"
          />
        ) : (
          <div className="text-xs" style={{ color: "var(--pl-muted)" }}>
            No Image Available
          </div>
        )}
      </Link>

      {/* Content Container */}
      <div className="flex flex-1 flex-col p-5 gap-3">
        {/* Name */}
        <h3
          className="text-xl sm:text-2xl leading-tight font-medium tracking-tight"
          style={{
            color: "var(--pl-navy)",
            fontFamily: "var(--pl-font-display)",
          }}
        >
          <Link 
            href={`/products/${product.slug}`}
            className="hover:opacity-80 transition-opacity duration-200"
          >
            {product.name}
          </Link>
        </h3>

        {/* Price */}
        <p
          className="text-sm font-semibold"
          style={{ color: "var(--pl-navy)" }}
        >
          ${product.price}
        </p>

        {/* Scientific Metadata */}
        <div 
          className="flex flex-col gap-1 text-[11px] font-mono uppercase tracking-wider py-1 border-y border-[rgba(155,164,180,0.12)] my-1"
          style={{ color: "var(--pl-text-secondary)" }}
        >
          <div className="flex justify-between">
            <span>CAS No.</span>
            <span className="font-semibold">{product.casNumber || "Pending"}</span>
          </div>
          <div className="flex justify-between">
            <span>Purity</span>
            <span className="font-semibold">≥99%</span>
          </div>
        </div>

        {/* Certificate of Analysis Button */}
        <div className="pt-1">
          <CoaButton productSlug={product.slug} />
        </div>

        {/* Add to Cart Actions (Client Component) */}
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
