"use client";

import { useState } from "react";

type FaqItem = { question: string; answer: React.ReactNode };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={item.question}
            className="border-b"
            style={{ borderColor: "var(--pl-border)" }}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-6 py-7 text-left"
            >
              <span
                className="text-sm font-medium"
                style={{
                  color: isOpen ? "var(--pl-navy)" : "var(--pl-slate)",
                  fontFamily: "var(--pl-font-body)",
                }}
              >
                {item.question}
              </span>
              <span
                className="shrink-0 text-lg transition-transform duration-300"
                style={{
                  color: "var(--pl-navy)",
                  transform: isOpen ? "rotate(45deg)" : "none",
                }}
              >
                +
              </span>
            </button>
            {isOpen && (
              <div
                className="max-w-2xl pb-7 text-sm leading-relaxed"
                style={{ color: "var(--pl-text-secondary)" }}
              >
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
