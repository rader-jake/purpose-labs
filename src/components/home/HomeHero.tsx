"use client";

import Link from "next/link";
import { Reveal } from "./Reveal";

const VIALS = [
  { src: "/hero-bpc157.png", alt: "BPC-157 10MG" },
  { src: "/hero-tb500.png",  alt: "TB-500 10MG"  },
  { src: "/hero-rt.png",     alt: "GLP-3 RT 10MG" },
];

export function HomeHero() {
  return (
    <section
      className="relative overflow-hidden w-full flex flex-col items-center text-center"
      style={{
        background: "linear-gradient(170deg, #0D0A2E 0%, #110F3A 40%, #12103D 70%, #0E1A3A 100%)",
        minHeight: "100svh",
        fontFamily: "var(--pl-font-display)",
      }}
    >
      {/* Dot grid overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(120,100,255,0.13) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Faded "BOGO" background text */}
      <div
        className="pointer-events-none absolute top-0 left-0 w-full flex justify-between select-none"
        aria-hidden="true"
        style={{ lineHeight: 1 }}
      >
        <span
          style={{
            fontFamily: "var(--font-barlow), 'Arial Narrow', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(90px, 24vw, 220px)",
            color: "rgba(100,80,200,0.13)",
            userSelect: "none",
            paddingLeft: "2vw",
          }}
        >
          B
        </span>
        <span
          style={{
            fontFamily: "var(--font-barlow), 'Arial Narrow', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(90px, 24vw, 220px)",
            color: "rgba(100,80,200,0.13)",
            userSelect: "none",
            paddingRight: "2vw",
          }}
        >
          O
        </span>
      </div>

      {/* Radial purple glow center */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(90,60,220,0.18) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center pt-14 pb-0 px-6 w-full">

        {/* Limited Time pill */}
        <Reveal delay={60}>
          <div
            className="mb-6 flex items-center gap-2 rounded-full border px-5 py-2"
            style={{
              borderColor: "rgba(180,160,255,0.35)",
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(6px)",
            }}
          >
            <span style={{ fontSize: 14 }}>⚠️</span>
            <span
              className="text-xs font-black uppercase tracking-[0.2em]"
              style={{ color: "rgba(220,210,255,0.9)" }}
            >
              Limited Time Only
            </span>
          </div>
        </Reveal>

        {/* BUY 1, GET 1 */}
        <Reveal delay={110}>
          <h1
            className="leading-none mb-1"
            style={{
              fontFamily: "var(--font-barlow), 'Arial Narrow', sans-serif",
              fontSize: "clamp(3.2rem, 13vw, 8rem)",
              color: "#FFFFFF",
              letterSpacing: "0.01em",
              fontWeight: 900,
            }}
          >
            BUY 1, GET 1
          </h1>
        </Reveal>

        {/* FREE. — faded navy */}
        <Reveal delay={160}>
          <p
            className="leading-none mb-8"
            style={{
              fontFamily: "var(--font-barlow), 'Arial Narrow', sans-serif",
              fontSize: "clamp(3.6rem, 15vw, 9rem)",
              letterSpacing: "0.01em",
              fontWeight: 900,
              color: "rgba(27, 42, 74, 0.95)",
            }}
          >
            FREE.
          </p>
        </Reveal>

        {/* Free shipping badge */}
        <Reveal delay={190}>
          <p
            className="mb-6"
            style={{
              fontFamily: "var(--font-barlow), 'Arial Narrow', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(1.1rem, 4vw, 1.8rem)",
              letterSpacing: "0.12em",
              color: "#5B7FFF",
              textTransform: "uppercase",
            }}
          >
            + FREE 2 DAY SHIPPING
          </p>
        </Reveal>

        {/* Subtitle */}
        <Reveal delay={210}>
          <p
            className="max-w-sm text-center leading-relaxed mb-10"
            style={{
              color: "rgba(200,195,230,0.85)",
              fontFamily: "var(--pl-font-body)",
              fontSize: "clamp(1rem, 3vw, 1.2rem)",
            }}
          >
            Every unit you buy comes with a second one free, with no limit. Applied automatically at checkout.
          </p>
        </Reveal>

        {/* CTA */}
        <Reveal delay={250}>
          <Link
            href="/products"
            className="rounded-full px-10 py-4 text-sm font-black uppercase tracking-[0.15em] text-white transition-opacity hover:opacity-90 mb-16"
            style={{
              background: "linear-gradient(90deg, #3B55E6 0%, #5B7FFF 100%)",
              boxShadow: "0 0 32px rgba(80,100,255,0.35)",
            }}
          >
            Shop Now
          </Link>
        </Reveal>

        {/* Vials — tight row, all same size, no rotation gap */}
        <Reveal delay={300} duration={1000}>
          <div
            className="relative flex items-end justify-center w-full"
            style={{ maxWidth: 480, margin: "0 auto" }}
          >
            <style>{`
              @keyframes float-l {
                0%,100% { transform: translateY(0px); }
                50%     { transform: translateY(-16px); }
              }
              @keyframes float-c {
                0%,100% { transform: translateY(0px); }
                50%     { transform: translateY(-24px); }
              }
              @keyframes float-r {
                0%,100% { transform: translateY(0px); }
                50%     { transform: translateY(-14px); }
              }
              .bogo-vial-l { animation: float-l 4.2s ease-in-out 0s infinite; }
              .bogo-vial-c { animation: float-c 3.8s ease-in-out 0.2s infinite; }
              .bogo-vial-r { animation: float-r 4.5s ease-in-out 0.4s infinite; }
            `}</style>

            {/* Blue glow beneath */}
            <div
              className="pointer-events-none absolute bottom-0 left-1/2"
              style={{
                transform: "translateX(-50%)",
                width: "90%",
                height: 60,
                borderRadius: "50%",
                background: "radial-gradient(ellipse at 50% 100%, rgba(80,100,255,0.4) 0%, transparent 70%)",
                filter: "blur(18px)",
              }}
            />

            {/* Left vial */}
            <div className="bogo-vial-l z-[5]" style={{ width: "clamp(110px, 28vw, 160px)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={VIALS[0].src} alt={VIALS[0].alt} draggable={false}
                style={{ width: "100%", height: "auto", objectFit: "contain",
                  filter: "drop-shadow(0 16px 40px rgba(60,80,220,0.4))" }} />
            </div>

            {/* Center vial — slightly taller */}
            <div className="bogo-vial-c z-[10]" style={{ width: "clamp(130px, 34vw, 190px)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={VIALS[1].src} alt={VIALS[1].alt} draggable={false}
                style={{ width: "100%", height: "auto", objectFit: "contain",
                  filter: "drop-shadow(0 24px 56px rgba(60,80,220,0.55))" }} />
            </div>

            {/* Right vial */}
            <div className="bogo-vial-r z-[5]" style={{ width: "clamp(110px, 28vw, 160px)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={VIALS[2].src} alt={VIALS[2].alt} draggable={false}
                style={{ width: "100%", height: "auto", objectFit: "contain",
                  filter: "drop-shadow(0 16px 40px rgba(60,80,220,0.4))" }} />
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
