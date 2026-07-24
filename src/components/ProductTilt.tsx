"use client";

// src/components/ProductTilt.tsx
//
// Cleaner rewrite of the original Elementor spin widget. Since this is
// a real React component, there's no need for the class-scoping or
// click-forwarding tricks the Elementor version needed — each instance
// is naturally isolated. Same visual effect: pointer-tracked 3D tilt
// with a moving highlight simulating light on glass.

import { useRef, useState } from "react";

type ProductTiltProps = {
  imageSrc: string;
  imageAlt: string;
};

const MAX_TILT = 14; // degrees — keep restrained, not gimmicky

export function ProductTilt({ imageSrc, imageAlt }: ProductTiltProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });
  const [shine, setShine] = useState({ x: 50, y: 30 });
  const [shadowScale, setShadowScale] = useState(1);
  const [isActive, setIsActive] = useState(false);

  function updateFromPoint(clientX: number, clientY: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const relX = (clientX - rect.left) / rect.width;
    const relY = (clientY - rect.top) / rect.height;

    setTransform({
      rotateX: (0.5 - relY) * 2 * MAX_TILT,
      rotateY: (relX - 0.5) * 2 * MAX_TILT,
    });

    setShine({ x: relX * 100, y: relY * 100 });
    setShadowScale(1 - Math.abs(relX - 0.5) * 0.3 - Math.abs(relY - 0.5) * 0.2);
  }

  function reset() {
    setTransform({ rotateX: 0, rotateY: 0 });
    setShadowScale(1);
    setIsActive(false);
  }

  return (
    <div
      ref={containerRef}
      className="relative mx-auto aspect-square w-full max-w-[240px] cursor-default sm:max-w-xs lg:max-w-md"
      style={{ perspective: isActive ? "1200px" : undefined }}
      onMouseEnter={() => setIsActive(true)}
      onMouseMove={(e) => updateFromPoint(e.clientX, e.clientY)}
      onMouseLeave={reset}
      onTouchStart={(e) => {
        setIsActive(true);
        const t = e.touches[0];
        updateFromPoint(t.clientX, t.clientY);
      }}
      onTouchMove={(e) => {
        const t = e.touches[0];
        updateFromPoint(t.clientX, t.clientY);
      }}
      onTouchEnd={reset}
    >
      {/* Shadow */}
      <div
        className="absolute bottom-[8%] left-1/2 h-[10%] w-[46%] -translate-x-1/2 rounded-full blur-md transition-transform duration-500"
        style={{
          backgroundColor: "rgba(20, 39, 78, 0.18)",
          transform: `translateX(-50%) scale(${shadowScale})`,
        }}
      />

      {/* Tilting image */}
      <div
        className="flex h-full w-full items-center justify-center transition-transform duration-500 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: isActive
            ? `rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`
            : "rotateX(0deg) rotateY(0deg)",
          transitionDuration: isActive ? "90ms" : "500ms",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={imageAlt}
          draggable={false}
          className="pointer-events-none max-h-[76%] max-w-[62%] select-none object-contain"
          style={{
            filter: "drop-shadow(0 22px 28px rgba(20, 39, 78, 0.35))",
            transform: "translateZ(40px)",
          }}
        />

        {/* Shine overlay — scoped to the image's own footprint, not the
            full container, so the glow tilts WITH the vial instead of
            appearing as an oversized panel around it */}
        {isActive && (
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[76%] max-h-[76%] w-[62%] max-w-[62%] -translate-x-1/2 -translate-y-1/2"
            style={{
              background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 42%)`,
              mixBlendMode: "soft-light",
            }}
          />
        )}
      </div>
    </div>
  );
}
