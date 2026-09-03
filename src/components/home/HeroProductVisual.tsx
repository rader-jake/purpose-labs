"use client";

import Image from "next/image";

type HeroProductVisualProps = {
  imageSrc?: string;
  imageAlt?: string;
};

export function HeroProductVisual({ imageSrc, imageAlt = "Purpose Labs peptide vial" }: HeroProductVisualProps) {
  if (!imageSrc) return null;

  return (
    <div className="relative mx-auto select-none" style={{ width: "100%", maxWidth: 480, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Image
        src={imageSrc}
        alt={imageAlt}
        width={480}
        height={480}
        priority
        style={{ objectFit: "contain", width: "100%", height: "auto" }}
      />
    </div>
  );
}
