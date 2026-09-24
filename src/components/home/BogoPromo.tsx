"use client";

/**
 * BOGO promo announcement bar — bold and loud.
 */
export function BogoPromo() {
  return (
    <div
      className="w-full py-3 px-4 flex items-center justify-center gap-3 flex-wrap"
      style={{ background: "#e8a020" }}
    >
      <span className="text-white text-sm sm:text-base font-black uppercase tracking-widest text-center">
        🎁 Buy One, Get One <span className="underline underline-offset-2">FREE</span>!
      </span>
      <span className="text-white/80 text-xs font-medium">
        — Free vial added automatically at checkout
      </span>
      <a
        href="/products"
        className="shrink-0 rounded-full bg-white text-[#e8a020] text-xs font-black uppercase tracking-widest px-4 py-1.5 hover:bg-yellow-50 transition-colors duration-200"
      >
        Shop Now →
      </a>
    </div>
  );
}
