import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CartProvider } from "@/lib/cart/CartContext";
import { AgeGate } from "@/components/AgeGate";
import { DiscountAutoApply } from "@/components/DiscountAutoApply";
import { Suspense } from "react";
import Script from "next/script";
import "./globals.css";

// Prevents a flash of the age gate for already-verified returning
// visitors: this key/logic must stay in sync with AgeGate.tsx's
// STORAGE_KEY. Deliberately a plain blocking <script>, not next/script
// — even next/script's `beforeInteractive` strategy is documented to
// not block first paint (only hydration), which isn't good enough here;
// a real HTML <script> tag executes synchronously during parsing,
// before the body below it paints, so it can add a CSS-hiding class to
// <html> before the SSR'd gate (which always renders open, since the
// server has no localStorage to check) ever becomes visible.
const AGE_GATE_NO_FLASH_SCRIPT = `(function(){try{var u=localStorage.getItem('pl_age_verified_until');if(u&&Number(u)>Date.now()){document.documentElement.classList.add('pl-age-ok');}}catch(e){}})();`;

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Purpose Labs | Research Peptides",
  description: "Research-grade peptides, third-party tested.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${montserrat.variable} h-full antialiased`}
      // The no-flash script below adds a "pl-age-ok" class to this
      // exact element before React hydrates, for already-verified
      // visitors — an intentional, expected mismatch against the
      // server-rendered className, not a bug. suppressHydrationWarning
      // is the React-documented escape hatch for exactly this case.
      suppressHydrationWarning
    >
      <head>
        <style>{`html.pl-age-ok #age-gate-root { display: none; }`}</style>
        <script dangerouslySetInnerHTML={{ __html: AGE_GATE_NO_FLASH_SCRIPT }} />
        {/* Google Tag (gtag.js) — GA4 + Google Ads */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-CEQNESY8XS" />
        <script dangerouslySetInnerHTML={{ __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-CEQNESY8XS');
gtag('config', 'AW-18395672517');
        ` }} />
        {/* TikTok Pixel — D8VHSSJC77UBLFU420R0 */}
        <script dangerouslySetInnerHTML={{ __html: `
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
  ttq.load('D8VHSSJC77UBLFU420R0');
  ttq.page();
}(window, document, 'ttq');
        ` }} />
      </head>
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Header />
          {children}
          <Footer />
          <CartDrawer />
          <Suspense fallback={null}><DiscountAutoApply /></Suspense>
        </CartProvider>
        {/* Layered on top, not wrapping — {children} above must still
            render normally (server-rendered, present in the DOM) for
            SEO. The gate is purely a visual/interactive overlay. */}
        <AgeGate />
      </body>
    </html>
  );
}
