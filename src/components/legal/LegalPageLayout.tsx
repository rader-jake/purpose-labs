// src/components/legal/LegalPageLayout.tsx

import { ReactNode } from "react";

type TocItem = { id: string; label: string };

export function LegalPageLayout({
  title,
  metaLine,
  tocItems,
  children,
}: {
  title: string;
  metaLine: string;
  tocItems: TocItem[];
  children: ReactNode;
}) {
  return (
    <main
      className="mx-auto max-w-5xl px-6 py-16 sm:px-10"
      style={{ fontFamily: "var(--pl-font-body)" }}
    >
      <p
        className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: "var(--pl-slate)" }}
      >
        Legal
      </p>
      <h1
        className="mb-3 text-4xl sm:text-5xl"
        style={{
          color: "var(--pl-navy)",
          fontFamily: "var(--pl-font-display)",
          fontWeight: 500,
        }}
      >
        {title}
      </h1>
      <p className="mb-12 text-sm" style={{ color: "var(--pl-muted)" }}>
        {metaLine}
      </p>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[220px_1fr]">
        <nav className="hidden lg:block">
          <div className="sticky top-32">
            <p
              className="mb-4 text-[10px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: "var(--pl-muted)" }}
            >
              Contents
            </p>
            <ul className="flex flex-col gap-2">
              {tocItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-sm transition-opacity duration-200 hover:opacity-70"
                    style={{ color: "var(--pl-slate)" }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="flex flex-col gap-14">{children}</div>
      </div>
    </main>
  );
}
