"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { getAuthToken, removeAuthToken, getCurrentUser, AuthUser } from "@/lib/auth";

interface Order {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
}

interface LoyaltyData {
  balance: number;
  lifetime: number;
  tier: { name: string; emoji: string; bonusPercent: number; freeShipping: boolean };
  nextTier: { name: string; emoji: string; minLifetime: number } | null;
  pointsToNextTier: number;
  redeemableValue: number;
}

export default function AccountPage() {
  const router = useRouter();
  const { data: nextAuthSession, status: nextAuthStatus } = useSession();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [spinStatus, setSpinStatus] = useState<{ hasSpun: boolean; nextSpin: string | null; prize: string | null; coupon: string | null } | null>(null);
  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState(100);
  const [redeemResult, setRedeemResult] = useState<{ couponCode: string; value: number; newBalance: number } | null>(null);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (nextAuthStatus === "loading") return;

    async function init() {
      const token = getAuthToken();

      // Google users: use NextAuth session, no JWT needed
      if (!token && nextAuthSession?.user?.email) {
        const email = nextAuthSession.user.email;
        const name = nextAuthSession.user.name ?? "";
        const firstName = (nextAuthSession as any).wcFirstName || name.split(" ")[0] || "";
        const wcCustomerId = (nextAuthSession as any).wcCustomerId;
        setUser({ id: wcCustomerId ?? 0, email, firstName, lastName: "", displayName: name, token: "" });

        // Fetch spin status via NextAuth session (credentials: include sends cookies)
        try {
          const res = await fetch("/api/spin", { credentials: "include" });
          if (res.ok) setSpinStatus(await res.json());
        } catch {}

        // Fetch loyalty data
        try {
          const res = await fetch("/api/loyalty", { credentials: "include" });
          if (res.ok) setLoyalty(await res.json());
        } catch {}

        // Fetch orders if we have a WC customer ID
        if (wcCustomerId) {
          try {
            const res = await fetch(
              `https://joshuar120.sg-host.com/wp-json/wc/v3/orders?customer=${wcCustomerId}&per_page=5`,
              { headers: { Authorization: "Basic " + btoa("ck_f7138959a5bb8acdcd20841a473028fe1139f86d:cs_fb8754b74f8dd9cd6feec5a6fe50320e2a161a19") } }
            );
            if (res.ok) setOrders(await res.json());
          } catch {}
        }

        setLoading(false);
        return;
      }

      // Regular JWT users
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

      // Fetch loyalty data
      try {
        const res = await fetch("/api/loyalty", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setLoyalty(await res.json());
      } catch {}

      setLoading(false);
    }
    init();
  }, [router, nextAuthSession, nextAuthStatus]);

  function logout() {
    // Clear JWT cookies
    const nukeDate = "Thu, 01 Jan 1970 00:00:00 GMT";
    ["pl_auth_token", "pl_auth_name"].forEach(name => {
      document.cookie = `${name}=; expires=${nukeDate}; path=/`;
      document.cookie = `${name}=; expires=${nukeDate}; path=/; domain=${window.location.hostname}`;
      document.cookie = `${name}=; max-age=0; path=/`;
    });
    // Also sign out of NextAuth (Google session)
    nextAuthSignOut({ callbackUrl: "/" });
  }

  async function handleRedeem() {
    setRedeemLoading(true);
    setRedeemError(null);
    setRedeemResult(null);
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch("/api/loyalty/redeem", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ points: redeemPoints }),
      });
      const data = await res.json();
      if (!res.ok) { setRedeemError(data.error || "Redemption failed"); return; }
      setRedeemResult(data);
      // Update local loyalty state
      setLoyalty(prev => prev ? { ...prev, balance: data.newBalance, redeemableValue: Math.floor(data.newBalance / 100) } : prev);
    } catch {
      setRedeemError("Network error");
    } finally {
      setRedeemLoading(false);
    }
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

        {/* Loyalty section */}
        {loyalty && (
          <div style={{ background: "#f8f9fa", borderRadius: 16, padding: 24, marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <span style={{ background: "#1B2A4A", color: "#fff", borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 700 }}>
                  {loyalty.tier.emoji} {loyalty.tier.name}
                </span>
                {loyalty.tier.freeShipping && (
                  <span style={{ marginLeft: 8, background: "#7BAFD4", color: "#fff", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>
                    Free Shipping
                  </span>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#1B2A4A", lineHeight: 1 }}>
                  {loyalty.balance.toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: "#8A9BB0", marginTop: 2 }}>pts balance</div>
              </div>
            </div>

            {/* Progress bar to next tier */}
            {loyalty.nextTier && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#8A9BB0", marginBottom: 6 }}>
                  <span>Lifetime: {loyalty.lifetime.toLocaleString()} pts</span>
                  <span>{loyalty.nextTier.emoji} {loyalty.nextTier.name} in {loyalty.pointsToNextTier.toLocaleString()} pts</span>
                </div>
                <div style={{ height: 8, background: "rgba(27,42,74,0.1)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    background: "linear-gradient(90deg, #1B2A4A, #7BAFD4)",
                    borderRadius: 4,
                    width: `${Math.min(100, ((loyalty.lifetime) / loyalty.nextTier.minLifetime) * 100)}%`,
                    transition: "width 0.5s ease",
                  }} />
                </div>
              </div>
            )}

            {loyalty.tier.bonusPercent > 0 && (
              <p style={{ fontSize: 12, color: "#7BAFD4", margin: "0 0 16px", fontWeight: 600 }}>
                ✨ {loyalty.tier.bonusPercent}% bonus points on every order
              </p>
            )}

            {/* Redeem button */}
            {loyalty.balance >= 100 && !redeemOpen && !redeemResult && (
              <button
                onClick={() => { setRedeemOpen(true); setRedeemPoints(Math.floor(loyalty.balance / 100) * 100 || 100); }}
                style={{ background: "#1B2A4A", color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
              >
                Redeem Points → ${Math.floor(loyalty.balance / 100)} store credit
              </button>
            )}

            {loyalty.balance < 100 && (
              <p style={{ fontSize: 13, color: "#8A9BB0", margin: 0 }}>
                Earn {100 - loyalty.balance} more points to start redeeming.
              </p>
            )}

            {/* Redeem UI */}
            {redeemOpen && !redeemResult && (
              <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid rgba(27,42,74,0.1)" }}>
                <h3 style={{ margin: "0 0 12px", color: "#1B2A4A", fontSize: 16 }}>Redeem Points</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <label style={{ fontSize: 13, color: "#1B2A4A", fontWeight: 600 }}>Points to redeem:</label>
                  <input
                    type="number"
                    min={100}
                    max={Math.floor(loyalty.balance / 100) * 100}
                    step={100}
                    value={redeemPoints}
                    onChange={e => setRedeemPoints(Math.max(100, Math.round(parseInt(e.target.value) / 100) * 100))}
                    style={{ width: 100, border: "1px solid rgba(27,42,74,0.2)", borderRadius: 8, padding: "8px 12px", fontSize: 14, color: "#1B2A4A" }}
                  />
                  <span style={{ fontSize: 13, color: "#7BAFD4", fontWeight: 600 }}>= ${redeemPoints / 100} credit</span>
                </div>
                {redeemError && <p style={{ color: "#e74c3c", fontSize: 13, margin: "0 0 8px" }}>{redeemError}</p>}
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={handleRedeem}
                    disabled={redeemLoading}
                    style={{ background: "#1B2A4A", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: redeemLoading ? "wait" : "pointer", opacity: redeemLoading ? 0.7 : 1 }}
                  >
                    {redeemLoading ? "Processing…" : "Confirm Redemption"}
                  </button>
                  <button
                    onClick={() => { setRedeemOpen(false); setRedeemError(null); }}
                    style={{ background: "transparent", border: "1px solid rgba(27,42,74,0.2)", borderRadius: 8, padding: "10px 20px", fontSize: 14, color: "#1B2A4A", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Redemption success */}
            {redeemResult && (
              <div style={{ background: "#e8f5e9", borderRadius: 12, padding: 20 }}>
                <h3 style={{ margin: "0 0 8px", color: "#2e7d32", fontSize: 16 }}>🎉 Points Redeemed!</h3>
                <p style={{ margin: "0 0 8px", fontSize: 14, color: "#1B2A4A" }}>
                  Your ${redeemResult.value} store credit coupon:
                </p>
                <code style={{ display: "block", background: "#fff", border: "1px solid #a5d6a7", borderRadius: 8, padding: "10px 16px", fontSize: 18, fontWeight: 800, color: "#1B2A4A", letterSpacing: "0.08em", marginBottom: 12 }}>
                  {redeemResult.couponCode}
                </code>
                <p style={{ fontSize: 13, color: "#8A9BB0", margin: "0 0 12px" }}>New balance: {redeemResult.newBalance.toLocaleString()} pts</p>
                <button
                  onClick={() => { setRedeemResult(null); setRedeemOpen(false); }}
                  style={{ background: "#2e7d32", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        )}

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
