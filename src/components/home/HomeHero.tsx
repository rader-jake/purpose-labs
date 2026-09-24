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
          background: "radial-gradient(circle at 10% 20%, var(--pl-white) 0%, transparent 45%), radial-gradient(circle at 80% 60%, rgba(155, 164, 180, 0.15) 0%, transparent 50%)"
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-10">
        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8">
          
          {/* Left — Headline & CTA */}
          <div className="lg:col-span-6 lg:col-start-1 lg:row-start-1 order-1 flex flex-col items-start mb-6 lg:mb-0">
            <Reveal delay={100}>
              <span 
                className="mb-3 inline-block text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: "var(--pl-slate)" }}
              >
                #1 Trusted Peptide Source · US-Based · Ships Same Day
              </span>
            </Reveal>

            <Reveal delay={180}>
              <h1 
                className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-3"
                style={{ 
                  color: "var(--pl-navy)", 
                  fontFamily: "var(--pl-font-display)",
                  lineHeight: 1.0
                }}
              >
                Research-Grade<br />
                <span style={{ color: "var(--pl-navy)" }}>Peptides.</span>
              </h1>
            </Reveal>

            <Reveal delay={260}>
              <p className="text-sm sm:text-base leading-relaxed mb-5 max-w-md" style={{ color: "var(--pl-text-secondary)" }}>
                ≥99% purity. Batch-verified by independent US labs. No minimums, no compromises.
              </p>
            </Reveal>

            <Reveal delay={320}>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link
                  href="/products"
                  className="rounded-full h-12 px-10 text-sm font-semibold uppercase tracking-[0.12em] flex items-center justify-center transition-all duration-300 bg-[#14274E] text-[#F1F6F9] hover:bg-[#0f1d3b]"
                >
                  Shop the Catalog →
                </Link>
              </div>
            </Reveal>

            <Reveal delay={440}>
              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--pl-muted)" }}>
                Veteran Owned · Same-Day Fulfillment · ≥99% Purity
              </p>
            </Reveal>
          </div>

          {/* Right — Product Visual */}
          <div className="lg:col-span-6 lg:col-start-7 lg:row-start-1 order-2 lg:order-none flex justify-center items-center w-full mb-8 lg:mb-0 z-10">
            <Reveal delay={250} duration={900}>
              <HeroProductVisual />
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}
