"use client";

// Error boundary for individual product pages.
// Catches server errors (WooCommerce timeout, API blip, etc.) and shows
// a clean fallback instead of a raw 500 — added 2026-09-17 after a
// SiteGround cold-start timeout caused a customer-facing 500 on /products/pl-rt.

import Link from "next/link";
import { useEffect } from "react";

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ProductPage error]", error);
  }, [error]);

  return (
    <main
      className="flex min-h-[calc(100vh-92px-34px)] flex-col items-center justify-center px-6 text-center"
      style={{ fontFamily: "var(--pl-font-body)", backgroundColor: "var(--pl-ivory)" }}
    >
      <span
        className="mb-4 inline-block text-[10px] font-bold uppercase tracking-[0.2em]"
        style={{ color: "var(--pl-slate)" }}
      >
        Temporary Issue
      </span>
      <h1
        className="mb-4 text-4xl font-medium"
        style={{ color: "var(--pl-navy)", fontFamily: "var(--pl-font-display)" }}
      >
        This page hit a snag.
      </h1>
      <p className="mb-8 max-w-md text-sm leading-relaxed" style={{ color: "var(--pl-text-secondary)" }}>
        We couldn&apos;t load this product right now — likely a temporary backend issue.
        Try again in a moment or browse the full catalog.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={reset}
          className="rounded-full h-12 px-8 text-sm font-semibold uppercase tracking-[0.12em] flex items-center justify-center transition-all duration-300 bg-[#14274E] text-[#F1F6F9] hover:bg-[#0f1d3b]"
        >
          Try Again
        </button>
        <Link
          href="/products"
          className="rounded-full h-12 px-8 text-sm font-semibold uppercase tracking-[0.12em] flex items-center justify-center border border-[#14274E] text-[#14274E] hover:bg-[#14274E] hover:text-[#F1F6F9] transition-all duration-300"
        >
          Browse Catalog
        </Link>
      </div>
    </main>
  );
}
