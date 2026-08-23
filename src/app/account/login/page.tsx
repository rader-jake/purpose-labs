"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { setAuthToken } from "@/lib/auth";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      setAuthToken(data.user.token);
      // Full reload so header re-mounts and picks up auth cookie
      window.location.href = `/${redirect.replace(/^\//, "")}`;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "flex-start", paddingTop: "80px", justifyContent: "center", fontFamily: "system-ui, Helvetica Neue, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: "0 24px" }}>
        <h1 style={{ color: "#1B2A4A", fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>Sign In</h1>
        <p style={{ color: "#7BAFD4", fontSize: 14, marginBottom: 32 }}>Welcome back to Purpose Labs</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: 48 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "rgba(27,42,74,0.45)", fontSize: 12, fontWeight: 600,
                  letterSpacing: "0.05em", padding: 0,
                }}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {error && <p style={{ color: "#c0392b", fontSize: 13, margin: 0 }}>{error}</p>}

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "Signing in…" : "LOGIN"}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: "center", color: "#1B2A4A", fontSize: 14 }}>
          Don&apos;t have an account?{" "}
          <Link href="/account/register" style={{ color: "#7BAFD4", fontWeight: 700, textDecoration: "none" }}>
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 700,
  letterSpacing: "0.08em", textTransform: "uppercase",
  color: "#1B2A4A", marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%", border: "1px solid rgba(27,42,74,0.2)",
  borderRadius: 8, padding: "12px 16px", fontSize: 14,
  color: "#1B2A4A", outline: "none", boxSizing: "border-box",
  fontFamily: "system-ui, Helvetica Neue, sans-serif",
};

const btnStyle: React.CSSProperties = {
  background: "#1B2A4A", color: "#fff", border: "none",
  borderRadius: 10, padding: "14px 0", fontSize: 14, fontWeight: 700,
  letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", marginTop: 8,
};
