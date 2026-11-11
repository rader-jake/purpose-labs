"use client";

import Link from "next/link";
import { HeroProductVisual } from "./HeroProductVisual";
import { Reveal } from "./Reveal";

export function HomeHero() {
  return (
    <section
      className="relative overflow-hidden w-full"
      style={{
        fontFamily: "var(--pl-font-body)",
        background: "linear-gradient(135deg, #0D1A30 0%, #14274E 55%, #1C3464 100%)",
        minHeight: "75vh",
      }}
    >
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 70% 50%, rgba(74,111,191,0.18) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 py-14 md:py-20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

        {/* LEFT — Text */}
        <div className="flex flex-col items-start max-w-lg z-10">

          <Reveal delay={100}>
            <h1
              className="font-black tracking-tight mb-3 text-white"
              style={{
                fontFamily: "var(--pl-font-display)",
                fontSize: "clamp(3rem, 7vw, 5rem)",
                lineHeight: 1.0,
              }}
            >
              Research<br />Peptides.
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p
              className="font-black mb-5"
              style={{
                fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
                color: "#7EB4FF",
                fontFamily: "var(--pl-font-display)",
                lineHeight: 1.1,
              }}
            >
              Verified by science.
            </p>
          </Reveal>

          <Reveal delay={210}>
            <p className="text-[#A8BBCC] text-base leading-relaxed mb-8 max-w-sm">
              Purpose Labs supplies third-party tested research compounds with batch-specific Certificates of Analysis. Sourced, tested, and documented from raw material to vial.
            </p>
          </Reveal>

          <Reveal delay={260}>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/products"
                className="rounded-xl px-7 py-3.5 text-sm font-black text-white transition-opacity duration-200 hover:opacity-90"
                style={{ background: "linear-gradient(90deg, #3B6FD4 0%, #5A8FEF 100%)" }}
              >
                Browse Peptides
              </Link>
              <Link
                href="/quality"
                className="rounded-xl border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-black text-white transition-all duration-200 hover:bg-white/12"
              >
                View COAs
              </Link>
            </div>
          </Reveal>



        </div>

        {/* RIGHT — Vials */}
        <div className="flex justify-center lg:justify-end items-end flex-shrink-0 z-10">
          <Reveal delay={180} duration={900}>
            <HeroProductVisual />
          </Reveal>
        </div>

      </div>
    </section>
  );
}
