"use client";

import { useEffect, useState } from "react";

const VIALS = [
  { src: "/hero-bpc157.jpg", alt: "BPC-157 10MG", label: "BPC-157" },
  { src: "/hero-tb500.jpg",  alt: "TB-500 10MG",  label: "TB-500"  },
  { src: "/hero-ghkcu.jpg",  alt: "GHK-CU 50MG",  label: "GHK-CU" },
  { src: "/hero-rt.jpg",     alt: "RT 10MG",       label: "RT"      },
];

// Each vial floats independently — different duration, delay, amplitude
const FLOAT_CONFIGS = [
  { duration: 5.2, delay: 0,    yAmp: 18, rot: 1.2  }, // left
  { duration: 6.0, delay: 0.8,  yAmp: 24, rot: -0.8 }, // center (biggest)
  { duration: 4.8, delay: 1.6,  yAmp: 16, rot: 1.5  }, // right
];

type HeroProductVisualProps = {
  imageSrc?: string;
  imageAlt?: string;
};

export function HeroProductVisual(_props: HeroProductVisualProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Show 3 vials — pick first 3 from VIALS
  const displayVials = VIALS.slice(0, 3);

  return (
    <div
      className="relative mx-auto flex items-end justify-center select-none"
      style={{ width: "100%", maxWidth: 480, height: 340 }}
    >
      <style>{`
        @keyframes vial-float-0 {
          0%,100% { transform: translateY(0px) rotate(-1.2deg); }
          50%      { transform: translateY(-18px) rotate(1.2deg); }
        }
        @keyframes vial-float-1 {
          0%,100% { transform: translateY(0px) rotate(0.8deg); }
          50%      { transform: translateY(-24px) rotate(-0.8deg); }
        }
        @keyframes vial-float-2 {
          0%,100% { transform: translateY(0px) rotate(-1.5deg); }
          50%      { transform: translateY(-16px) rotate(1.5deg); }
        }
        @keyframes glow-breathe {
          0%,100% { opacity: 0.5; transform: scale(1); }
          50%      { opacity: 0.85; transform: scale(1.1); }
        }
      `}</style>

      {/* Ambient glow behind all vials */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 80%, rgba(255,255,255,0.9) 0%, rgba(155,164,180,0.15) 50%, transparent 75%)",
          filter: "blur(28px)",
          animation: reducedMotion ? "none" : "glow-breathe 5s ease-in-out infinite",
        }}
      />

      {/* Three vials */}
      {displayVials.map((vial, i) => {
        const cfg = FLOAT_CONFIGS[i];
        const isCenter = i === 1;

        return (
          <div
            key={vial.src}
            className="absolute bottom-0 flex flex-col items-center"
            style={{
              // Positioning: left, center, right
              left: i === 0 ? "2%" : i === 1 ? "50%" : "auto",
              right: i === 2 ? "2%" : "auto",
              transform: i === 1 ? "translateX(-50%)" : undefined,
              zIndex: isCenter ? 10 : 5,
              animation: reducedMotion
                ? "none"
                : `vial-float-${i} ${cfg.duration}s ease-in-out ${cfg.delay}s infinite`,
            }}
          >
            {/* Per-vial glow */}
            <div
              style={{
                position: "absolute",
                bottom: -10,
                left: "50%",
                transform: "translateX(-50%)",
                width: isCenter ? 120 : 90,
                height: isCenter ? 120 : 90,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)",
                filter: "blur(16px)",
                zIndex: -1,
              }}
            />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={vial.src}
              alt={vial.alt}
              draggable={false}
              style={{
                width: isCenter ? 160 : 110,
                height: "auto",
                objectFit: "contain",
                filter: `drop-shadow(0 ${isCenter ? 20 : 12}px ${isCenter ? 40 : 24}px rgba(20,39,78,${isCenter ? 0.18 : 0.12}))`,
                pointerEvents: "none",
              }}
            />

            {/* Label badge */}
            <span
              style={{
                marginTop: 10,
                fontSize: isCenter ? 11 : 9,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--pl-navy)",
                opacity: 0.55,
                fontFamily: "var(--pl-font-body)",
              }}
            >
              {vial.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
