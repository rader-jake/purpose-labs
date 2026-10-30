"use client";

import { useEffect, useState } from "react";

// Counts down to midnight ET every day — resets automatically
function getMidnightET(): Date {
  const now = new Date();
  // Get current time in ET
  const etNow = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const midnight = new Date(etNow);
  midnight.setHours(24, 0, 0, 0);
  // Diff in ms
  const diffMs = midnight.getTime() - etNow.getTime();
  return new Date(Date.now() + diffMs);
}

export function CountdownTimer({ label = "Offer ends in" }: { label?: string }) {
  const [target] = useState(() => getMidnightET());
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    function tick() {
      const diff = Math.max(0, target.getTime() - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ h, m, s });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-2 flex-wrap" style={{ fontFamily: "var(--pl-font-body)" }}>
      <span className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--pl-muted)" }}>
        {label}
      </span>
      <div className="flex items-center gap-1">
        {[
          { val: pad(timeLeft.h), unit: "hr" },
          { val: pad(timeLeft.m), unit: "min" },
          { val: pad(timeLeft.s), unit: "sec" },
        ].map(({ val, unit }, i) => (
          <span key={unit} className="flex items-center gap-1">
            {i > 0 && <span style={{ color: "var(--pl-muted)", fontSize: 12 }}>:</span>}
            <span
              className="inline-flex flex-col items-center justify-center rounded-md px-2 py-1"
              style={{ background: "var(--pl-navy)", minWidth: 36 }}
            >
              <span className="text-sm font-black tabular-nums" style={{ color: "#fff", lineHeight: 1 }}>{val}</span>
              <span className="text-[8px] font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>{unit}</span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
