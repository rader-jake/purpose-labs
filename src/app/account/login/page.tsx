"use client";

import { useState, FormEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { setAuthToken } from "@/lib/auth";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
  </svg>
);

function LoginForm() {
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    const callbackUrl = redirect && redirect !== "account"
      ? `/account/google-callback?redirect=${encodeURIComponent(redirect)}`
      : "/account/google-callback";
    await signIn("google", { callbackUrl });
  }

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

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            gap: 10, background: "#fff", border: "1px solid rgba(27,42,74,0.25)",
            borderRadius: 10, padding: "13px 0", fontSize: 14, fontWeight: 600,
            color: "#1B2A4A", cursor: "pointer", marginBottom: 20,
            fontFamily: "system-ui, Helvetica Neue, sans-serif",
            boxSizing: "border-box",
          }}
        >
          <GoogleIcon />
          {googleLoading ? "Redirecting…" : "Continue with Google"}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(27,42,74,0.12)" }} />
          <span style={{ color: "rgba(27,42,74,0.4)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em" }}>OR</span>
          <div style={{ flex: 1, height: 1, background: "rgba(27,42,74,0.12)" }} />
        </div>

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
