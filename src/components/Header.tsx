"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoMark } from "./Logo";
import { useCart } from "@/lib/cart/CartContext";

const NAV_LINKS = [
  { label: "Quality & COAs", href: "/quality" },
  { label: "About Us", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cart, openDrawer } = useCart();
  const cartCount = cart?.items_count ?? 0;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Announcement bar — TODO: confirm real copy, this is a placeholder */}
      <div
        className="flex h-[34px] items-center justify-center px-4 text-center text-[11px] font-medium tracking-[0.05em]"
        style={{
          backgroundColor: "var(--pl-navy)",
          color: "var(--pl-ivory)",
          fontFamily: "var(--pl-font-body)",
        }}
      >
        Free shipping on orders over $150
      </div>

      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? "shadow-sm backdrop-blur-md" : ""
        }`}
        style={{
          backgroundColor: scrolled
            ? "rgba(241, 246, 249, 0.85)"
            : "var(--pl-ivory)",
          borderBottom: "1px solid var(--pl-border)",
        }}
      >
        <div className="relative mx-auto flex h-[92px] max-w-7xl items-center justify-between px-6 sm:px-10">
          {/* Left: desktop nav */}
          <div className="flex items-center">
            <nav className="hidden items-center gap-8 lg:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group relative text-xs font-medium tracking-[0.03em]"
                  style={{
                    color: "var(--pl-slate)",
                    fontFamily: "var(--pl-font-body)",
                  }}
                >
                  {link.label}
                  <span
                    className="absolute -bottom-1 left-0 h-px w-0 transition-all duration-200 ease-out group-hover:w-full"
                    style={{ backgroundColor: "currentColor" }}
                  />
                </Link>
              ))}
            </nav>

            {/* Mobile hamburger */}
            <button
              className="flex h-10 w-10 items-center justify-center lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <div className="flex flex-col gap-1.5">
                <span
                  className="block h-px w-5 transition-transform duration-200"
                  style={{
                    backgroundColor: "var(--pl-navy)",
                    transform: mobileOpen
                      ? "translateY(3.5px) rotate(45deg)"
                      : "none",
                  }}
                />
                <span
                  className="block h-px w-5 transition-transform duration-200"
                  style={{
                    backgroundColor: "var(--pl-navy)",
                    transform: mobileOpen
                      ? "translateY(-3.5px) rotate(-45deg)"
                      : "none",
                  }}
                />
              </div>
            </button>
          </div>

          {/* Center: logo, absolutely positioned so it stays centered
              regardless of left/right content width */}
          <Link
            href="/"
            className="absolute left-1/2 flex -translate-x-1/2 items-center gap-3"
          >
            <LogoMark />
            <span
              className="text-2xl sm:text-3xl"
              style={{
                color: "var(--pl-navy)",
                fontFamily: "var(--pl-font-display)",
                fontWeight: 500,
              }}
            >
              Purpose Labs
            </span>
          </Link>

          {/* Right: actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="hidden rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors duration-200 sm:inline-block"
              style={{
                backgroundColor: "var(--pl-navy)",
                color: "var(--pl-ivory)",
                fontFamily: "var(--pl-font-body)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--pl-navy-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--pl-navy)";
              }}
            >
              Catalog
            </Link>

            <button
              onClick={openDrawer}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-200"
              style={{ borderColor: "var(--pl-border)" }}
              aria-label="Open cart"
            >
              <CartIcon />
              {cartCount > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-semibold"
                  style={{
                    backgroundColor: "var(--pl-slate)",
                    color: "var(--pl-ivory)",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div
            className="border-t px-6 py-6 lg:hidden"
            style={{
              backgroundColor: "var(--pl-ivory)",
              borderColor: "var(--pl-border)",
            }}
          >
            <nav className="flex flex-col gap-5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium"
                  style={{
                    color: "var(--pl-slate)",
                    fontFamily: "var(--pl-font-body)",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

function CartIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--pl-navy)"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
