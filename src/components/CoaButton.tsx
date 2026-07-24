"use client";

import { useState } from "react";
import { CoaModal } from "./CoaModal";
import { COA_MAP } from "@/lib/coaMap";

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
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] underline transition-opacity duration-200 hover:opacity-70"
        style={{ color: "var(--pl-navy)" }}
      >
        View COA
      </button>

      {open && (
        <CoaModal documents={documents} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
