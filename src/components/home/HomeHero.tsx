import Link from "next/link";
import { HeroProductVisual } from "./HeroProductVisual";
import { Reveal } from "./Reveal";

export function HomeHero() {
  return (
    <section 
      className="relative overflow-hidden bg-[#F1F6F9] pt-12 pb-16 md:pt-16 md:pb-24 lg:pt-20 lg:pb-28"
      style={{ fontFamily: "var(--pl-font-body)" }}
    >
      {/* Art-directed, soft ambient lighting gradients */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-40 select-none"
        style={{
          background: "radial-gradient(circle at 10% 20%, var(--pl-white) 0%, transparent 45%), radial-gradient(circle at 80% 60%, rgba(155, 164, 180, 0.15) 0%, transparent 50%)"
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-10">
        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8">
          
          {/* Eyebrow & Headline */}
          <div className="lg:col-span-7 lg:col-start-1 lg:row-start-1 order-1 flex flex-col items-start mb-6 lg:mb-4">
            <Reveal delay={100}>
              <span 
                className="mb-3 inline-block text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: "var(--pl-slate)" }}
              >
                #1 Trusted Peptide Source · US-Based · Ships Same Day
              </span>
            </Reveal>

            <Reveal delay={200}>
              <h1 
                className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight"
                style={{ 
                  color: "var(--pl-navy)", 
                  fontFamily: "var(--pl-font-display)",
                  lineHeight: 1.05
                }}
              >
                Research-Grade<br />Peptides.<br />Batch Verified.
              </h1>
            </Reveal>
          </div>

          {/* Product Visual — three bouncing vials */}
          <div className="lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:row-span-2 order-2 lg:order-none flex justify-center items-center w-full mb-8 lg:mb-0 lg:-ml-6 z-10">
            <Reveal delay={250} duration={900}>
              <HeroProductVisual />
            </Reveal>
          </div>

          {/* Supporting Details & CTA */}
          <div className="lg:col-span-7 lg:col-start-1 lg:row-start-2 order-3 flex flex-col items-start">
            
            <Reveal delay={300}>
              <p 
                className="max-w-lg text-sm sm:text-base leading-relaxed mb-4"
                style={{ color: "var(--pl-text-secondary)" }}
              >
                ≥99% purity. Batch-verified by independent US labs. No minimums, no compromises.
              </p>
            </Reveal>

            <Reveal delay={350}>
              <div className="mb-6 flex items-center gap-2">
                <span className="h-[1px] w-6 bg-[rgba(57,72,103,0.25)]" />
                <span 
                  className="text-xs uppercase tracking-[0.16em]"
                  style={{ color: "var(--pl-slate)" }}
                >
                  Trusted by 3,000+ researchers across the US
                </span>
              </div>
            </Reveal>

            <Reveal delay={380}>
              <Link
                href="/products"
                className="mb-4 inline-flex items-center gap-4 rounded-full border px-6 py-3 transition-all duration-300 hover:bg-[#14274E] hover:text-[#F1F6F9] group"
                style={{
                  borderColor: "var(--pl-navy)",
                  color: "var(--pl-navy)",
                  fontFamily: "var(--pl-font-body)",
                }}
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Limited Offer</span>
                <span className="h-3 w-px bg-current opacity-30" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em]">
                  Buy One Get One — All Products · <span style={{ color: "#2563eb" }} className="group-hover:text-[#93c5fd]">50% off 2nd unit</span>
                </span>
                <span className="text-xs opacity-60">→</span>
              </Link>
            </Reveal>

            <Reveal delay={400}>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center">
                <Link
                  href="/products"
                  className="rounded-full h-12 px-10 text-sm font-semibold uppercase tracking-[0.12em] flex items-center justify-center transition-all duration-300 bg-[#14274E] text-[#F1F6F9] hover:bg-[#0f1d3b]"
                >
                  Shop the Catalog →
                </Link>
              </div>
            </Reveal>

            <Reveal delay={450}>
              <p 
                className="mt-6 text-[10px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--pl-muted)" }}
              >
                Veteran Owned · Same-Day Fulfillment · ≥99% Purity
              </p>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}
