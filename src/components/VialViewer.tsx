"use client";

import { useEffect } from "react";

export function VialViewer() {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
    document.head.appendChild(script);
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 480, background: "#14274E", position: "relative", overflow: "hidden" }}>
      <style>{`
        .vial-stars {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 0;
        }
        .vial-star {
          position: absolute;
          border-radius: 50%;
          background: white;
          animation: vial-twinkle var(--d, 3s) ease-in-out infinite;
          opacity: 0;
        }
        @keyframes vial-twinkle {
          0%, 100% { opacity: 0; }
          50% { opacity: var(--o, 0.6); }
        }
      `}</style>

      {/* Stars layer */}
      <div className="vial-stars">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="vial-star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              ["--d" as string]: `${(Math.random() * 3 + 2).toFixed(1)}s`,
              ["--o" as string]: `${(Math.random() * 0.5 + 0.3).toFixed(2)}`,
              animationDelay: `${(Math.random() * 4).toFixed(1)}s`,
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
