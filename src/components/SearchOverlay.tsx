"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface SearchResult {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  sale_price: string;
  images: { src: string }[];
}

export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    // Close on Escape
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json();
        setResults(data.products ?? []);
      } catch {}
      setLoading(false);
    }, 300);
  }, [query]);

  const goToSearch = () => {
    if (query.trim()) {
      onClose();
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  const formatPrice = (p: SearchResult) => {
    if (p.sale_price) return `$${parseFloat(p.sale_price).toFixed(2)}`;
    if (p.price) return `$${parseFloat(p.price).toFixed(2)}`;
    return "";
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 70 }}
      onClick={onClose}
    >
      <div
        style={{ width: "100%", maxWidth: 580, margin: "0 20px", borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.4)", background: "#fff" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Input row */}
        <div style={{ display: "flex", alignItems: "center", padding: "4px 4px 4px 16px", borderBottom: results.length > 0 ? "1px solid rgba(27,42,74,0.08)" : "none" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9AAFC0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") goToSearch(); }}
            style={{ flex: 1, padding: "14px 12px", fontSize: 16, border: "none", outline: "none", color: "#1B2A4A", fontFamily: "system-ui, sans-serif", background: "transparent" }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ padding: "8px 12px", background: "none", border: "none", cursor: "pointer", color: "#9AAFC0", fontSize: 18, lineHeight: 1 }}>×</button>
          )}
          <button
            onClick={goToSearch}
            style={{ padding: "10px 16px", background: "#1B2A4A", border: "none", cursor: "pointer", borderRadius: 10, margin: 4, display: "flex", alignItems: "center" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </div>

        {/* Results */}
        {loading && (
          <div style={{ padding: "16px 20px", color: "#9AAFC0", fontSize: 13 }}>Searching...</div>
        )}
        {!loading && results.length > 0 && (
          <div>
            {results.slice(0, 6).map(p => (
              <Link key={p.id} href={`/products/${p.slug}`} onClick={onClose}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", textDecoration: "none", borderBottom: "1px solid rgba(27,42,74,0.06)", transition: "background 0.1s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f7f9fc")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {p.images?.[0]?.src && (
                  <img src={p.images[0].src} alt={p.name} width={40} height={40} style={{ borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#1B2A4A", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                </div>
                <div style={{ color: "#1B2A4A", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{formatPrice(p)}</div>
              </Link>
            ))}
            {results.length > 0 && (
              <button onClick={goToSearch} style={{ width: "100%", padding: "12px", background: "none", border: "none", cursor: "pointer", color: "#7BAFD4", fontSize: 13, fontWeight: 600, letterSpacing: "0.05em" }}>
                See all results for "{query}"
              </button>
            )}
          </div>
        )}
        {!loading && query.trim() && results.length === 0 && (
          <div style={{ padding: "16px 20px", color: "#9AAFC0", fontSize: 13 }}>No products found for "{query}"</div>
        )}
      </div>
    </div>
  );
}
