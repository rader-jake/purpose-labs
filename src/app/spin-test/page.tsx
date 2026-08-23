"use client";

import dynamic from "next/dynamic";
import { useState, useRef } from "react";

const SpinWheel = dynamic(() => import("@/components/SpinWheel").then(m => m.SpinWheel), { ssr: false });

export default function SpinTestPage() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0D1B3E 0%, #14274E 60%, #0D1B3E 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--pl-font-body)",
      padding: "40px 20px",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 8, textAlign: "center" }}>
        <span style={{ color: "#fff", fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.5 }}>Purpose Labs</span>
      </div>
      <h1 style={{ color: "#fff", fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 400, textAlign: "center", marginBottom: 8, letterSpacing: "-0.02em" }}>
        Spin to Win
      </h1>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, textAlign: "center", marginBottom: 48, maxWidth: 400 }}>
        One spin per account. Prizes include free products, discounts, and exclusive offers.
      </p>

      <SpinWheel />
    </main>
  );
}
