"use client";

import dynamic from "next/dynamic";

const SpinWheel = dynamic(() => import("@/components/SpinWheel").then(m => m.SpinWheel), { ssr: false });

type HeroProductVisualProps = {
  imageSrc?: string;
  imageAlt?: string;
};

export function HeroProductVisual(_props: HeroProductVisualProps) {
  return (
    <div className="relative mx-auto select-none" style={{ width: "100%", maxWidth: 480, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* SpinWheel hidden until ready — uncomment to re-enable */}
      {/* <SpinWheel /> */}
    </div>
  );
}
