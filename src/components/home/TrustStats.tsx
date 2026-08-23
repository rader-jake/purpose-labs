"use client";

import { useEffect, useState } from "react";
import { Reveal } from "./Reveal";

export function TrustStats() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const animFrame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(animFrame);
  }, []);

  return (
    <section
      className="border-y bg-[#F1F6F9]"
      style={{
        borderColor: "var(--pl-border)",
        fontFamily: "var(--pl-font-body)"
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 md:py-16">
        <Reveal>
          <div className="grid grid-cols-2 divide-y divide-[rgba(155,164,180,0.15)] md:grid-cols-4 md:divide-y-0 md:divide-x md:divide-[rgba(155,164,180,0.2)]">
            <StatItem
              value={5000}
              suffix="+"
              label="Orders Fulfilled"
              mounted={mounted}
            />
            <div className="pt-0 md:pt-0">
              <StatItem
                value={3000}
                suffix="+"
                label="Researchers Served"
                mounted={mounted}
              />
            </div>
            <div className="pt-8 md:pt-0">
              <StatTextItem
                line1="Veteran"
                line2="Owned & Operated"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function StatItem({
  value,
  suffix,
  label,
  mounted
}: {
  value: number;
  suffix: string;
  label: string;
  mounted: boolean;
}) {
  const [count, setCount] = useState(mounted ? 0 : value);

  useEffect(() => {
    if (!mounted) return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      const animFrame = requestAnimationFrame(() => {
        setCount(value);
      });
      return () => cancelAnimationFrame(animFrame);
    }

    let start = 0;
    const duration = 1200; // ms
    const stepTime = 16; // ~60fps
    const totalSteps = duration / stepTime;
    const increment = value / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, mounted]);

  const formattedCount = count.toLocaleString();

  return (
    <div className="flex flex-col items-center text-center px-4">
      <span
        className="text-4xl font-medium tracking-tight md:text-5xl"
        style={{
          fontFamily: "var(--pl-font-display)",
          color: "var(--pl-navy)"
        }}
      >
        {formattedCount}{suffix}
      </span>
      <span
        className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-center"
        style={{ color: "var(--pl-text-secondary)" }}
      >
        {label}
      </span>
    </div>
  );
}

function StatTextItem({
  line1,
  line2
}: {
  line1: string;
  line2: string;
}) {
  return (
    <div className="flex flex-col items-center text-center px-4">
      <span
        className="text-4xl font-medium tracking-tight md:text-5xl"
        style={{
          fontFamily: "var(--pl-font-display)",
          color: "var(--pl-navy)"
        }}
      >
        {line1}
      </span>
      <span
        className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-center"
        style={{ color: "var(--pl-text-secondary)" }}
      >
        {line2}
      </span>
    </div>
  );
}
