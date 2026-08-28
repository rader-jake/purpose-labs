import Link from "next/link";
import { Reveal } from "./Reveal";

const CATEGORIES = [
  {
    name: "Peptides",
    description: "High-purity synthetic research compounds.",
    link: "/products?category=peptides",
  },
  {
    name: "Bundles",
    description: "Synergistic research compound combinations.",
    link: "/products?category=bundles",
  },
  {
    name: "Accessories",
    description: "Laboratory reconstitution solution and supplies.",
    link: "/products?category=accessories",
  },
];

export function CategoryDiscovery() {
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
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <span 
                className="mb-4 inline-block text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: "var(--pl-slate)" }}
              >
                Structure & Class
              </span>
              <h2 
                className="text-4xl sm:text-5xl font-medium tracking-tight"
                style={{ 
                  color: "var(--pl-navy)", 
                  fontFamily: "var(--pl-font-display)",
                  lineHeight: 1.1 
                }}
              >
                Browse by Category
              </h2>
            </div>
            <p 
              className="mt-4 md:mt-0 text-sm max-w-xs"
              style={{ color: "var(--pl-text-secondary)" }}
            >
              Discover target groupings formulated for systematic pre-clinical research.
            </p>
          </div>
        </Reveal>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {CATEGORIES.map((cat, idx) => (
            <Reveal key={cat.name} delay={idx * 100}>
              <Link
                href={cat.link}
                className="group flex flex-col justify-between h-56 p-8 bg-white rounded-lg border border-[rgba(155,164,180,0.2)] hover:border-[rgba(20,39,78,0.35)] hover:shadow-[0_12px_24px_rgba(20,39,78,0.04)] transition-all duration-300"
              >
                <div>
                  <h3 
                    className="text-3xl font-medium mb-3 transition-colors duration-300 group-hover:text-[var(--pl-navy-hover)]"
                    style={{ 
                      color: "var(--pl-navy)", 
                      fontFamily: "var(--pl-font-display)" 
                    }}
                  >
                    {cat.name}
                  </h3>
                  <p 
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--pl-text-secondary)" }}
                  >
                    {cat.description}
                  </p>
                </div>
                
                <span 
                  className="text-[10px] font-semibold uppercase tracking-[0.1em] underline underline-offset-4 group-hover:opacity-70 transition-opacity duration-200"
                  style={{ color: "var(--pl-navy)" }}
                >
                  Explore Category &rarr;
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
