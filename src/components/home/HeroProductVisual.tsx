"use client";

import { useEffect, useState } from "react";

const VIALS = [
  { src: "/hero-bpc157.png", alt: "BPC-157 10MG", label: "BPC-157", floatClass: "float-left",  glowColor: "rgba(100,160,255,0.35)", glowDelay: "0s"    },
  { src: "/hero-motsc.png",  alt: "MOTS-C 10MG",  label: "MOTS-C",  floatClass: "float-center", glowColor: "rgba(140,190,255,0.45)", glowDelay: "0.25s" },
  { src: "/hero-tb500.png",  alt: "TB-500 10MG",  label: "TB-500",  floatClass: "float-right",  glowColor: "rgba(100,160,255,0.35)", glowDelay: "0.5s"  },
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
          40%      { transform: translateY(-30px) rotate(-3deg); }
          60%      { transform: translateY(-24px) rotate(-5deg); }
        }
        @keyframes float-center {
          0%,100% { transform: translateY(0px)   rotate(0deg); }
          40%      { transform: translateY(-38px) rotate(1deg); }
          60%      { transform: translateY(-30px) rotate(-1deg); }
        }
        @keyframes float-right {
          0%,100% { transform: translateY(0px)   rotate(6deg); }
          40%      { transform: translateY(-28px) rotate(4deg); }
          60%      { transform: translateY(-22px) rotate(6deg); }
        }
        @keyframes glow-pulse {
          0%,100% { opacity: 0.4; transform: translateX(-50%) scaleX(1);   }
          50%      { opacity: 0.85; transform: translateX(-50%) scaleX(1.15); }
        }
        @keyframes glow-pulse-delay1 {
          0%,100% { opacity: 0.5; transform: translateX(-50%) scaleX(1);   }
          50%      { opacity: 1.0; transform: translateX(-50%) scaleX(1.2); }
        }
        @keyframes glow-pulse-delay2 {
          0%,100% { opacity: 0.4; transform: translateX(-50%) scaleX(1);   }
          50%      { opacity: 0.8; transform: translateX(-50%) scaleX(1.1); }
        }

        .float-left   { animation: float-left   4.2s cubic-bezier(0.37, 0, 0.63, 1) 0s    infinite; }
        .float-center { animation: float-center  3.8s cubic-bezier(0.37, 0, 0.63, 1) 0.25s infinite; }
        .float-right  { animation: float-right   4.5s cubic-bezier(0.37, 0, 0.63, 1) 0.5s  infinite; }

        .vial-glow-0 { animation: glow-pulse        4.2s ease-in-out 0s    infinite; }
        .vial-glow-1 { animation: glow-pulse-delay1 3.8s ease-in-out 0.25s infinite; }
        .vial-glow-2 { animation: glow-pulse-delay2 4.5s ease-in-out 0.5s  infinite; }

        .vial-side   { width: clamp(120px, 28vw, 200px); }
        .vial-center { width: clamp(160px, 38vw, 280px); }
      `}</style>

      {/* Vials row */}
      <div className="flex items-end justify-center pt-10 pb-6" style={{ gap: 0 }}>

        {/* Left */}
        <div className={`relative flex flex-col items-center pb-12 z-[5] -mr-8 ${!reducedMotion ? "float-left" : ""}`}>
          {/* Per-vial glow pool */}
          <div
            className={`absolute bottom-10 left-1/2 pointer-events-none ${!reducedMotion ? "vial-glow-0" : ""}`}
            style={{
              width: "130%",
              height: 36,
              borderRadius: "50%",
              background: `radial-gradient(ellipse at 50% 50%, ${VIALS[0].glowColor} 0%, transparent 70%)`,
              filter: "blur(10px)",
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={VIALS[0].src} alt={VIALS[0].alt} draggable={false} className="vial-side"
            style={{ height: "auto", objectFit: "contain", filter: "drop-shadow(0 8px 24px rgba(80,140,255,0.25))", pointerEvents: "none", position: "relative", zIndex: 1 }} />
          <span style={{ marginTop: 8, fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#ffffff", opacity: 0.4, fontFamily: "var(--pl-font-body)" }}>
            {VIALS[0].label}
          </span>
        </div>

        {/* Center */}
        <div className={`relative flex flex-col items-center z-[10] ${!reducedMotion ? "float-center" : ""}`}>
          <div
            className={`absolute bottom-2 left-1/2 pointer-events-none ${!reducedMotion ? "vial-glow-1" : ""}`}
            style={{
              width: "140%",
              height: 48,
              borderRadius: "50%",
              background: `radial-gradient(ellipse at 50% 50%, ${VIALS[1].glowColor} 0%, transparent 70%)`,
              filter: "blur(14px)",
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={VIALS[1].src} alt={VIALS[1].alt} draggable={false} className="vial-center"
            style={{ height: "auto", objectFit: "contain", filter: "drop-shadow(0 16px 40px rgba(80,140,255,0.35))", pointerEvents: "none", position: "relative", zIndex: 1 }} />
          <span style={{ marginTop: 10, fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#ffffff", opacity: 0.45, fontFamily: "var(--pl-font-body)" }}>
            {VIALS[1].label}
          </span>
        </div>

        {/* Right */}
        <div className={`relative flex flex-col items-center pb-12 z-[5] -ml-8 ${!reducedMotion ? "float-right" : ""}`}>
          <div
            className={`absolute bottom-10 left-1/2 pointer-events-none ${!reducedMotion ? "vial-glow-2" : ""}`}
            style={{
              width: "130%",
              height: 36,
              borderRadius: "50%",
              background: `radial-gradient(ellipse at 50% 50%, ${VIALS[2].glowColor} 0%, transparent 70%)`,
              filter: "blur(10px)",
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={VIALS[2].src} alt={VIALS[2].alt} draggable={false} className="vial-side"
            style={{ height: "auto", objectFit: "contain", filter: "drop-shadow(0 8px 24px rgba(80,140,255,0.25))", pointerEvents: "none", position: "relative", zIndex: 1 }} />
          <span style={{ marginTop: 8, fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#ffffff", opacity: 0.4, fontFamily: "var(--pl-font-body)" }}>
            {VIALS[2].label}
          </span>
        </div>

      </div>
    </div>
  );
}
