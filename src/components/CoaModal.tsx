"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

export type CoaDocument = {
  label: string;
  url: string; // path under /public, e.g. "/coas/BPC-157-COA.webp"
};

export function CoaModal({
  documents,
  onClose,
}: {
  documents: CoaDocument[];
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Portal to document.body: ProductCard applies an inline `transform`
  // to its own root div (even at translateY(0), the property is still
  // active), and any ancestor with a live transform becomes the
  // containing block for `position: fixed` descendants per the CSS
  // spec. Rendered in place, this modal would be trapped inside that
  // card's box instead of covering the viewport — confirmed by
  // inspecting the rendered rect, which showed coordinates matching the
  // grid cell, not the screen.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(20, 39, 78, 0.4)" }}
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg p-6"
        style={{ backgroundColor: "var(--pl-white)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2
            className="text-2xl"
            style={{
              color: "var(--pl-navy)",
              fontFamily: "var(--pl-font-display)",
              fontWeight: 500,
            }}
          >
            Certificate of Analysis
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200 hover:opacity-70"
            style={{ color: "var(--pl-navy)" }}
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-8">
          {documents.map((doc) => {
            const lowerUrl = doc.url.toLowerCase();
            const isPdf = lowerUrl.endsWith(".pdf");
            const isImage = /\.(jpe?g|png|webp|gif)$/.test(lowerUrl);
            return (
              <div key={doc.url}>
                <div className="mb-3 flex items-center justify-between">
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.08em]"
                    style={{ color: "var(--pl-slate)" }}
                  >
                    {doc.label}
                  </p>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs underline"
                    style={{ color: "var(--pl-navy)" }}
                  >
                    Open in new tab
                  </a>
                </div>

                {isPdf ? (
                  <iframe
                    src={doc.url}
                    className="h-[60vh] w-full rounded border"
                    style={{ borderColor: "var(--pl-border)" }}
                    title={doc.label}
                  />
                ) : isImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={doc.url}
                    alt={doc.label}
                    className="w-full rounded border"
                    style={{ borderColor: "var(--pl-border)" }}
                  />
                ) : (
                  // Not an embeddable file — a full page instead (e.g. a
                  // COA published as its own WordPress page rather than a
                  // raw image/PDF). Embedding it as an <img> would just
                  // show a broken image; link out instead.
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center rounded border px-6 py-10 text-sm font-medium"
                    style={{ borderColor: "var(--pl-border)", color: "var(--pl-navy)" }}
                  >
                    Open Certificate of Analysis →
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}
