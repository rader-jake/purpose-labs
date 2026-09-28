"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "pl_promo_popup_dismissed";

export function PromoPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      // Show after 3 seconds
      const t = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
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
          src="https://joshuar120.sg-host.com/wp-content/uploads/2026/09/file_1617-bb87c420-c8da-444a-8588-2736f29bb797.jpg"
          alt="Take 10% off with code PURPOSE"
          className="w-full block"
        />
      </div>
    </div>
  );
}
