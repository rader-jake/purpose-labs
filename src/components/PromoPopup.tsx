"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "pl_promo_popup_dismissed";
const CODE = "PURPOSE";

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
    navigator.clipboard.writeText(CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: "#0d1b3e" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-lg transition-opacity hover:opacity-75"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          aria-label="Close"
        >
          ×
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center px-8 py-10 gap-5">
          {/* Badge */}
          <span
            className="text-xs font-semibold uppercase tracking-widest px-4 py-1 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#a8c4e0" }}
          >
            Welcome Offer
          </span>

          {/* Headline */}
          <h2
            className="text-4xl font-bold leading-tight"
            style={{ color: "#ffffff", fontFamily: "var(--pl-font-heading, serif)" }}
          >
            10% Off +<br />Free Bac Water
          </h2>

          {/* Subtext */}
          <p className="text-sm leading-relaxed" style={{ color: "#a8c4e0" }}>
            Use code <strong style={{ color: "#ffffff" }}>PURPOSE</strong> at checkout to get 10% off your order and a free vial of Bacteriostatic Water included automatically.
          </p>

          {/* Copy button */}
          <button
            onClick={copyCode}
            className="w-full rounded-full px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all duration-200"
            style={{
              backgroundColor: copied ? "#2a7a4b" : "#ffffff",
              color: copied ? "#ffffff" : "#0d1b3e",
            }}
          >
            {copied ? "✓ Copied!" : `${CODE} — Tap to Copy`}
          </button>

          {/* Dismiss */}
          <button
            onClick={dismiss}
            className="text-xs underline underline-offset-2 transition-opacity hover:opacity-75"
            style={{ color: "#6b8aaa" }}
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
