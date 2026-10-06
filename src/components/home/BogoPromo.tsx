"use client";

export function BogoPromo() {
  return (
    <div
      className="w-full py-3 px-4 flex items-center justify-center gap-3 flex-wrap"
      style={{
        background: "linear-gradient(90deg, #0B1728 0%, #1B2A4A 40%, #2E4A8A 70%, #4A6FBF 100%)",
      }}
    >
      <span className="text-white text-sm sm:text-base font-black uppercase tracking-widest text-center">
        Buy 1 + Get 1 Free
      </span>
      <span className="text-white/50 text-xs font-medium hidden sm:inline" style={{ letterSpacing: "0.06em" }}>
        — Mix &amp; Match Any Vial of Equal or Lesser Value · Limited Time
      </span>
      <a
        href="/products"
        className="shrink-0 rounded-full text-xs font-black uppercase tracking-widest px-4 py-1.5 transition-colors duration-200"
        style={{
          background: "rgba(255,255,255,0.15)",
          color: "#fff",
          border: "1px solid rgba(255,255,255,0.3)",
        }}
      >
        Shop Now →
      </a>
    </div>
  );
}
