// src/components/legal/Section.tsx

import { ReactNode } from "react";

export function Section({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="mb-4 flex items-baseline gap-3">
        <span className="text-xs font-semibold" style={{ color: "var(--pl-muted)" }}>
          {number}
        </span>
        <h2
          className="text-2xl"
          style={{
            color: "var(--pl-navy)",
            fontFamily: "var(--pl-font-display)",
            fontWeight: 500,
          }}
        >
          {title}
        </h2>
      </div>
      <div
        className="flex flex-col gap-4 text-sm leading-relaxed [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5 [&_li]:list-disc"
        style={{ color: "var(--pl-text-secondary)" }}
      >
        {children}
      </div>
    </section>
  );
}
