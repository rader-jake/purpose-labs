"use client";

import { useEffect, useRef } from "react";

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: Math.random() * 2 + 1,
  duration: (Math.random() * 3 + 2).toFixed(1),
  opacity: (Math.random() * 0.5 + 0.3).toFixed(2),
  delay: (Math.random() * 4).toFixed(1),
  depth: Math.random() * 0.04 + 0.01, // parallax strength per star
}));

export function VialViewer() {
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

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;  // -0.5 to 0.5
      const dy = (e.clientY - cy) / rect.height;

      // Move each star individually based on its depth
      const starEls = starsEl.querySelectorAll<HTMLElement>(".vial-star");
      starEls.forEach((star) => {
        const depth = parseFloat(star.dataset.depth || "0.02");
        const moveX = dx * depth * rect.width;
        const moveY = dy * depth * rect.height;
        star.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    };

    const handleMouseLeave = () => {
      const starEls = starsEl.querySelectorAll<HTMLElement>(".vial-star");
      starEls.forEach((star) => {
        star.style.transition = "transform 0.6s ease";
        star.style.transform = "translate(0, 0)";
      });
    };

    const handleMouseEnter = () => {
      const starEls = starsEl.querySelectorAll<HTMLElement>(".vial-star");
      starEls.forEach((star) => {
        star.style.transition = "transform 0.05s linear";
      });
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("mouseenter", handleMouseEnter);
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", minHeight: 480, background: "#14274E", position: "relative", overflow: "hidden" }}
    >
      <style>{`
        .vial-star {
          position: absolute;
          border-radius: 50%;
          background: white;
          animation: vial-twinkle var(--d, 3s) ease-in-out infinite;
          opacity: 0;
          will-change: transform;
        }
        @keyframes vial-twinkle {
          0%, 100% { opacity: 0; }
          50% { opacity: var(--o, 0.6); }
        }
      `}</style>

      {/* Stars layer */}
      <div ref={starsRef} style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
        {STARS.map((s) => (
          <div
            key={s.id}
            className="vial-star"
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

      {/* 3D Vial */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        {/* @ts-ignore */}
        <model-viewer
          src="/3d/vial_new.glb"
          auto-rotate
          auto-rotate-delay="0"
          rotation-per-second="80deg"
          camera-controls
          disable-zoom
          camera-orbit="0deg 80deg 8m"
          style={{ width: "100%", height: "100%", minHeight: "480px", background: "transparent" }}
        />
      </div>
    </div>
  );
}
