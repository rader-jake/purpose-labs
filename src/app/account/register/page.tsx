"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setAuthToken } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords don't match"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password, firstName: form.firstName, lastName: form.lastName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed");
      if (data.user?.token) setAuthToken(data.user.token);
      router.push("/account");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, Helvetica Neue, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420, padding: "0 24px" }}>
        <h1 style={{ color: "#1B2A4A", fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>Create Account</h1>
        <p style={{ color: "#7BAFD4", fontSize: 14, marginBottom: 32 }}>Join Purpose Labs today</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>First Name</label>
              <input type="text" required value={form.firstName} onChange={update("firstName")} placeholder="John" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Last Name</label>
              <input type="text" required value={form.lastName} onChange={update("lastName")} placeholder="Doe" style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" required value={form.email} onChange={update("email")} placeholder="you@example.com" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                required value={form.password} onChange={update("password")} placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: 48 }}
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} style={showBtnStyle}>
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Confirm Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                required value={form.confirm} onChange={update("confirm")} placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: 48 }}
              />
            </div>
          </div>

          {error && <p style={{ color: "#c0392b", fontSize: 13, margin: 0 }}>{error}</p>}

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "Creating account…" : "CREATE ACCOUNT"}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: "center", color: "#1B2A4A", fontSize: 14 }}>
          Already have an account?{" "}
          <Link href="/account/login" style={{ color: "#7BAFD4", fontWeight: 700, textDecoration: "none" }}>Login</Link>
        </p>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 700,
  letterSpacing: "0.08em", textTransform: "uppercase", color: "#1B2A4A", marginBottom: 6,
};
const inputStyle: React.CSSProperties = {
  width: "100%", border: "1px solid rgba(27,42,74,0.2)", borderRadius: 8,
  padding: "12px 16px", fontSize: 14, color: "#1B2A4A", outline: "none",
  boxSizing: "border-box", fontFamily: "system-ui, Helvetica Neue, sans-serif",
};
const btnStyle: React.CSSProperties = {
  background: "#1B2A4A", color: "#fff", border: "none", borderRadius: 10,
  padding: "14px 0", fontSize: 14, fontWeight: 700,
  letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", marginTop: 8,
};
const showBtnStyle: React.CSSProperties = {
  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
  background: "none", border: "none", cursor: "pointer",
  color: "rgba(27,42,74,0.45)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", padding: 0,
};
