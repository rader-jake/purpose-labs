import Link from "next/link";
import { HeroProductVisual } from "./HeroProductVisual";
import { Reveal } from "./Reveal";

export function HomeHero() {
  return (
    <section
      className="relative overflow-hidden bg-[#F1F6F9] pt-10 pb-12 md:pt-14 md:pb-20 lg:pt-16 lg:pb-24"
      style={{ fontFamily: "var(--pl-font-body)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40 select-none"
        style={{
          background:
            "radial-gradient(circle at 10% 20%, var(--pl-white) 0%, transparent 45%), radial-gradient(circle at 80% 60%, rgba(155, 164, 180, 0.15) 0%, transparent 50%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-10">
        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8">

          {/* Left — Headline & CTA */}
          <div className="lg:col-span-5 lg:col-start-1 lg:row-start-1 order-1 flex flex-col items-start mb-6 lg:mb-0">

            {/* LIMITED TIME badge */}
            <Reveal delay={100}>
              <div
                className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
                style={{
                  background: "linear-gradient(90deg, #0B1728 0%, #2E4A8A 100%)",
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#22c55e",
                    display: "inline-block",
                    boxShadow: "0 0 6px 2px rgba(34,197,94,0.5)",
                    flexShrink: 0,
                    animation: "pulse-dot 2s ease-in-out infinite",
                  }}
                />
                <span className="text-white text-[10px] font-black uppercase tracking-[0.22em]">
                  Limited Time Offer
                </span>
              </div>
            </Reveal>

            {/* Big headline */}
            <Reveal delay={160}>
              <h1
                className="font-black tracking-tight mb-4"
                style={{
                  color: "var(--pl-navy)",
                  fontFamily: "var(--pl-font-display)",
                  fontSize: "clamp(2.6rem, 6vw, 4.5rem)",
                  lineHeight: 1.0,
                }}
              >
                Buy Any Peptide.<br />
                <span
                  style={{
                    background: "linear-gradient(90deg, #1B2A4A 0%, #4A6FBF 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Get Any Peptide Free.
                </span>
              </h1>
            </Reveal>

            {/* Sub */}
            <Reveal delay={220}>
              <p
                className="text-base sm:text-lg leading-relaxed mb-7 max-w-sm"
                style={{ color: "var(--pl-text-secondary)" }}
              >
                Mix. Match. Stack your protocol your way — pick <strong style={{ color: "var(--pl-navy)" }}>any</strong> vial free. No code needed.
              </p>
            </Reveal>

            {/* CTA */}
            <Reveal delay={280}>
              <Link
                href="/products"
                className="rounded-full h-14 px-10 text-sm font-black uppercase tracking-[0.14em] flex items-center justify-center transition-all duration-300 text-white"
                style={{
                  background: "linear-gradient(90deg, #0B1728 0%, #2E4A8A 100%)",
                  boxShadow: "0 8px 32px rgba(27,42,74,0.35)",
                }}
              >
                Claim Your Free Vial →
              </Link>
            </Reveal>

            {/* Trust line */}
            <Reveal delay={340}>
              <p
                className="mt-5 text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: "var(--pl-muted)" }}
              >
                Veteran Owned · Same-Day Fulfillment · ≥99% Purity
              </p>
            </Reveal>
          </div>

          {/* Right — Product Visual */}
          <div className="lg:col-span-7 lg:col-start-6 lg:row-start-1 order-2 lg:order-none flex justify-center items-center w-full mb-8 lg:mb-0 z-10">
            <Reveal delay={200} duration={900}>
              <HeroProductVisual />
            </Reveal>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%,100% { box-shadow: 0 0 6px 2px rgba(34,197,94,0.5); }
          50%      { box-shadow: 0 0 12px 4px rgba(34,197,94,0.8); }
        }
      `}</style>
    </section>
  );
}
