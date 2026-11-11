import Link from "next/link";
import { HeroProductVisual } from "./HeroProductVisual";
import { Reveal } from "./Reveal";

export function HomeHero() {
  return (
    <section
      className="relative overflow-hidden bg-[#F8FAFC] pt-10 pb-12 md:pt-14 md:pb-20 lg:pt-16 lg:pb-24"
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
                Research-Grade Peptides.<br />
                <span
                  style={{
                    background: "linear-gradient(90deg, #1B2A4A 0%, #4A6FBF 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Every Batch Documented.
                </span>
              </h1>
            </Reveal>

            {/* Sub */}
            <Reveal delay={220}>
              <p
                className="text-base sm:text-lg leading-relaxed mb-7 max-w-sm"
                style={{ color: "var(--pl-text-secondary)" }}
              >
                Third-party tested. COA on every lot. Same-day fulfillment.
              </p>
            </Reveal>

            {/* CTAs */}
            <Reveal delay={280}>
              <div className="flex flex-wrap gap-3 mb-6">
                <Link
                  href="/products"
                  className="rounded-full px-7 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition-opacity duration-200 hover:opacity-85"
                  style={{ background: "#14274E" }}
                >
                  Shop Compounds
                </Link>
                <Link
                  href="/coa"
                  className="rounded-full border px-7 py-3 text-xs font-black uppercase tracking-[0.14em] transition-all duration-200 hover:bg-[#14274E] hover:text-white"
                  style={{ borderColor: "#14274E", color: "#14274E" }}
                >
                  View COA
                </Link>
              </div>
            </Reveal>

            {/* Trust line */}
            <Reveal delay={340}>
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: "var(--pl-muted)" }}
              >
                Veteran Owned · ≥99% Purity · COA Every Batch · Same-Day FedEx
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
    </section>
  );
}
