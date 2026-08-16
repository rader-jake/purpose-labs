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

const STORAGE_KEY = "pl_age_verified_until";
const EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function isVerified(): boolean {
  try {
    const until = window.localStorage.getItem(STORAGE_KEY);
    return until !== null && Number(until) > Date.now();
  } catch {
    return false;
  }
}

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

// Floating vial positions — purely decorative
const VIALS = [
  { top: "8%",  left: "6%",  rotate: "-20deg", scale: 0.85 },
  { top: "18%", left: "82%", rotate: "15deg",  scale: 0.75 },
  { top: "55%", left: "4%",  rotate: "10deg",  scale: 0.9  },
  { top: "70%", left: "88%", rotate: "-12deg", scale: 0.8  },
  { top: "82%", left: "18%", rotate: "25deg",  scale: 0.7  },
  { top: "40%", left: "90%", rotate: "-8deg",  scale: 0.65 },
];

function VialSVG({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      width="48"
      height="80"
      viewBox="0 0 48 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      aria-hidden="true"
    >
      <rect x="16" y="0" width="16" height="8" rx="3" fill="rgba(100,140,200,0.25)" />
      <rect x="12" y="8" width="24" height="4" rx="2" fill="rgba(100,140,200,0.3)" />
      <rect x="10" y="12" width="28" height="52" rx="14" fill="rgba(180,210,240,0.35)" stroke="rgba(150,190,230,0.5)" strokeWidth="1.5" />
      <rect x="14" y="18" width="20" height="28" rx="10" fill="rgba(120,180,230,0.25)" />
      <ellipse cx="24" cy="64" rx="8" ry="4" fill="rgba(150,200,240,0.2)" />
    </svg>
  );
}

export function AgeGate() {
  const storedVerified = useSyncExternalStore(subscribe, isVerified, getServerSnapshot);
  const [justConfirmed, setJustConfirmed] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [ageChecked, setAgeChecked] = useState(false);
  const [researcherChecked, setResearcherChecked] = useState(false);
  const verified = storedVerified || justConfirmed;

  const containerRef = useRef<HTMLDivElement>(null);
  const enterButtonRef = useRef<HTMLButtonElement>(null);

  const canEnter = ageChecked && researcherChecked;

  useEffect(() => {
    if (verified) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [verified]);

  useEffect(() => {
    if (verified) return;
    if (!declined) {
      enterButtonRef.current?.focus();
    } else {
      containerRef.current?.focus();
    }
  }, [verified, declined]);

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
      if (!activeIsInside) { e.preventDefault(); first.focus(); return; }
      if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [verified]);

  function handleConfirm() {
    if (!canEnter) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now() + EXPIRY_MS));
    } catch { /* storage unavailable */ }
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
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6 py-12"
      style={{ background: "linear-gradient(135deg, #c8d8f0 0%, #dce8f5 40%, #bdd0eb 100%)" }}
    >
      {/* Floating vials */}
      {VIALS.map((v, i) => (
        <div
          key={i}
          className="pointer-events-none absolute"
          style={{ top: v.top, left: v.left, transform: `rotate(${v.rotate}) scale(${v.scale})`, opacity: 0.7 }}
        >
          <VialSVG />
        </div>
      ))}

      {/* Brand name */}
      <p
        className="mb-6 text-sm font-semibold uppercase tracking-[0.3em]"
        style={{ color: "rgba(30, 60, 110, 0.6)", fontFamily: "var(--pl-font-body)" }}
      >
        Purpose Labs
      </p>

      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-2xl p-8 shadow-xl"
        style={{ backgroundColor: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)" }}
      >
        {!declined ? (
          <>
            <h1
              id="age-gate-heading"
              className="mb-3 text-2xl font-bold"
              style={{ color: "#1a2e50", fontFamily: "var(--pl-font-body)" }}
            >
              Researcher{" "}
              <span style={{ color: "#4a7fd4" }}>Verification</span>
            </h1>
            <p className="mb-6 text-sm leading-relaxed" style={{ color: "#4a5568" }}>
              Purpose Labs sells research peptides exclusively to qualified
              researchers and laboratories for in vitro and laboratory use.
              Please confirm before continuing.
            </p>

            {/* Checkbox 1 */}
            <label
              className="mb-3 flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors"
              style={{
                borderColor: ageChecked ? "#4a7fd4" : "#e2e8f0",
                backgroundColor: ageChecked ? "rgba(74,127,212,0.06)" : "rgba(248,250,252,0.8)",
              }}
            >
              <input
                type="checkbox"
                checked={ageChecked}
                onChange={(e) => setAgeChecked(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-blue-500"
              />
              <span className="text-sm" style={{ color: "#2d3748" }}>
                I am at least <strong>21 years of age</strong>.
              </span>
            </label>

            {/* Checkbox 2 */}
            <label
              className="mb-6 flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors"
              style={{
                borderColor: researcherChecked ? "#4a7fd4" : "#e2e8f0",
                backgroundColor: researcherChecked ? "rgba(74,127,212,0.06)" : "rgba(248,250,252,0.8)",
              }}
            >
              <input
                type="checkbox"
                checked={researcherChecked}
                onChange={(e) => setResearcherChecked(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-blue-500"
              />
              <span className="text-sm leading-relaxed" style={{ color: "#2d3748" }}>
                I confirm I am a <strong>qualified researcher</strong> purchasing for{" "}
                <strong>in vitro / laboratory research</strong> only — not for human or
                veterinary use.
              </span>
            </label>

            {/* Enter button */}
            <button
              ref={enterButtonRef}
              onClick={handleConfirm}
              disabled={!canEnter}
              className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition-all duration-200"
              style={{
                backgroundColor: canEnter ? "#4a7fd4" : "#e2e8f0",
                color: canEnter ? "#ffffff" : "#a0aec0",
                cursor: canEnter ? "pointer" : "not-allowed",
              }}
            >
              Enter Purpose Labs →
            </button>

            {/* Fine print */}
            <p className="mt-5 text-center text-[11px] leading-relaxed" style={{ color: "#718096" }}>
              By proceeding you affirm the statements above are true. Products are not for
              human or veterinary use, not for use in diagnostic procedures, and have not
              been evaluated by the U.S. Food and Drug Administration.
            </p>
          </>
        ) : (
          <>
            <h1
              id="age-gate-heading"
              className="mb-4 text-2xl font-bold"
              style={{ color: "#1a2e50", fontFamily: "var(--pl-font-body)" }}
            >
              Access Restricted
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "#4a5568" }}>
              You must be 21 or older and a qualified researcher to access this site.
            </p>
          </>
        )}
      </div>

      {/* Exit link */}
      {!declined && (
        <p className="mt-5 text-sm" style={{ color: "rgba(30,60,110,0.6)" }}>
          Not a researcher?{" "}
          <button
            onClick={handleDecline}
            className="underline transition-colors hover:opacity-80"
            style={{ color: "#4a7fd4", background: "none", border: "none", cursor: "pointer" }}
          >
            Exit
          </button>
        </p>
      )}
    </div>
  );
}
