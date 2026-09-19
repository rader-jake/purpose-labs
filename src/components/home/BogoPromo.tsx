"use client";

import { useEffect } from "react";

/**
 * BOGO promo banner — sits directly below the hero bouncing vials.
 * Auto-applies coupon BOGOFREE to the WooCommerce cart when clicked.
 */
export function BogoPromo() {
  return (
    <div className="w-full bg-[#14274E] py-4 px-4 flex items-center justify-center gap-4 flex-wrap">
      {/* Left badge */}
      <span className="flex items-center gap-2">
        <span className="text-yellow-400 text-lg font-black">★</span>
        <span className="text-white text-sm font-bold uppercase tracking-widest">
          Limited Deal
        </span>
        <span className="text-yellow-400 text-lg font-black">★</span>
      </span>

      {/* Main copy */}
      <span className="text-white text-base sm:text-lg font-extrabold uppercase tracking-wide text-center">
        Buy 1, Get 1{" "}
        <span className="text-yellow-400">FREE</span>
        <span className="text-white/70 text-xs font-normal normal-case tracking-normal ml-2">
          — automatically applied at checkout
        </span>
      </span>

      {/* CTA */}
      <a
        href="https://purposelabs.shop/shop/"
        className="shrink-0 rounded-full bg-yellow-400 hover:bg-yellow-300 text-[#14274E] text-xs font-black uppercase tracking-widest px-5 py-2 transition-colors duration-200"
      >
        Shop Now →
      </a>
    </div>
  );
}
