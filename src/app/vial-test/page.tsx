"use client";

import dynamic from "next/dynamic";

// ssr: false is CRITICAL — Three.js cannot run on the server
const VialViewer = dynamic(
  () => import("@/components/VialViewer").then((m) => m.VialViewer),
  { ssr: false, loading: () => null }
);

export default function VialTestPage() {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        background: "#0D1B3E",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div style={{ width: "100%", height: "100%", maxWidth: 800, maxHeight: 800 }}>
        <VialViewer />
      </div>
    </main>
  );
}
