import Link from "next/link";
import { HeroProductVisual } from "./HeroProductVisual";
import { Reveal } from "./Reveal";

export function HomeHero() {
  return (
    <section
      className="relative overflow-hidden bg-[#F8FAFC] pt-6 pb-10 md:pt-10 md:pb-16"
      style={{ fontFamily: "var(--pl-font-body)" }}
    >
      <div className="relative mx-auto max-w-2xl px-4 sm:px-6">

        {/* Dark navy card — the hero box */}
        <Reveal delay={80}>
          <div
            className="rounded-3xl px-7 pt-9 pb-8 mb-6"
            style={{
              background: "linear-gradient(160deg, #0D1A30 0%, #14274E 60%, #1a3360 100%)",
              boxShadow: "0 24px 64px rgba(13,26,48,0.28)",
            }}
          >
            {/* Headline */}
            <Reveal delay={140}>
              <h1
                className="font-black tracking-tight mb-3 text-white"
                style={{
                  fontFamily: "var(--pl-font-display)",
                  fontSize: "clamp(2.4rem, 8vw, 3.6rem)",
                  lineHeight: 1.05,
                }}
              >
                Research-Grade<br />Peptides.
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <p
                className="font-black mb-5"
                style={{
                  fontSize: "clamp(1.3rem, 5vw, 2rem)",
                  color: "#7EB4FF",
                  fontFamily: "var(--pl-font-display)",
                  lineHeight: 1.1,
                }}
              >
                Every Batch Documented.
              </p>
            </Reveal>

            {/* Subtext */}
            <Reveal delay={220}>
              <p className="text-[#A8BBCC] text-base leading-relaxed mb-7 max-w-sm">
                Purpose Labs supplies third-party tested research compounds with batch-specific Certificates of Analysis. Documented from raw material to vial.
              </p>
            </Reveal>

            {/* CTAs */}
            <Reveal delay={270}>
              <div className="flex gap-3 mb-7 flex-wrap">
                <Link
                  href="/products"
                  className="rounded-xl px-6 py-3.5 text-sm font-black text-white transition-opacity duration-200 hover:opacity-90"
                  style={{ background: "linear-gradient(90deg, #3B6FD4 0%, #5A8FEF 100%)" }}
                >
                  Browse Compounds
                </Link>
                <Link
                  href="/quality"
                  className="rounded-xl border border-white/20 px-6 py-3.5 text-sm font-black text-white transition-all duration-200 hover:bg-white/10"
                >
                  View COAs
                </Link>
              </div>
            </Reveal>

            {/* Trust icon rows */}
            <Reveal delay={310}>
              <div
                className="rounded-2xl px-5 py-4 flex flex-col gap-3"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {[
                  { icon: "⚗️", label: "3rd-party tested", sub: "Batch verified — HPLC + Mass Spec" },
                  { icon: "🚚", label: "Same-day dispatch", sub: "Orders placed before 2 PM EST" },
                  { icon: "📦", label: "Tracked shipping", sub: "FedEx 2Day with full documentation" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center rounded-xl text-lg flex-shrink-0"
                      style={{
                        width: 40,
                        height: 40,
                        background: "rgba(255,255,255,0.08)",
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-white text-sm font-bold leading-tight">{item.label}</p>
                      <p className="text-[#7A9BB5] text-xs">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </Reveal>

        {/* Vials below the card */}
        <Reveal delay={200} duration={900}>
          <HeroProductVisual />
        </Reveal>

      </div>
    </section>
  );
}
