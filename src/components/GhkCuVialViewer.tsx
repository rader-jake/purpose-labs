"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ProductBuyBox } from "@/components/ProductBuyBox";
import type { WooProductVariation } from "@/lib/woocommerce";

const ProductVialViewer = dynamic(
  () => import("@/components/ProductVialViewer").then((m) => m.ProductVialViewer),
  { ssr: false, loading: () => null }
);

interface GhkCuVialViewerProps {
  productId: number;
  productSlug: string;
  name: string;
  price: string;
  regularPrice?: string;
  salePrice?: string;
  outOfStock: boolean;
  variations: WooProductVariation[];
}

export function GhkCuVialViewer({
  productId,
  productSlug,
  name,
  price,
  regularPrice,
  salePrice,
  outOfStock,
  variations,
}: GhkCuVialViewerProps) {
  const [labelSrc, setLabelSrc] = useState("/3d/label-ghkcu-50.png");
  const MODEL = "/3d/vial_powder_blue.glb";

  const handleVariantChange = (variationId: number) => {
    const variation = variations.find((v) => v.id === variationId);
    const option = variation?.attributes[0]?.option ?? "";
    if (option.includes("100")) {
      setLabelSrc("/3d/label-ghkcu-100.png");
    } else {
      setLabelSrc("/3d/label-ghkcu-50.png");
    }
  };

  return (
    <>
      <div>
        <ProductVialViewer labelSrc={labelSrc} modelSrc={MODEL} />
      </div>
      <ProductBuyBox
        productId={productId}
        productSlug={productSlug}
        name={name}
        price={price}
        regularPrice={regularPrice}
        salePrice={salePrice}
        outOfStock={outOfStock}
        variations={variations}
        onVariantChange={handleVariantChange}
      />
    </>
  );
}
