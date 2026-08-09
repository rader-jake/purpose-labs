"use client";

import { useEffect, useState } from "react";

const VIALS = [
  { src: "/hero-bpc157.png", alt: "BPC-157 10MG", label: "BPC-157" },
  { src: "/hero-rt.png",     alt: "RT 10MG",       label: "RT"      },
  { src: "/hero-tb500.png",  alt: "TB-500 10MG",   label: "TB-500"  },
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

  return (
    <div
      className="relative mx-auto select-none"
      style={{ width: "100%", maxWidth: 480, height: 360 }}
    >
      <style>{`
        @keyframes float-left {
          0%,100% { transform: translateY(0px) rotate(-1.5deg); }
          50%      { transform: translateY(-16px) rotate(1deg); }
        }
        @keyframes float-center {
          0%,100% { transform: translateY(0px) rotate(0.5deg); }
          50%      { transform: translateY(-22px) rotate(-0.5deg); }
        }
        @keyframes float-right {
          0%,100% { transform: translateY(0px) rotate(1.5deg); }
          50%      { transform: translateY(-14px) rotate(-1.2deg); }
        }
        @keyframes glow-breathe {
          0%,100% { opacity: 0.6; }
          50%      { opacity: 0.9; }
        }
        .float-left   { animation: float-left   5.5s ease-in-out 0s    infinite; }
        .float-center { animation: float-center  6.2s ease-in-out 0.7s  infinite; }
        .float-right  { animation: float-right   4.9s ease-in-out 1.4s  infinite; }
        .glow-breathe { animation: glow-breathe  6s   ease-in-out 0s    infinite; }
      `}</style>

      {/* Background glow */}
      <div
        className={`absolute inset-0 pointer-events-none ${!reducedMotion ? "glow-breathe" : ""}`}
        style={{
          background: "radial-gradient(ellipse at 50% 85%, rgba(255,255,255,0.95) 0%, rgba(155,164,180,0.15) 50%, transparent 72%)",
          filter: "blur(32px)",
        }}
      />

      {/* Left vial */}
      <div
        className={`absolute bottom-8 flex flex-col items-center ${!reducedMotion ? "float-left" : ""}`}
        style={{ left: "2%", zIndex: 5 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={VIALS[0].src} alt={VIALS[0].alt} draggable={false}
          style={{ width: 115, height: "auto", objectFit: "contain", filter: "drop-shadow(0 12px 28px rgba(20,39,78,0.14))", pointerEvents: "none" }} />
        <span style={{ marginTop: 8, fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--pl-navy)", opacity: 0.5, fontFamily: "var(--pl-font-body)" }}>
          {VIALS[0].label}
        </span>
      </div>

      {/* Center vial — largest */}
      <div
        className={`absolute bottom-4 flex flex-col items-center ${!reducedMotion ? "float-center" : ""}`}
        style={{ left: "50%", transform: "translateX(-50%)", zIndex: 10 }}
      >
        <div style={{ position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)", width: 130, height: 130, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.85) 0%, transparent 70%)", filter: "blur(18px)", zIndex: -1 }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={VIALS[1].src} alt={VIALS[1].alt} draggable={false}
          style={{ width: 168, height: "auto", objectFit: "contain", filter: "drop-shadow(0 20px 40px rgba(20,39,78,0.2))", pointerEvents: "none" }} />
        <span style={{ marginTop: 10, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--pl-navy)", opacity: 0.55, fontFamily: "var(--pl-font-body)" }}>
          {VIALS[1].label}
        </span>
      </div>

      {/* Right vial */}
      <div
        className={`absolute bottom-8 flex flex-col items-center ${!reducedMotion ? "float-right" : ""}`}
        style={{ right: "2%", zIndex: 5 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={VIALS[2].src} alt={VIALS[2].alt} draggable={false}
          style={{ width: 115, height: "auto", objectFit: "contain", filter: "drop-shadow(0 12px 28px rgba(20,39,78,0.14))", pointerEvents: "none" }} />
        <span style={{ marginTop: 8, fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--pl-navy)", opacity: 0.5, fontFamily: "var(--pl-font-body)" }}>
          {VIALS[2].label}
        </span>
      </div>
    </div>
  );
}
