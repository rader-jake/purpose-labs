import Link from "next/link";
import { HeroProductVisual } from "./HeroProductVisual";
import { Reveal } from "./Reveal";

export function HomeHero() {
  // Derived from the backend origin, not hardcoded — see
  // NEXT_PUBLIC_WORDPRESS_ORIGIN in .env.local. Points at whatever host
  // WordPress actually lives on, so this doesn't silently break again
  // next time the backend moves.
  const heroImage = `${process.env.NEXT_PUBLIC_WORDPRESS_ORIGIN}/wp-content/uploads/2026/04/theSummerStack-scaled.png`;

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
        {/* flat DOM structure with flex column on mobile/tablet and grid on desktop */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8">
          
          {/* 1. Eyebrow & Headline (Row 1 Left on Desktop, Order 1 on Mobile/Tablet) */}
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
                The Purest<br />Peptides.<br />Shipped Today.
              </h1>
            </Reveal>
          </div>

          {/* 2. Product Visual (Row 1-2 Right on Desktop, Order 2 on Mobile/Tablet) */}
          {/* Overlaps desktop columns slightly, and sizes dynamically on mobile */}
          <div className="lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:row-span-2 order-2 lg:order-none flex justify-center items-center w-full mb-8 lg:mb-0 lg:-ml-6 z-10">
            <Reveal delay={250} duration={900}>
              <HeroProductVisual 
                imageSrc={heroImage} 
                imageAlt="Purpose Labs lyophylized peptide vial" 
              />
            </Reveal>
          </div>

          {/* 3. Supporting Details & Actions (Row 2 Left on Desktop, Order 3 on Mobile/Tablet) */}
          <div className="lg:col-span-7 lg:col-start-1 lg:row-start-2 order-3 flex flex-col items-start">
            
            {/* Supporting Copy */}
            <Reveal delay={300}>
              <p 
                className="max-w-lg text-sm sm:text-base leading-relaxed mb-4"
                style={{ color: "var(--pl-text-secondary)" }}
              >
                ≥99% purity. Batch-verified by independent US labs. Every order ships same-day with a free vial of reconstitution water — no minimums, no compromises.
              </p>
            </Reveal>

            {/* Social Proof Line */}
            <Reveal delay={350}>
              <div className="mb-6 flex items-center gap-2">
                <span className="h-[1px] w-6 bg-[rgba(57,72,103,0.25)]" />
                <span 
                  className="text-xs uppercase tracking-[0.16em]"
                  style={{ 
                    color: "var(--pl-slate)" 
                  }}
                >
                  Trusted by 3,000+ researchers across the US
                </span>
              </div>
            </Reveal>

            {/* Single CTA */}
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

            {/* Bottom Trust Line */}
            <Reveal delay={450}>
              <p 
                className="mt-6 text-[10px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: "var(--pl-muted)" }}
              >
                Veteran Owned · Free Recon Water With Every Order · Same-Day Fulfillment · ≥99% Purity
              </p>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}
