"use client";

import { useState } from "react";
import { CoaModal } from "./CoaModal";
import { COA_MAP } from "@/lib/coaDirectory";

export function CoaButton({ productSlug }: { productSlug: string }) {
  const [open, setOpen] = useState(false);
  const documents = COA_MAP[productSlug];

  // Graceful degradation: if we don't have a COA mapped for this
  // product yet, render nothing rather than a broken/empty button.
  if (!documents || documents.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="h-12 flex flex-col items-center justify-center rounded-2xl border px-5 transition-opacity hover:opacity-80 flex-shrink-0"
        style={{ color: "var(--pl-navy)", borderColor: "#d1d5db", background: "#fff", minWidth: 70, gap: 2 }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>COA</span>
      </button>

      {open && (
        <CoaModal documents={documents} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
