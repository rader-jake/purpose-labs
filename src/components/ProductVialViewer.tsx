"use client";

import { useEffect, useRef } from "react";

const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: Math.random() * 2 + 1,
  duration: (Math.random() * 3 + 2).toFixed(1),
  opacity: (Math.random() * 0.5 + 0.3).toFixed(2),
  delay: (Math.random() * 4).toFixed(1),
  depth: Math.random() * 0.04 + 0.01,
}));

export function ProductVialViewer() {
  const starsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const starsEl = starsRef.current;
    if (!container || !starsEl) return;

    const moveStars = (dx: number, dy: number) => {
      const rect = container.getBoundingClientRect();
      starsEl.querySelectorAll<HTMLElement>(".pv-star").forEach((star) => {
        const depth = parseFloat(star.dataset.depth || "0.02");
        star.style.transform = `translate(${dx * depth * rect.width}px, ${dy * depth * rect.height}px)`;
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      moveStars(
        (e.clientX - rect.left - rect.width / 2) / rect.width,
        (e.clientY - rect.top - rect.height / 2) / rect.height
      );
    };

    const handleMouseLeave = () => {
      starsEl.querySelectorAll<HTMLElement>(".pv-star").forEach((s) => {
        s.style.transition = "transform 0.6s ease";
        s.style.transform = "translate(0,0)";
      });
    };

    const handleMouseEnter = () => {
      starsEl.querySelectorAll<HTMLElement>(".pv-star").forEach((s) => {
        s.style.transition = "transform 0.05s linear";
      });
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      moveStars(
        Math.max(-0.5, Math.min(0.5, (e.gamma ?? 0) / 40)),
        Math.max(-0.5, Math.min(0.5, (e.beta ?? 0) / 40))
      );
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("deviceorientation", handleOrientation);
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: 480, position: "relative", overflow: "hidden", borderRadius: 16 }}
    >
      <style>{`
        .pv-star {
          position: absolute;
          border-radius: 50%;
          background: white;
          animation: pv-twinkle var(--d, 3s) ease-in-out infinite;
          opacity: 0;
          will-change: transform;
        }
        @keyframes pv-twinkle {
          0%, 100% { opacity: 0; }
          50% { opacity: var(--o, 0.6); }
        }
      `}</style>

      <div ref={starsRef} style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        {STARS.map((s) => (
          <div
            key={s.id}
            className="pv-star"
            data-depth={s.depth}
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              ["--d" as string]: `${s.duration}s`,
              ["--o" as string]: s.opacity,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>

      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        {/* @ts-ignore */}
        <model-viewer
          src="/3d/vial_new.glb"
          camera-controls
          disable-zoom
          camera-orbit="0deg 80deg 18m"
          field-of-view="16deg"
          style={{ width: "100%", height: "100%", background: "transparent" }}
        />
      </div>
    </div>
  );
}
