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
        BUY 2 + GET 1 FREE
      </span>
      <span className="text-white/60 text-xs font-medium hidden sm:inline">
        — Buy any 2 vials, get a 3rd free at checkout
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
