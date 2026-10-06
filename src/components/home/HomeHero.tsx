import Link from "next/link";
import Image from "next/image";
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

            <Reveal delay={150}>
              {/* Gradient pill badge */}
              <div
                className="mb-4 inline-flex items-center rounded-full px-5 py-2"
                style={{
                  background: "linear-gradient(90deg, #0B1728 0%, #1B2A4A 40%, #2E4A8A 70%, #4A6FBF 100%)",
                }}
              >
                <span className="text-white text-xs font-black uppercase tracking-[0.22em]">
                  Buy 1 + Get 1 Free
                </span>
                <span className="text-white/50 text-xs font-medium ml-2 hidden sm:inline" style={{ letterSpacing: "0.08em" }}>
                  · Mix &amp; Match Any Vial
                </span>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <h1 
                className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-3"
                style={{ 
                  color: "var(--pl-navy)", 
                  fontFamily: "var(--pl-font-display)",
                  lineHeight: 1.0
                }}
              >
                Research-Grade<br />
                <span style={{
                  background: "linear-gradient(90deg, #1B2A4A 0%, #4A6FBF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>Peptides.</span>
              </h1>
            </Reveal>

            <Reveal delay={260}>
              <p className="text-sm sm:text-base leading-relaxed mb-5 max-w-md" style={{ color: "var(--pl-text-secondary)" }}>
                Order any peptide vial — we'll automatically add a second one free to your cart. No codes needed.
              </p>
            </Reveal>

            {/* Box callout */}
            <Reveal delay={320}>
              <div className="flex items-center gap-4 mb-6 rounded-2xl overflow-hidden w-full max-w-md"
                style={{
                  background: "linear-gradient(135deg, rgba(11,23,40,0.07) 0%, rgba(74,111,191,0.08) 100%)",
                  border: "1px solid rgba(27,42,74,0.15)",
                }}>
                <Image
                  src="/images/pl-box.jpg"
                  alt="Purpose Labs box"
                  width={90}
                  height={90}
                  className="object-cover flex-shrink-0 h-full"
                  style={{ minHeight: "90px" }}
                />
                <div className="py-3 pr-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] mb-1"
                    style={{
                      background: "linear-gradient(90deg, #1B2A4A, #4A6FBF)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}>
                    Included In Every Order
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--pl-slate)" }}>
                    Your complimentary vial ships in the same Purpose Labs box — professionally packaged, same-day fulfilled.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={380}>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link
                  href="/products"
                  className="rounded-full h-12 px-10 text-sm font-black uppercase tracking-[0.12em] flex items-center justify-center transition-all duration-300 text-white"
                  style={{ background: "linear-gradient(90deg, #0B1728 0%, #2E4A8A 100%)" }}
                >
                  Claim Your Free Vial →
                </Link>
                <Link
                  href="/products"
                  className="rounded-full h-12 px-8 text-sm font-semibold uppercase tracking-[0.12em] flex items-center justify-center transition-all duration-300 border"
                  style={{ borderColor: "var(--pl-navy)", color: "var(--pl-navy)" }}
                >
                  Browse All
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
