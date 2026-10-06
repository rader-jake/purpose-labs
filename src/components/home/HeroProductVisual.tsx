"use client";

import { useEffect, useState } from "react";

const VIALS = [
  { src: "/hero-bpc157.png", alt: "BPC-157 10MG", label: "BPC-157", width: 110, rotate: "-6deg", floatClass: "float-left",  pb: 28 },
  { src: "/hero-motsc.png",  alt: "MOTS-C 10MG",  label: "MOTS-C",  width: 148, rotate: "0deg",  floatClass: "float-center", pb: 0  },
  { src: "/hero-tb500.png",  alt: "TB-500 10MG",  label: "TB-500",  width: 110, rotate: "6deg",  floatClass: "float-right",  pb: 28 },
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
    <div
      className="relative mx-auto select-none"
      style={{ width: "100%", maxWidth: 420, height: 380 }}
    >
      <style>{`
        @keyframes float-left {
          0%,100% { transform: translateY(0px)   rotate(-6deg); }
          50%      { transform: translateY(-18px) rotate(-4deg); }
        }
        @keyframes float-center {
          0%,100% { transform: translateY(0px)   rotate(0deg); }
          50%      { transform: translateY(-24px) rotate(0deg); }
        }
        @keyframes float-right {
          0%,100% { transform: translateY(0px)   rotate(6deg); }
          50%      { transform: translateY(-16px) rotate(4deg); }
        }
        @keyframes glow-breathe {
          0%,100% { opacity: 0.55; transform: scale(1); }
          50%      { opacity: 0.85; transform: scale(1.05); }
        }
        @keyframes free-float {
          0%,100% { transform: translateY(0px) rotate(-3deg); }
          50%      { transform: translateY(-8px) rotate(-3deg); }
        }
        .float-left   { animation: float-left   5.6s ease-in-out 0s    infinite; }
        .float-center { animation: float-center  6.3s ease-in-out 0.5s  infinite; }
        .float-right  { animation: float-right   5.1s ease-in-out 1.1s  infinite; }
        .glow-breathe { animation: glow-breathe  6s   ease-in-out 0s    infinite; }
        .free-float   { animation: free-float    3.4s ease-in-out 0s    infinite; }
      `}</style>

      {/* Background radial glow */}
      <div
        className={`absolute pointer-events-none ${!reducedMotion ? "glow-breathe" : ""}`}
        style={{
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 360,
          height: 200,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at 50% 100%, rgba(74,111,191,0.18) 0%, transparent 70%)",
          filter: "blur(28px)",
        }}
      />

      {/* Ground shadow */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          width: 280,
          height: 30,
          borderRadius: "50%",
          background: "rgba(27,42,74,0.10)",
          filter: "blur(14px)",
        }}
      />

      {/* FREE badge */}
      <div
        className={`absolute ${!reducedMotion ? "free-float" : ""}`}
        style={{
          top: 10,
          right: 24,
          zIndex: 30,
          background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
          color: "#fff",
          borderRadius: 100,
          padding: "7px 16px",
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          fontFamily: "var(--pl-font-body)",
          boxShadow: "0 6px 22px rgba(34,197,94,0.5)",
          transform: "rotate(-3deg)",
        }}
      >
        🎁 GET ONE FREE
      </div>

      {/* Vials */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 0,
        }}
      >
        {VIALS.map((v) => (
          <div
            key={v.label}
            className={!reducedMotion ? v.floatClass : ""}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingBottom: v.pb,
              marginLeft: v.label === "MOTS-C" ? -10 : 0,
              marginRight: v.label === "MOTS-C" ? -10 : 0,
              zIndex: v.label === "MOTS-C" ? 10 : 5,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={v.src}
              alt={v.alt}
              draggable={false}
              style={{
                width: v.width,
                height: "auto",
                objectFit: "contain",
                filter:
                  v.label === "MOTS-C"
                    ? "drop-shadow(0 20px 40px rgba(20,39,78,0.28))"
                    : "drop-shadow(0 12px 24px rgba(20,39,78,0.18))",
                pointerEvents: "none",
              }}
            />
            <span
              style={{
                marginTop: 10,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--pl-navy)",
                opacity: 0.45,
                fontFamily: "var(--pl-font-body)",
              }}
            >
              {v.label}
            </span>
          </div>
        ))}
      </div>

      {/* Mix & match hint */}
      <div
        style={{
          position: "absolute",
          bottom: 4,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--pl-navy)",
          opacity: 0.28,
          whiteSpace: "nowrap",
          fontFamily: "var(--pl-font-body)",
        }}
      >
        Mix &amp; match — any peptide, any combo
      </div>
    </div>
  );
}
