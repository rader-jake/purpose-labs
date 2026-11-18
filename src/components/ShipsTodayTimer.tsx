"use client";

import { useEffect, useState } from "react";

/**
 * Counts down to 4:00 PM ET today.
 * If 4PM has already passed, counts to 4PM tomorrow.
 * Shows "Order now — ships today" urgency message with live timer.
 */
function getNext4PM(): Date {
  const now = new Date();
  // Get current time in ET
  const etStr = now.toLocaleString("en-US", { timeZone: "America/New_York" });
  const et = new Date(etStr);

  const target = new Date(now);
  // Set to 4PM ET today
  const offsetMs = now.getTime() - et.getTime();
  const today4PM = new Date(et);
  today4PM.setHours(16, 0, 0, 0);
  const target4PM = new Date(today4PM.getTime() + offsetMs);

  // If already past 4PM ET, use tomorrow
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
      <p className="text-xs text-center" style={{ color: "var(--pl-muted)", fontFamily: "var(--pl-font-body)" }}>
        Order now —{" "}
        <strong style={{ color: "var(--pl-navy)" }}>ships tomorrow</strong>
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1" style={{ fontFamily: "var(--pl-font-body)" }}>
      <span className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--pl-muted)" }}>
        Order now — ships today if ordered in
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
