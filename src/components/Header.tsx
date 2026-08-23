"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { SearchOverlay } from "@/components/SearchOverlay";
import { useCart } from "@/lib/cart/CartContext";
import Image from "next/image";
import { getAuthToken } from "@/lib/auth";

const NAV_LINKS = [
  { label: "Compounds", href: "/products" },
  { label: "COA Database", href: "/quality" },
  { label: "Contact", href: "/contact" },
];

const TICKER_ITEMS = [
  "🔥 30% Off Sitewide — Limited Time Only",
  "🌞 Summer Special — Buy 2 Get 1 Free · Same Item · Auto-Applied at Checkout",
  "Same-Day Shipping on Orders Placed by 2PM EST",
  "Veteran Owned · U.S. Based · Research Use Only",
  "Third-Party Tested — COA Available for Every Batch",
  
  "≥99% Purity · Batch-Verified by Independent Labs",
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authName, setAuthName] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: nextAuthSession } = useSession();
  const { cart, openDrawer } = useCart();
  const cartCount = cart?.items_count ?? 0;

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 8); }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const checkAuth = () => {
    // Google/NextAuth users
    if (nextAuthSession?.user) {
      const name = (nextAuthSession as any).wcFirstName || nextAuthSession.user.name?.split(" ")[0] || nextAuthSession.user.email || "there";
      setAuthName(name);
      return;
    }
    // JWT users
    const token = getAuthToken();
    if (!token) { setAuthName(null); return; }
    const nameCookie = document.cookie.match(/(?:^|; )pl_auth_name=([^;]*)/);
    const cachedName = nameCookie ? decodeURIComponent(nameCookie[1]) : null;
    if (cachedName) { setAuthName(cachedName); return; }
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.user) setAuthName(data.user.firstName || data.user.email); else setAuthName(null); })
      .catch(() => setAuthName(null));
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener("pageshow", checkAuth);
    document.addEventListener("visibilitychange", checkAuth);
    return () => {
      window.removeEventListener("pageshow", checkAuth);
      document.removeEventListener("visibilitychange", checkAuth);
    };
  }, [nextAuthSession]);

  // Duplicate items for seamless loop
  const tickerContent = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <>
      {/* Scrolling ticker bar */}
      <div
        className="overflow-hidden"
        style={{ backgroundColor: "var(--pl-navy)", height: 34 }}
      >
        <style>{`
          @keyframes ticker-scroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .ticker-track {
            display: flex;
            width: max-content;
            animation: ticker-scroll 28s linear infinite;
          }
          .ticker-track:hover { animation-play-state: paused; }
        `}</style>
        <div className="ticker-track h-full items-center flex">
          {tickerContent.map((item, i) => (
            <span
              key={i}
              className="flex items-center whitespace-nowrap"
              style={{
                color: "var(--pl-ivory)",
                fontFamily: "var(--pl-font-body)",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.06em",
                paddingLeft: 40,
                paddingRight: 40,
              }}
            >
              <span style={{ marginRight: 16, opacity: 0.5 }}>✦</span>
              {item}
            </span>
          ))}
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? "shadow-sm backdrop-blur-md" : ""}`}
        style={{
          backgroundColor: scrolled ? "rgba(241, 246, 249, 0.85)" : "var(--pl-ivory)",
          borderBottom: "1px solid var(--pl-border)",
        }}
      >
        <div className="relative mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 sm:px-10">

          {/* Left: desktop nav */}
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative text-xs font-semibold uppercase tracking-[0.1em]"
                style={{ color: "var(--pl-slate)", fontFamily: "var(--pl-font-body)" }}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 transition-all duration-200 ease-out group-hover:w-full" style={{ backgroundColor: "currentColor" }} />
              </Link>
            ))}
          </nav>

          {/* Mobile: hamburger + PL logo on left */}
          <div className="flex items-center gap-2 sm:hidden">
            <button className="flex h-10 w-10 items-center justify-center" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu" aria-expanded={mobileOpen}>
              <div className="flex flex-col gap-1.5">
                <span className="block h-px w-5 transition-transform duration-200" style={{ backgroundColor: "var(--pl-navy)", transform: mobileOpen ? "translateY(3.5px) rotate(45deg)" : "none" }} />
                <span className="block h-px w-5 transition-transform duration-200" style={{ backgroundColor: "var(--pl-navy)", transform: mobileOpen ? "translateY(-3.5px) rotate(-45deg)" : "none" }} />
              </div>
            </button>
            <Link href="/"><img src="/pl-logo-mobile.svg" alt="Purpose Labs" width={36} height={36} /></Link>
          </div>

          {/* Desktop: hamburger only */}
          <button className="hidden sm:flex h-10 w-10 items-center justify-center lg:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu" aria-expanded={mobileOpen}>
            <div className="flex flex-col gap-1.5">
              <span className="block h-px w-5 transition-transform duration-200" style={{ backgroundColor: "var(--pl-navy)", transform: mobileOpen ? "translateY(3.5px) rotate(45deg)" : "none" }} />
              <span className="block h-px w-5 transition-transform duration-200" style={{ backgroundColor: "var(--pl-navy)", transform: mobileOpen ? "translateY(-3.5px) rotate(-45deg)" : "none" }} />
            </div>
          </button>

          {/* Center: logo — desktop only */}
          <Link href="/" className="absolute left-1/2 hidden sm:flex -translate-x-1/2 items-center gap-3">
            <Image src="/purposeLabsLogo.png" alt="Purpose Labs" width={28} height={28} />
            <span className="text-2xl sm:text-3xl" style={{ color: "var(--pl-navy)", fontFamily: "var(--pl-font-display)", fontWeight: 500 }}>Purpose Labs</span>
          </Link>

          {/* Right: search + auth + cart */}
          <div className="flex items-center gap-3">
            <button className="flex h-10 w-10 items-center justify-center" aria-label="Search" onClick={() => setSearchOpen(v => !v)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--pl-navy)" }}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
            {authName ? (
              <Link href="/account" style={{ fontSize: 13, fontWeight: 600, color: "var(--pl-navy)", textDecoration: "none", fontFamily: "var(--pl-font-body)" }}>
                <span className="hidden sm:inline">Hi, {authName}</span>
                <span className="sm:hidden"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></span>
              </Link>
            ) : (
              <Link href="/account/login" style={{ fontSize: 13, fontWeight: 600, color: "var(--pl-slate)", textDecoration: "none", fontFamily: "var(--pl-font-body)" }}>
                <span className="hidden sm:inline">Login / Register</span>
                <span className="sm:hidden"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></span>
              </Link>
            )}
            <button
              onClick={openDrawer}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-200"
              style={{ borderColor: "var(--pl-border)" }}
              aria-label="Open cart"
            >
              <CartIcon />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-semibold" style={{ backgroundColor: "var(--pl-slate)", color: "var(--pl-ivory)" }}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t px-6 py-6 lg:hidden" style={{ backgroundColor: "var(--pl-ivory)", borderColor: "var(--pl-border)" }}>
            <nav className="flex flex-col gap-5">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="text-sm font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--pl-slate)", fontFamily: "var(--pl-font-body)" }}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      {/* Search overlay with live autocomplete */}
    {searchOpen && (
      <SearchOverlay onClose={() => setSearchOpen(false)} />
    )}
    </header>
    </>
  );
}

function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--pl-navy)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
