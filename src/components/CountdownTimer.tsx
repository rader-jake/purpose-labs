"use client";

import { useEffect, useState } from "react";

// Deadline: Black Friday — November 28, 2026 at 11:59 PM ET
function getDeadline(): Date {
  return new Date("2026-11-28T23:59:00-05:00");
}

export function CountdownTimer({ label = "Offer ends in", dark = false }: { label?: string; dark?: boolean }) {
  const [target] = useState(() => getDeadline());
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    function tick() {
      const diff = Math.max(0, target.getTime() - Date.now());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ d, h, m: Math.floor((diff % 3600000) / 60000), s });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const pad = (n: number) => String(n).padStart(2, "0");

  const units = [
    { val: pad(timeLeft.d ?? 0), unit: "Day" },
    { val: pad(timeLeft.h), unit: "Hr" },
    { val: pad(timeLeft.s), unit: "Sec" },
  ];

  const labelColor = dark ? "rgba(255,255,255,0.5)" : "var(--pl-muted)";
  const digitColor = dark ? "#ffffff" : "var(--pl-navy)";
  const unitColor = dark ? "rgba(255,255,255,0.4)" : "rgba(27,42,74,0.4)";
  const separatorColor = dark ? "rgba(255,255,255,0.25)" : "rgba(27,42,74,0.25)";
  const blockBorder = dark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(27,42,74,0.12)";
  const blockBg = dark ? "rgba(255,255,255,0.08)" : "rgba(27,42,74,0.03)";

  return (
    <div className="flex flex-col items-start gap-2" style={{ fontFamily: "var(--pl-font-body)" }}>
      {/* Label */}
      <span
        className="text-[9px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: labelColor }}
      >
        {label}
      </span>

      {/* Digit blocks */}
      <div className="flex items-center gap-2">
        {units.map(({ val, unit }, i) => (
          <span key={unit} className="flex items-center gap-2">
            {i > 0 && (
              <span
                className="text-base font-light mb-3"
                style={{ color: separatorColor, lineHeight: 1 }}
              >
                ·
              </span>
            )}
            <span
              className="inline-flex flex-col items-center justify-center"
              style={{
                minWidth: 42,
                padding: "8px 10px 6px",
                border: blockBorder,
                borderRadius: 6,
                background: blockBg,
              }}
            >
              <span
                className="tabular-nums"
                style={{
                  color: digitColor,
                  fontSize: 22,
                  fontWeight: 300,
                  letterSpacing: "0.02em",
                  lineHeight: 1,
                  fontFamily: "var(--pl-font-display)",
                }}
              >
                {val}
              </span>
              <span
                className="uppercase"
                style={{
                  color: unitColor,
                  fontSize: 7,
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  marginTop: 4,
                }}
              >
                {unit}
              </span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
