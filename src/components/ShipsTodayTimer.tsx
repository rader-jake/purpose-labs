"use client";

import { useEffect, useState } from "react";

/**
 * Counts down to 4:00 PM ET today.
 * If 4PM has already passed, counts to 4PM tomorrow.
 */
function getNext4PM(): Date {
  const now = new Date();
  const etStr = now.toLocaleString("en-US", { timeZone: "America/New_York" });
  const et = new Date(etStr);

  const offsetMs = now.getTime() - et.getTime();
  const today4PM = new Date(et);
  today4PM.setHours(16, 0, 0, 0);
  const target4PM = new Date(today4PM.getTime() + offsetMs);

  if (now >= target4PM) {
    target4PM.setDate(target4PM.getDate() + 1);
  }

  return target4PM;
}

export function ShipsTodayTimer() {
  const [target] = useState(() => getNext4PM());
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    function tick() {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setExpired(true);
        setTimeLeft({ h: 0, m: 0, s: 0 });
        return;
      }
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const pad = (n: number) => String(n).padStart(2, "0");

  if (expired) {
    return (
      <p
        className="text-xs text-center"
        style={{ color: "var(--pl-muted)", fontFamily: "var(--pl-font-body)" }}
      >
        Order now —{" "}
        <strong style={{ color: "var(--pl-navy)" }}>ships tomorrow</strong>
      </p>
    );
  }

  const units = [
    { val: pad(timeLeft.h), unit: "Hr" },
    { val: pad(timeLeft.m), unit: "Min" },
    { val: pad(timeLeft.s), unit: "Sec" },
  ];

  return (
    <div className="flex flex-col items-center gap-2" style={{ fontFamily: "var(--pl-font-body)" }}>
      {/* Label */}
      <span
        className="text-[9px] font-semibold uppercase tracking-[0.22em]"
        style={{ color: "var(--pl-muted)" }}
      >
        Order now — ships today if ordered in
      </span>

      {/* Digit blocks */}
      <div className="flex items-center gap-2">
        {units.map(({ val, unit }, i) => (
          <span key={unit} className="flex items-center gap-2">
            {i > 0 && (
              <span
                className="text-base font-light mb-3"
                style={{ color: "rgba(27,42,74,0.25)", lineHeight: 1 }}
              >
                ·
              </span>
            )}
            <span
              className="inline-flex flex-col items-center justify-center"
              style={{
                minWidth: 42,
                padding: "8px 10px 6px",
                border: "1px solid rgba(27,42,74,0.12)",
                borderRadius: 6,
                background: "rgba(27,42,74,0.03)",
              }}
            >
              <span
                className="tabular-nums"
                style={{
                  color: "var(--pl-navy)",
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
                  color: "rgba(27,42,74,0.4)",
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
