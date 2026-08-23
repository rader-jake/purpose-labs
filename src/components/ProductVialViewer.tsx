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

interface ProductVialViewerProps {
  labelSrc?: string;
  modelSrc?: string;
}

export function ProductVialViewer({ labelSrc = "/3d/label-glp3rt.png", modelSrc = "/3d/vial_new.glb" }: ProductVialViewerProps) {
  const starsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const mv = document.getElementById("product-vial-mv") as any;
    if (!mv) return;
    const apply = async () => {
      try {
        const material = mv.model?.materials?.find((m: any) => m.name === "Label");
        if (material && labelSrc) {
          const texture = await mv.createTexture(labelSrc);
          const pbr = material.pbrMetallicRoughness;
          if (pbr?.baseColorTexture) {
            pbr.baseColorTexture.setTexture(texture);
          }
        }
      } catch (e) {
        // texture swap failed silently — vial still renders
      }
    };
    if (mv.model) {
      apply();
    } else {
      mv.addEventListener("load", apply, { once: true });
    }
  }, [labelSrc]);

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
      style={{ width: "100%", height: "min(480px, 55vw)", minHeight: 300, position: "relative", overflow: "hidden", borderRadius: 16 }}
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
          id="product-vial-mv"
          src={modelSrc}
          camera-controls
          disable-zoom
          camera-orbit="180deg 80deg 18m"
          field-of-view="16deg"
          style={{ width: "100%", height: "100%", background: "transparent" }}
        />
      </div>
    </div>
  );
}
