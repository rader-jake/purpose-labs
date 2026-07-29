"use client";

// src/components/AgeGate.tsx
//
// Real access gate, not a cosmetic banner: full-screen, traps focus,
// blocks body scroll, and (per the SSR/no-flash note below) is backed
// by a blocking script in layout.tsx's <head> so already-verified
// returning visitors never see it flash on screen.
//
// STORAGE_KEY below must stay in sync with the inline script in
// layout.tsx — that script can't import this constant (it's raw HTML
// text, not a JS module), so it's duplicated there deliberately.

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LogoMark } from "./Logo";

const STORAGE_KEY = "pl_age_verified_until";
const EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function isVerified(): boolean {
  try {
    const until = window.localStorage.getItem(STORAGE_KEY);
    return until !== null && Number(until) > Date.now();
  } catch {
    // Storage unavailable (private browsing, disabled, etc.) — treat as
    // unverified. Safe default: show the gate rather than skip it.
    return false;
  }
}

// No cross-tab reactivity needed — the only thing that changes this
// value is our own "Confirm" click, handled separately below — so the
// subscription itself is a no-op. What useSyncExternalStore is
// actually here for is getServerSnapshot: it's the React-sanctioned way
// to render a value that's necessarily different between server and
// client (the server has no localStorage to check) without a
// hydration-mismatch warning, and without hand-rolling the
// "setState-in-an-effect-on-mount" pattern eslint's
// react-hooks/set-state-in-effect rule (rightly) flags.
function subscribe() {
  return () => {};
}
function getServerSnapshot() {
  return false;
}

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.hasAttribute("disabled"));
}

export function AgeGate() {
  const storedVerified = useSyncExternalStore(subscribe, isVerified, getServerSnapshot);
  // Optimistic local flag for the "just clicked Confirm this session"
  // case — storedVerified won't reflect a same-render localStorage
  // write without a subscribe event, so this covers it directly.
  const [justConfirmed, setJustConfirmed] = useState(false);
  const [declined, setDeclined] = useState(false);
  const verified = storedVerified || justConfirmed;

  const containerRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Body scroll lock while the gate (in either sub-state) is showing.
  useEffect(() => {
    if (verified) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [verified]);

  // Focus management: land on the primary action when the gate first
  // appears, or on the container itself once declined (no buttons left
  // to receive it).
  useEffect(() => {
    if (verified) return;
    if (declined) {
      containerRef.current?.focus();
    } else {
      confirmButtonRef.current?.focus();
    }
  }, [verified, declined]);

  // Focus trap, attached at the document level (not just the
  // container's own onKeyDown) so it still catches Tab even if focus
  // has somehow ended up outside the gate entirely — e.g. right after
  // the declined message replaces the buttons that held focus.
  useEffect(() => {
    if (verified) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const container = containerRef.current;
      if (!container) return;

      const focusable = getFocusable(container);
      const targets = focusable.length > 0 ? focusable : [container];
      const first = targets[0];
      const last = targets[targets.length - 1];
      const active = document.activeElement;
      const activeIsInside = active instanceof Node && container.contains(active);

      if (!activeIsInside) {
        e.preventDefault();
        first.focus();
        return;
      }

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [verified]);

  function handleConfirm() {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now() + EXPIRY_MS));
    } catch {
      // Storage unavailable — gate will just reappear next visit,
      // which is an acceptable degradation, not a broken experience.
    }
    setJustConfirmed(true);
  }

  function handleDecline() {
    setDeclined(true);
  }

  if (verified) return null;

  return (
    <div
      id="age-gate-root"
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-heading"
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex items-center justify-center px-6 py-12"
      style={{
        background:
          "radial-gradient(ellipse 120% 100% at 50% 30%, var(--pl-navy) 0%, var(--pl-navy) 60%, #0f1d3b 100%)",
      }}
    >
      <div className="w-full max-w-md text-center" style={{ fontFamily: "var(--pl-font-body)" }}>
        <div
          className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            backgroundColor: "rgba(241, 246, 249, 0.08)",
            ["--pl-navy" as string]: "var(--pl-ivory)",
          }}
        >
          <LogoMark size={28} />
        </div>

        {!declined ? (
          <>
            <h1
              id="age-gate-heading"
              className="mb-4 text-3xl sm:text-4xl"
              style={{ color: "var(--pl-ivory)", fontFamily: "var(--pl-font-display)", fontWeight: 500 }}
            >
              Age Verification
            </h1>
            <p className="mb-10 text-sm leading-relaxed" style={{ color: "rgba(241, 246, 249, 0.72)" }}>
              Purpose Labs sells research compounds intended for laboratory use
              by qualified professionals. You must be 21 years of age or older
              to enter this site.
            </p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={handleDecline}
                className="flex h-11 items-center justify-center rounded-full border px-8 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-300"
                style={{
                  borderColor: "rgba(241, 246, 249, 0.3)",
                  color: "var(--pl-ivory)",
                  backgroundColor: "transparent",
                }}
              >
                I am under 21
              </button>
              <button
                ref={confirmButtonRef}
                onClick={handleConfirm}
                className="flex h-11 items-center justify-center rounded-full px-8 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-300 hover:opacity-90"
                style={{ backgroundColor: "var(--pl-ivory)", color: "var(--pl-navy)" }}
              >
                I am 21 or older
              </button>
            </div>
            <p
              className="mt-8 text-[10px] uppercase tracking-[0.12em]"
              style={{ color: "rgba(241, 246, 249, 0.4)" }}
            >
              By entering, you agree to our Terms of Service and Privacy Policy.
            </p>
          </>
        ) : (
          <>
            <h1
              id="age-gate-heading"
              className="mb-4 text-3xl sm:text-4xl"
              style={{ color: "var(--pl-ivory)", fontFamily: "var(--pl-font-display)", fontWeight: 500 }}
            >
              Access Restricted
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(241, 246, 249, 0.72)" }}>
              You must be 21 or older to access this site.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
