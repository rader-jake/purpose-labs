"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "pl_promo_popup_dismissed";

export function PromoPopup() {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      const t = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  function copyCode() {
    navigator.clipboard.writeText("RESEARCH25").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-lg transition-opacity hover:opacity-75"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          aria-label="Close"
        >
          ×
        </button>

        {/* Promo image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://joshuar120.sg-host.com/wp-content/uploads/2026/10/pl-promo-banner.jpg"
          alt="Take 10% off with code PURPOSE"
          className="w-full block"
        />

        {/* Copy code button */}
        <div
          className="flex items-center justify-center gap-3 py-4 px-6"
          style={{ backgroundColor: "#0d1b3e" }}
        >
          <span className="text-white text-sm tracking-widest uppercase font-light">
            Use code
          </span>
          <button
            onClick={copyCode}
            className="flex items-center gap-2 rounded-full px-6 py-2 text-sm font-bold uppercase tracking-widest transition-all duration-200"
            style={{
              backgroundColor: copied ? "#2a7a4b" : "#ffffff",
              color: copied ? "#ffffff" : "#0d1b3e",
            }}
          >
            {copied ? "✓ Copied!" : "RESEARCH25 — Tap to Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
