/**
 * Purpose Labs Auth Utility
 * JWT + WooCommerce REST API
 */

const WC_BASE = "https://joshuar120.sg-host.com/wp-json/wc/v3";
const JWT_ENDPOINT = "https://joshuar120.sg-host.com/wp-json/jwt-auth/v1/token";
const JWT_VALIDATE = "https://joshuar120.sg-host.com/wp-json/jwt-auth/v1/token/validate";
const WC_KEY = "ck_f7138959a5bb8acdcd20841a473028fe1139f86d";
const WC_SECRET = "cs_fb8754b74f8dd9cd6feec5a6fe50320e2a161a19";
const COOKIE_NAME = "pl_auth_token";

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  token: string;
}

function wcAuth() {
  return "Basic " + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");
}

// ─── Token cookie helpers (client-side) ──────────────────────────────────────

export function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setAuthToken(token: string) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function removeAuthToken() {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// ─── Auth actions ─────────────────────────────────────────────────────────────

export async function loginUser(email: string, password: string): Promise<AuthUser> {
  const res = await fetch(JWT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");

  const token: string = data.token;
  // Decode payload to get user info
  const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());

  // Fetch WC customer by email to get name/ID
  const custRes = await fetch(`${WC_BASE}/customers?email=${encodeURIComponent(email)}&per_page=1`, {
    headers: { Authorization: wcAuth() },
  });
  const customers = await custRes.json();
  const customer = customers[0] || null;

  return {
    id: customer?.id ?? payload.data?.user?.id ?? 0,
    email,
    firstName: customer?.first_name ?? data.user_display_name ?? "",
    lastName: customer?.last_name ?? "",
    displayName: data.user_display_name ?? email,
    token,
  };
}

export async function registerUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<AuthUser> {
  const res = await fetch(`${WC_BASE}/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: wcAuth(),
    },
    body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Registration failed");
  return loginUser(email, password);
}

export async function getCurrentUser(token?: string): Promise<AuthUser | null> {
  const t = token ?? getAuthToken();
  if (!t) return null;
  try {
    const res = await fetch(JWT_VALIDATE, {
      method: "POST",
      headers: { Authorization: `Bearer ${t}` },
    });
    if (!res.ok) return null;
    // Decode payload
    const payload = JSON.parse(Buffer.from(t.split(".")[1], "base64").toString());
    const userLogin: string = payload.data?.user?.user_login ?? "";
    // Fetch WC customer
    const custRes = await fetch(
      `${WC_BASE}/customers?search=${encodeURIComponent(userLogin)}&per_page=1`,
      { headers: { Authorization: wcAuth() } }
    );
    const customers = await custRes.json();
    const c = Array.isArray(customers) ? customers[0] : null;
    if (!c) return null;
    return {
      id: c.id,
      email: c.email,
      firstName: c.first_name,
      lastName: c.last_name,
      displayName: `${c.first_name} ${c.last_name}`.trim() || c.email,
      token: t,
    };
  } catch {
    return null;
  }
}

export async function getUserMeta(userId: number, key: string): Promise<string | null> {
  const res = await fetch(`${WC_BASE}/customers/${userId}`, {
    headers: { Authorization: wcAuth() },
  });
  const data = await res.json();
  if (!res.ok) return null;
  const meta: { key: string; value: string }[] = data.meta_data ?? [];
  return meta.find((m) => m.key === key)?.value ?? null;
}

export async function setUserMeta(userId: number, key: string, value: string): Promise<void> {
  await fetch(`${WC_BASE}/customers/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: wcAuth(),
    },
    body: JSON.stringify({ meta_data: [{ key, value }] }),
  });
}
