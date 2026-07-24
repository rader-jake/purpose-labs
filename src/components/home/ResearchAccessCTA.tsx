import Link from "next/link";
import { Reveal } from "./Reveal";

export function ResearchAccessCTA() {
  return (
    <section 
      className="bg-[#F1F6F9] py-16 md:py-24 border-t"
      style={{ 
        borderColor: "var(--pl-border)",
        fontFamily: "var(--pl-font-body)" 
      }}
    >
      <div className="mx-auto max-w-4xl px-6 sm:px-10">
        <Reveal>
          <div 
            className="flex flex-col items-center text-center p-8 sm:p-12 md:p-16 bg-white rounded-lg border border-[rgba(155,164,180,0.25)] hover:border-[rgba(20,39,78,0.3)] transition-all duration-300"
          >
            <span 
              className="mb-4 inline-block text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "var(--pl-slate)" }}
            >
              Credentials & Catalog
            </span>
            
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight mb-4"
              style={{ 
                color: "var(--pl-navy)", 
                fontFamily: "var(--pl-font-display)",
                lineHeight: 1.15
              }}
            >
              Private Research Access
            </h2>
            
            <p 
              className="max-w-xl text-sm sm:text-base leading-relaxed mb-8"
              style={{ color: "var(--pl-text-secondary)" }}
            >
              Create an account to browse the catalog, explore available compounds, and stay informed on new product releases.
            </p>
            
            <Link
              href="/contact"
              className="rounded-full px-8 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-center w-full sm:w-auto bg-[#14274e] text-[#f1f6f9] hover:bg-[#0f1d3b] transition-all duration-300"
            >
              Get Research Access
            </Link>

            <span 
              className="mt-6 text-[10px] uppercase tracking-[0.08em]"
              style={{ color: "var(--pl-muted)" }}
            >
              Your Goals, Our Purpose.
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
