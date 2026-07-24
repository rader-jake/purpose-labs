import Link from "next/link";
import { Reveal } from "./Reveal";

const PILLARS = [
  {
    number: "01",
    title: "≥99% Purity",
    copy: "Verified through third-party HPLC and FTIR testing.",
  },
  {
    number: "02",
    title: "Batch-Specific COAs",
    copy: "Supporting analytical documentation is available for every batch.",
  },
  {
    number: "03",
    title: "CAS Documentation",
    copy: "Every product includes its published CAS number for clear research identification.",
  },
  {
    number: "04",
    title: "Secure Shipping",
    copy: "Orders are securely and discreetly packaged, with same-day processing whenever possible.",
  },
];

export function QualityProof() {
  return (
    <section 
      className="bg-[#F1F6F9] py-16 md:py-24 border-t"
      style={{ 
        borderColor: "var(--pl-border)",
        fontFamily: "var(--pl-font-body)" 
      }}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        
        {/* Header */}
        <Reveal>
          <div className="max-w-2xl mb-12 sm:mb-16">
            <span 
              className="mb-4 inline-block text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "var(--pl-slate)" }}
            >
              Analytical Verification
            </span>
            <h2 
              className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight"
              style={{ 
                color: "var(--pl-navy)", 
                fontFamily: "var(--pl-font-display)",
                lineHeight: 1.1 
              }}
            >
              Proof Should Be Part of the Product.
            </h2>
          </div>
        </Reveal>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar, idx) => (
            <Reveal key={pillar.number} delay={idx * 100}>
              <div 
                className="flex flex-col h-full p-6 bg-white rounded-lg border border-[rgba(155,164,180,0.2)] hover:border-[rgba(20,39,78,0.3)] transition-all duration-300"
              >
                <span 
                  className="text-xs font-mono font-bold mb-4 inline-block"
                  style={{ color: "var(--pl-muted)" }}
                >
                  {pillar.number}
                </span>
                <h3 
                  className="text-xl font-medium mb-3"
                  style={{ 
                    color: "var(--pl-navy)", 
                    fontFamily: "var(--pl-font-display)" 
                  }}
                >
                  {pillar.title}
                </h3>
                <p 
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--pl-text-secondary)" }}
                >
                  {pillar.copy}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* CTA */}
        <Reveal delay={200}>
          <div className="mt-12 flex justify-start">
            <Link
              href="/quality"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] underline underline-offset-4 transition-all duration-200 hover:opacity-70"
              style={{ color: "var(--pl-navy)" }}
            >
              View Quality Standards &rarr;
            </Link>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
