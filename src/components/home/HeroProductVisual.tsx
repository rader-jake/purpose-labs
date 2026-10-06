"use client";

import { useEffect, useState } from "react";

const LEFT_VIALS = [
  { src: "/hero-bpc157.png", alt: "BPC-157 10MG", label: "BPC-157" },
  { src: "/hero-tb500.png",  alt: "TB-500 10MG",  label: "TB-500"  },
];

const RIGHT_VIALS = [
  { src: "/hero-motsc.png",  alt: "MOTS-C 10MG",  label: "MOTS-C"  },
  { src: "/hero-tb500.png",  alt: "GLP-3 10MG",   label: "GLP-3"   },
];

const SPARKLE_POSITIONS = [
  { top: "12%", left: "8%",  size: 18, delay: "0s",    dur: "3.1s" },
  { top: "20%", left: "85%", size: 14, delay: "0.6s",  dur: "2.7s" },
  { top: "55%", left: "4%",  size: 10, delay: "1.2s",  dur: "3.4s" },
  { top: "65%", left: "90%", size: 16, delay: "0.3s",  dur: "2.9s" },
  { top: "80%", left: "22%", size: 12, delay: "1.8s",  dur: "3.2s" },
  { top: "78%", left: "72%", size: 9,  delay: "0.9s",  dur: "2.6s" },
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
      style={{ width: "100%", maxWidth: 560, height: 420 }}
    >
      <style>{`
        @keyframes float-a { 0%,100%{transform:translateY(0px) rotate(-2deg)} 50%{transform:translateY(-18px) rotate(1.5deg)} }
        @keyframes float-b { 0%,100%{transform:translateY(0px) rotate(1deg)}  50%{transform:translateY(-24px) rotate(-1deg)} }
        @keyframes float-c { 0%,100%{transform:translateY(0px) rotate(2deg)}  50%{transform:translateY(-14px) rotate(-2deg)} }
        @keyframes float-d { 0%,100%{transform:translateY(0px) rotate(-1deg)} 50%{transform:translateY(-20px) rotate(1.5deg)} }
        @keyframes glow    { 0%,100%{opacity:0.5} 50%{opacity:0.85} }
        @keyframes sparkle {
          0%  { transform: scale(0) rotate(0deg);   opacity:0; }
          40% { transform: scale(1) rotate(80deg);  opacity:1; }
          80% { transform: scale(0.8) rotate(140deg); opacity:0.6; }
          100%{ transform: scale(0) rotate(200deg); opacity:0; }
        }
        @keyframes free-bounce {
          0%,100% { transform: translateY(0px) rotate(-4deg); }
          50%     { transform: translateY(-10px) rotate(-4deg); }
        }
        @keyframes plus-pulse {
          0%,100% { transform: scale(1);   opacity:0.9; }
          50%     { transform: scale(1.15); opacity:1; }
        }
        .float-a { animation: float-a 5.5s ease-in-out 0s   infinite; }
        .float-b { animation: float-b 6.2s ease-in-out 0.8s infinite; }
        .float-c { animation: float-c 4.9s ease-in-out 1.4s infinite; }
        .float-d { animation: float-d 5.8s ease-in-out 0.4s infinite; }
        .glow    { animation: glow    6s   ease-in-out 0s   infinite; }
        .sparkle { animation: sparkle 3s   ease-in-out both infinite; }
        .free-bounce { animation: free-bounce 3.5s ease-in-out infinite; }
        .plus-pulse  { animation: plus-pulse  2s   ease-in-out infinite; }
      `}</style>

      {/* Background glow */}
      <div
        className={`absolute inset-0 pointer-events-none ${!reducedMotion ? "glow" : ""}`}
        style={{
          background:
            "radial-gradient(ellipse at 50% 90%, rgba(255,255,255,0.9) 0%, rgba(155,164,180,0.1) 50%, transparent 72%)",
          filter: "blur(36px)",
        }}
      />

      {/* Sparkles */}
      {!reducedMotion &&
        SPARKLE_POSITIONS.map((s, i) => (
          <div
            key={i}
            className="sparkle pointer-events-none absolute"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
              animationDuration: s.dur,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" width={s.size} height={s.size}>
              <path
                d="M12 2L13.5 9.5L21 12L13.5 14.5L12 22L10.5 14.5L3 12L10.5 9.5Z"
                fill="#4A6FBF"
                opacity="0.7"
              />
            </svg>
          </div>
        ))}

      {/* ===== LEFT SIDE — "BUY" vials ===== */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "42%",
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 16,
          paddingBottom: 40,
        }}
      >
        {/* BUY label */}
        <div
          style={{
            position: "absolute",
            top: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1B2A4A",
            color: "#fff",
            borderRadius: 100,
            padding: "5px 16px",
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            fontFamily: "var(--pl-font-body)",
          }}
        >
          YOUR PICK
        </div>

        <div className={`flex flex-col items-center justify-end ${!reducedMotion ? "float-a" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LEFT_VIALS[0].src}
            alt={LEFT_VIALS[0].alt}
            draggable={false}
            style={{
              width: 105,
              height: "auto",
              objectFit: "contain",
              filter: "drop-shadow(0 12px 28px rgba(20,39,78,0.15))",
              pointerEvents: "none",
            }}
          />
          <span
            style={{
              marginTop: 8,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--pl-navy)",
              opacity: 0.5,
              fontFamily: "var(--pl-font-body)",
            }}
          >
            {LEFT_VIALS[0].label}
          </span>
        </div>

        <div className={`flex flex-col items-center justify-end pb-8 ${!reducedMotion ? "float-b" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LEFT_VIALS[1].src}
            alt={LEFT_VIALS[1].alt}
            draggable={false}
            style={{
              width: 85,
              height: "auto",
              objectFit: "contain",
              filter: "drop-shadow(0 10px 22px rgba(20,39,78,0.12))",
              pointerEvents: "none",
            }}
          />
          <span
            style={{
              marginTop: 8,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--pl-navy)",
              opacity: 0.4,
              fontFamily: "var(--pl-font-body)",
            }}
          >
            {LEFT_VIALS[1].label}
          </span>
        </div>
      </div>

      {/* ===== CENTER — "+" ===== */}
      <div
        className={`absolute ${!reducedMotion ? "plus-pulse" : ""}`}
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 20,
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1B2A4A 0%, #4A6FBF 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 24px rgba(27,42,74,0.4)",
          color: "#fff",
          fontSize: 26,
          fontWeight: 900,
          lineHeight: 1,
          fontFamily: "var(--pl-font-display)",
        }}
      >
        +
      </div>

      {/* ===== RIGHT SIDE — "FREE" vials ===== */}
      <div
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: "42%",
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 16,
          paddingBottom: 40,
        }}
      >
        {/* FREE badge — floating above */}
        <div
          className={`${!reducedMotion ? "free-bounce" : ""}`}
          style={{
            position: "absolute",
            top: 16,
            left: "50%",
            transform: "translateX(-50%) rotate(-4deg)",
            background: "linear-gradient(90deg, #22c55e, #16a34a)",
            color: "#fff",
            borderRadius: 100,
            padding: "6px 18px",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            fontFamily: "var(--pl-font-body)",
            boxShadow: "0 6px 20px rgba(34,197,94,0.45)",
            zIndex: 10,
          }}
        >
          🎁 FREE
        </div>

        <div className={`flex flex-col items-center justify-end pb-8 ${!reducedMotion ? "float-c" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={RIGHT_VIALS[0].src}
            alt={RIGHT_VIALS[0].alt}
            draggable={false}
            style={{
              width: 85,
              height: "auto",
              objectFit: "contain",
              filter: "drop-shadow(0 10px 22px rgba(20,39,78,0.12))",
              pointerEvents: "none",
            }}
          />
          <span
            style={{
              marginTop: 8,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--pl-navy)",
              opacity: 0.4,
              fontFamily: "var(--pl-font-body)",
            }}
          >
            {RIGHT_VIALS[0].label}
          </span>
        </div>

        <div className={`flex flex-col items-center justify-end ${!reducedMotion ? "float-d" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={RIGHT_VIALS[1].src}
            alt={RIGHT_VIALS[1].alt}
            draggable={false}
            style={{
              width: 105,
              height: "auto",
              objectFit: "contain",
              filter: "drop-shadow(0 12px 28px rgba(20,39,78,0.15))",
              pointerEvents: "none",
            }}
          />
          <span
            style={{
              marginTop: 8,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--pl-navy)",
              opacity: 0.5,
              fontFamily: "var(--pl-font-body)",
            }}
          >
            {RIGHT_VIALS[1].label}
          </span>
        </div>
      </div>

      {/* Bottom hint */}
      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--pl-navy)",
          opacity: 0.3,
          whiteSpace: "nowrap",
          fontFamily: "var(--pl-font-body)",
        }}
      >
        Pick any peptide — it ships free
      </div>
    </div>
  );
}
