"use client";

/**
 * BOGO promo banner — luxury redesign.
 * Positioned directly below the hero.
 */
export function BogoPromo() {
  return (
    <div
      className="w-full py-5 px-6 flex items-center justify-center gap-6 flex-wrap relative overflow-hidden"
      style={{
        background: "linear-gradient(90deg, #0B1728 0%, #162340 50%, #0B1728 100%)",
        borderTop: "1px solid rgba(212,175,55,0.2)",
        borderBottom: "1px solid rgba(212,175,55,0.2)",
      }}
    >
      {/* Subtle shimmer line top */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)" }}
      />

      {/* Left — label */}
      <span
        className="text-[10px] font-semibold uppercase tracking-[0.25em]"
        style={{ color: "rgba(212,175,55,0.7)" }}
      >
        Exclusive Offer
      </span>

      {/* Divider */}
      <span style={{ color: "rgba(212,175,55,0.3)" }}>|</span>

      {/* Main copy */}
      <span className="text-center">
        <span
          className="text-sm sm:text-base font-light tracking-[0.15em] uppercase"
          style={{ color: "rgba(255,255,255,0.9)" }}
        >
          Purchase one vial,{" "}
        </span>
        <span
          className="text-sm sm:text-base font-semibold tracking-[0.15em] uppercase"
          style={{ color: "rgba(212,175,55,0.95)" }}
        >
          receive a second complimentary
        </span>
        <span
          className="text-xs font-light tracking-wide ml-2"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          — applied automatically
        </span>
      </span>

      {/* Divider */}
      <span style={{ color: "rgba(212,175,55,0.3)" }}>|</span>

      {/* CTA */}
      <a
        href="/products"
        className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors duration-200"
        style={{ color: "rgba(212,175,55,0.85)" }}
      >
        Shop Now →
      </a>

      {/* Subtle shimmer line bottom */}
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)" }}
      />
    </div>
  );
}
