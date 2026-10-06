"use client";

import { useEffect, useState } from "react";

const VIALS = [
  { src: "/hero-bpc157.png", alt: "BPC-157 10MG", label: "BPC-157", floatClass: "float-left"  },
  { src: "/hero-motsc.png",  alt: "MOTS-C 10MG",  label: "MOTS-C",  floatClass: "float-center" },
  { src: "/hero-tb500.png",  alt: "TB-500 10MG",  label: "TB-500",  floatClass: "float-right"  },
];

export function HeroProductVisual() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className="relative mx-auto select-none w-full" style={{ maxWidth: 640 }}>
      <style>{`
        @keyframes float-left {
          0%,100% { transform: translateY(0px)   rotate(-6deg); }
          50%      { transform: translateY(-14px) rotate(-4deg); }
        }
        @keyframes float-center {
          0%,100% { transform: translateY(0px)   rotate(0deg); }
          50%      { transform: translateY(-20px) rotate(0deg); }
        }
        @keyframes float-right {
          0%,100% { transform: translateY(0px)   rotate(6deg); }
          50%      { transform: translateY(-12px) rotate(4deg); }
        }
        @keyframes glow-breathe {
          0%,100% { opacity: 0.5; }
          50%      { opacity: 0.9; }
        }
        .float-left   { animation: float-left   5.6s ease-in-out 0s   infinite; }
        .float-center { animation: float-center  6.3s ease-in-out 0.5s infinite; }
        .float-right  { animation: float-right   5.1s ease-in-out 1.1s infinite; }
        .glow-breathe { animation: glow-breathe  6s   ease-in-out 0s   infinite; }

        .vial-side   { width: clamp(110px, 26vw, 195px); }
        .vial-center { width: clamp(150px, 34vw, 260px); }
      `}</style>

      {/* Glow beneath vials */}
      <div
        className={`absolute bottom-0 left-1/2 pointer-events-none ${!reducedMotion ? "glow-breathe" : ""}`}
        style={{
          transform: "translateX(-50%)",
          width: "80%",
          height: 120,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at 50% 100%, rgba(74,111,191,0.22) 0%, transparent 70%)",
          filter: "blur(24px)",
        }}
      />

      {/* Ground shadow */}
      <div
        className="absolute bottom-6 left-1/2 pointer-events-none"
        style={{
          transform: "translateX(-50%)",
          width: "70%",
          height: 28,
          borderRadius: "50%",
          background: "rgba(27,42,74,0.10)",
          filter: "blur(12px)",
        }}
      />

      {/* BOGO pill */}
      <div className="absolute top-3 left-1/2 z-30" style={{ transform: "translateX(-50%)" }}>
        <div style={{
          background: "rgba(27,42,74,0.07)",
          border: "1px solid rgba(27,42,74,0.14)",
          borderRadius: 100,
          padding: "6px 20px",
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          fontFamily: "var(--pl-font-body)",
          color: "var(--pl-navy)",
        }}>
          Buy One · Get One Free
        </div>
      </div>

      {/* Vials row */}
      <div className="flex items-end justify-center pt-16 pb-10" style={{ gap: 0 }}>
        {/* Left */}
        <div className={`flex flex-col items-center pb-12 z-[5] -mr-6 ${!reducedMotion ? "float-left" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={VIALS[0].src} alt={VIALS[0].alt} draggable={false} className="vial-side"
            style={{ height: "auto", objectFit: "contain", filter: "drop-shadow(0 12px 28px rgba(20,39,78,0.18))", pointerEvents: "none" }} />
          <span style={{ marginTop: 8, fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--pl-navy)", opacity: 0.4, fontFamily: "var(--pl-font-body)" }}>
            {VIALS[0].label}
          </span>
        </div>

        {/* Center */}
        <div className={`flex flex-col items-center z-[10] ${!reducedMotion ? "float-center" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={VIALS[1].src} alt={VIALS[1].alt} draggable={false} className="vial-center"
            style={{ height: "auto", objectFit: "contain", filter: "drop-shadow(0 24px 48px rgba(20,39,78,0.28))", pointerEvents: "none" }} />
          <span style={{ marginTop: 10, fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--pl-navy)", opacity: 0.45, fontFamily: "var(--pl-font-body)" }}>
            {VIALS[1].label}
          </span>
        </div>

        {/* Right */}
        <div className={`flex flex-col items-center pb-12 z-[5] -ml-6 ${!reducedMotion ? "float-right" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={VIALS[2].src} alt={VIALS[2].alt} draggable={false} className="vial-side"
            style={{ height: "auto", objectFit: "contain", filter: "drop-shadow(0 12px 28px rgba(20,39,78,0.18))", pointerEvents: "none" }} />
          <span style={{ marginTop: 8, fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--pl-navy)", opacity: 0.4, fontFamily: "var(--pl-font-body)" }}>
            {VIALS[2].label}
          </span>
        </div>
      </div>
    </div>
  );
}
