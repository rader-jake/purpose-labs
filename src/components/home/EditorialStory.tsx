"use client";

import { Reveal } from "./Reveal";
import dynamic from "next/dynamic";
const VialViewer = dynamic(() => import("@/components/VialViewer").then(m => m.VialViewer), { ssr: false });

export function EditorialStory() {

  return (
    <section 
      className="bg-[#F1F6F9] py-16 md:py-24 border-t"
      style={{ 
        borderColor: "var(--pl-border)",
        fontFamily: "var(--pl-font-body)" 
      }}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          
          {/* Left Column: Cinematic Visual */}
          <div className="relative overflow-hidden rounded-xl bg-[#0d1b3e] h-[400px] sm:h-[480px] lg:col-span-6">
            <VialViewer />
          </div>

          {/* Right Column: Editorial Text */}
          <div className="flex flex-col items-start lg:col-span-6">
            <Reveal delay={100}>
              <span 
                className="mb-4 inline-block text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: "var(--pl-slate)" }}
              >
                Our Philosophy
              </span>
            </Reveal>

            <Reveal delay={200}>
              <h2 
                className="text-4xl sm:text-5xl font-medium tracking-tight mb-6"
                style={{ 
                  color: "var(--pl-navy)", 
                  fontFamily: "var(--pl-font-display)",
                  lineHeight: 1.1 
                }}
              >
                Transparency Built<br />Into Every Batch.
              </h2>
            </Reveal>

            <Reveal delay={300}>
              <p 
                className="text-base leading-relaxed mb-6"
                style={{ color: "var(--pl-text-secondary)" }}
              >
                Every product includes supporting documentation, verified analytical testing, 
                and clearly identified CAS numbers so researchers know exactly what they’re receiving.
              </p>
            </Reveal>

            {/* Supporting blockquote style */}
            <Reveal delay={400}>
              <div 
                className="border-l-2 pl-4 py-1 italic mb-6"
                style={{ 
                  borderColor: "var(--pl-navy)",
                  fontFamily: "var(--pl-font-display)",
                  color: "var(--pl-navy)" 
                }}
              >
                &ldquo;Documentation is not an extra. It is part of the process.&rdquo;
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
}
