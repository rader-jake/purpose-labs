"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAuthToken, removeAuthToken, getCurrentUser, AuthUser } from "@/lib/auth";

interface Order {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [spinStatus, setSpinStatus] = useState<{ hasSpun: boolean; nextSpin: string | null; prize: string | null; coupon: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const token = getAuthToken();
      if (!token) { router.push("/account/login"); return; }
      const meRes = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      if (!meRes.ok) { router.push("/account/login"); return; }
      const { user: u } = await meRes.json();
      if (!u) { router.push("/account/login"); return; }
      setUser(u);

      // Fetch orders
      try {
        const res = await fetch(
          `https://joshuar120.sg-host.com/wp-json/wc/v3/orders?customer=${u.id}&per_page=5`,
          { headers: { Authorization: "Basic " + btoa("ck_f7138959a5bb8acdcd20841a473028fe1139f86d:cs_fb8754b74f8dd9cd6feec5a6fe50320e2a161a19") } }
        );
        if (res.ok) setOrders(await res.json());
      } catch {}

      // Fetch spin status
      try {
        const res = await fetch("/api/spin", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setSpinStatus(await res.json());
      } catch {}

      setLoading(false);
    }
    init();
  }, [router]);

  function logout() {
    // Nuke cookies every possible way
    const nukeDate = "Thu, 01 Jan 1970 00:00:00 GMT";
    ["pl_auth_token", "pl_auth_name"].forEach(name => {
      document.cookie = `${name}=; expires=${nukeDate}; path=/`;
      document.cookie = `${name}=; expires=${nukeDate}; path=/; domain=${window.location.hostname}`;
      document.cookie = `${name}=; max-age=0; path=/`;
    });
    window.location.replace("/");
  }

  if (loading) return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, Helvetica Neue, sans-serif" }}>
      <p style={{ color: "#1B2A4A" }}>Loading…</p>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#fff", fontFamily: "system-ui, Helvetica Neue, sans-serif", padding: "48px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
          <div>
            <h1 style={{ color: "#1B2A4A", fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
              Welcome, {user?.firstName || "there"} 👋
            </h1>
            <p style={{ color: "#7BAFD4", fontSize: 14, margin: "6px 0 0" }}>{user?.email}</p>
          </div>
          <button onClick={logout} style={{ background: "transparent", border: "1px solid rgba(27,42,74,0.2)", borderRadius: 8, padding: "10px 20px", fontSize: 13, color: "#1B2A4A", cursor: "pointer", fontWeight: 600 }}>
            Logout
          </button>
        </div>

        {/* Spin status */}
        {spinStatus && (
          <div style={{ background: spinStatus.hasSpun ? "#f8f9fa" : "linear-gradient(135deg, #1B2A4A, #2a3d6a)", borderRadius: 16, padding: 24, marginBottom: 32, color: spinStatus.hasSpun ? "#1B2A4A" : "#fff" }}>
            {spinStatus.hasSpun ? (
              <>
                <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700 }}>Your Last Spin</h2>
                <p style={{ margin: 0, fontSize: 14, opacity: 0.7 }}>
                  Prize: <strong>{spinStatus.prize}</strong>
                  {spinStatus.coupon && <> · Code: <code style={{ background: "rgba(27,42,74,0.08)", padding: "2px 6px", borderRadius: 4 }}>{spinStatus.coupon}</code></>}
                </p>
                {spinStatus.nextSpin && (
                  <p style={{ margin: "6px 0 0", fontSize: 13, opacity: 0.5 }}>
                    Next spin available: {new Date(spinStatus.nextSpin).toLocaleDateString()}
                  </p>
                )}
              </>
            ) : (
              <>
                <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700 }}>🎡 You have a spin available!</h2>
                <Link href="/" style={{ display: "inline-block", marginTop: 8, background: "#7BAFD4", color: "#fff", borderRadius: 8, padding: "10px 20px", textDecoration: "none", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em" }}>
                  Spin Now →
                </Link>
              </>
            )}
          </div>
        )}

        {/* Recent orders */}
        <div>
          <h2 style={{ color: "#1B2A4A", fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Recent Orders</h2>
          {orders.length === 0 ? (
            <p style={{ color: "#8A9BB0", fontSize: 14 }}>No orders yet. <Link href="/products" style={{ color: "#7BAFD4", fontWeight: 700, textDecoration: "none" }}>Shop now →</Link></p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {orders.map(o => (
                <div key={o.id} style={{ border: "1px solid rgba(27,42,74,0.1)", borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#1B2A4A", fontSize: 15 }}>Order #{o.number}</div>
                    <div style={{ color: "#8A9BB0", fontSize: 13, marginTop: 2 }}>{new Date(o.date_created).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, color: "#1B2A4A" }}>${o.total}</div>
                    <div style={{ fontSize: 12, color: "#7BAFD4", textTransform: "capitalize", marginTop: 2 }}>{o.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
