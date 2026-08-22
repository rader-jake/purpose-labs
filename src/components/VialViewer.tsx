"use client";

import { useEffect } from "react";

export function VialViewer() {
  useEffect(() => {
    // Dynamically load model-viewer web component
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
    document.head.appendChild(script);
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 480, background: "#14274E" }}>
      {/* @ts-ignore */}
      <model-viewer
        src="/3d/vial_new.glb"
        auto-rotate
        auto-rotate-delay="0"
        rotation-per-second="40deg"
        camera-controls
        disable-zoom
        camera-orbit="0deg 80deg 8m"
        style={{ width: "100%", height: "100%", minHeight: "480px", background: "#14274E" }}
      />
    </div>
  );
}
