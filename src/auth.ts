import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const WC_URL = "https://joshuar120.sg-host.com";
const WC_KEY = "ck_f7138959a5bb8acdcd20841a473028fe1139f86d";
const WC_SECRET = "cs_fb8754b74f8dd9cd6feec5a6fe50320e2a161a19";
const JWT_ENDPOINT = `${WC_URL}/wp-json/jwt-auth/v1/token`;

function wcAuth() {
  return "Basic " + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString("base64");
}

function generatePassword(length = 20) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let pw = "";
  for (let i = 0; i < length; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

async function getOrCreateWCCustomer(email: string, firstName: string, lastName: string) {
  // Check if customer exists
  const searchRes = await fetch(
    `${WC_URL}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}&per_page=1`,
    { headers: { Authorization: wcAuth() } }
  );
  const customers = await searchRes.json();
  if (Array.isArray(customers) && customers.length > 0) {
    return { customer: customers[0], password: null };
  }

  // Create new customer
  const password = generatePassword();
  const createRes = await fetch(`${WC_URL}/wp-json/wc/v3/customers`, {
    method: "POST",
    headers: { Authorization: wcAuth(), "Content-Type": "application/json" },
    body: JSON.stringify({ email, first_name: firstName, last_name: lastName, username: email, password }),
  });
  const customer = await createRes.json();
  return { customer, password };
}

async function getJWTToken(email: string, password: string): Promise<string | null> {
  try {
    const res = await fetch(JWT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
    });
    const data = await res.json();
    return data?.token ?? null;
  } catch {
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
      try {
        const email = user.email!;
        const nameParts = (user.name ?? "").split(" ");
        const firstName = nameParts[0] ?? "";
        const lastName = nameParts.slice(1).join(" ") ?? "";

        const { customer, password } = await getOrCreateWCCustomer(email, firstName, lastName);
        (user as any).wcCustomerId = customer.id;
        (user as any).wcFirstName = customer.first_name || firstName;

        // Get JWT only for newly created users (we have their password)
        // For existing users, the spin API uses NextAuth session directly — no JWT needed
        let jwtToken: string | null = null;
        if (password) {
          jwtToken = await getJWTToken(email, password);
        }
        (user as any).jwtToken = jwtToken;
      } catch (err) {
        console.error("Google signIn WC error:", err);
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.wcCustomerId = (user as any).wcCustomerId;
        token.wcFirstName = (user as any).wcFirstName;
        token.jwtToken = (user as any).jwtToken;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).wcCustomerId = token.wcCustomerId;
      (session as any).wcFirstName = token.wcFirstName;
      (session as any).jwtToken = token.jwtToken;
      return session;
    },
  },
  pages: {
    signIn: "/account/login",
  },
};

export default NextAuth(authOptions);
