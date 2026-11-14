"use client";

import { useState } from "react";
import { CoaModal } from "./CoaModal";
import { COA_MAP } from "@/lib/coaDirectory";

export function CoaButton({ productSlug, compact }: { productSlug: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const documents = COA_MAP[productSlug];

  // Graceful degradation: if we don't have a COA mapped for this
  // product yet, render nothing rather than a broken/empty button.
  if (!documents || documents.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={compact
          ? "h-12 w-12 flex items-center justify-center rounded-full border border-[#d0d9e8] bg-white text-xs font-bold transition-opacity hover:opacity-70 flex-shrink-0"
          : "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] underline transition-opacity duration-200 hover:opacity-70"
        }
        style={{ color: compact ? "#0d1b2e" : "var(--pl-navy)" }}
        title="View Certificate of Analysis"
      >
        {compact ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
          </svg>
        ) : "View COA"}
        {!compact && ""}
      </button>

      {open && (
        <CoaModal documents={documents} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
