"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
export default function GoogleCallback() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      window.location.href = "/account/login";
      return;
    }
    if (session) {
      const jwt = (session as any).jwtToken;
      const firstName = (session as any).wcFirstName || session.user?.name?.split(" ")[0] || "";
      const maxAge = 7 * 24 * 60 * 60;
      if (jwt) {
        document.cookie = `pl_auth_token=${encodeURIComponent(jwt)}; max-age=${maxAge}; path=/; SameSite=Lax`;
      }
      if (firstName) {
        document.cookie = `pl_auth_name=${encodeURIComponent(firstName)}; max-age=${maxAge}; path=/; SameSite=Lax`;
      }
      // Respect redirect param from login page (e.g. ?redirect=spin)
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      window.location.href = redirect ? (redirect.startsWith("/") ? redirect : `/${redirect}`) : "/account";
    }
  }, [session, status]);

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
      <p style={{ color: "#1B2A4A", fontFamily: "system-ui, sans-serif", fontSize: 16 }}>Signing you in…</p>
    </main>
  );
}
