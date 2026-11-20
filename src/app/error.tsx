"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ErrorBoundary]", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0D1B3E",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "system-ui, sans-serif",
        color: "#fff",
      }}
    >
      <div
        style={{
          backgroundColor: "#1B2A4A",
          borderRadius: "1rem",
          padding: "3rem 2.5rem",
          maxWidth: "480px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            marginBottom: "0.75rem",
            letterSpacing: "-0.02em",
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            color: "#94a3b8",
            marginBottom: "2rem",
            lineHeight: 1.6,
          }}
        >
          We hit an unexpected error. It&apos;s not you — try again and it
          should sort itself out.
        </p>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={reset}
            style={{
              backgroundColor: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "0.5rem",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <Link
            href="/"
            style={{
              backgroundColor: "transparent",
              color: "#94a3b8",
              border: "1px solid #334155",
              borderRadius: "0.5rem",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
