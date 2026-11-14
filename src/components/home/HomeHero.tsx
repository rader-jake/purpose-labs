"use client";

import Link from "next/link";
import { Reveal } from "./Reveal";

export function HomeHero() {
  return (
    <section
      className="relative overflow-hidden w-full"
      style={{
        background: "#5b9fd4",
        minHeight: "100svh",
        display: "flex",
        alignItems: "stretch",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@900&family=Inter:wght@400;500;600&display=swap');

        #pl-hero-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 80px 60px 0;
          gap: 0;
        }

        #pl-hero-text {
          flex: 0 0 auto;
          max-width: 500px;
          padding-bottom: 80px;
          z-index: 2;
        }

        .pl-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.4);
          border-radius: 100px;
          padding: 7px 16px;
          margin-bottom: 28px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #fff;
        }
        .pl-badge-dot {
          width: 7px; height: 7px;
          background: #fff;
          border-radius: 50%;
          display: inline-block;
          flex-shrink: 0;
        }

        .pl-headline {
          font-family: 'Barlow Condensed', sans-serif !important;
          font-weight: 900;
          font-size: clamp(72px, 9vw, 118px);
          line-height: 0.88;
          letter-spacing: 0.01em;
          text-transform: uppercase;
          color: #fff;
          margin: 0 0 26px;
        }
        .pl-headline .teal {
          color: #0d1b2e;
          display: block;
        }

        .pl-sub {
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 400;
          color: rgba(255,255,255,0.85);
          line-height: 1.7;
          margin: 0 0 36px;
          max-width: 380px;
        }

        .pl-ctas {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 44px;
          align-items: center;
        }
        .pl-cta-dark {
          display: inline-block;
          background: #0d1b2e;
          color: #fff !important;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 16px 36px;
          text-decoration: none;
          border-radius: 3px;
          transition: background 0.2s, transform 0.15s;
        }
        .pl-cta-dark:hover { background: #1a3050; transform: translateY(-1px); }
        .pl-cta-outline {
          display: inline-block;
          background: transparent;
          color: #fff !important;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 15px 36px;
          text-decoration: none;
          border: 1.5px solid rgba(255,255,255,0.6);
          border-radius: 3px;
          transition: border-color 0.2s, background 0.2s;
        }
        .pl-cta-outline:hover { border-color: #fff; background: rgba(255,255,255,0.08); }

        .pl-trust-row {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }
        .pl-trust-item {
          display: flex;
          align-items: center;
          gap: 7px;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.75);
        }
        .pl-trust-icon { flex-shrink: 0; color: rgba(255,255,255,0.9); }

        /* Vials — single big image, bouncy */
        #pl-vials {
          flex: 1;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          align-self: stretch;
          position: relative;
          min-height: 560px;
          padding-bottom: 0;
        }

        #pl-vials-img {
          position: absolute;
          bottom: 0;
          right: -20px;
          width: clamp(360px, 46vw, 620px);
          object-fit: contain;
          filter: drop-shadow(0 40px 80px rgba(0,0,0,0.25));
          animation: hero-bounce 4s ease-in-out infinite;
        }

        @keyframes hero-bounce {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-22px); }
        }

        @media (max-width: 900px) {
          #pl-hero-inner {
            flex-direction: column;
            padding: 50px 24px 0;
            text-align: center;
          }
          #pl-hero-text { max-width: 100%; padding-bottom: 0; }
          .pl-ctas, .pl-trust-row { justify-content: center; }
          .pl-sub { max-width: 100%; }
          #pl-vials {
            width: 100%;
            min-height: 280px;
            margin-top: 10px;
          }
          #pl-vials-img {
            position: relative;
            right: auto;
            bottom: auto;
            width: clamp(280px, 85vw, 420px);
          }
        }
      `}</style>

      <div id="pl-hero-inner">

        {/* TEXT */}
        <div id="pl-hero-text">

          <Reveal delay={80}>
            <div className="pl-badge">
              <span className="pl-badge-dot" />
              3rd-Party Tested · Every Batch
            </div>
          </Reveal>

          <Reveal delay={120}>
            <h1 className="pl-headline">
              Buy One,
              <span className="teal">Get One</span>
              Free
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="pl-sub">
              Premium research peptides. Transparent sourcing. Documented purity. U.S. based.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="pl-ctas">
              <Link href="/products" className="pl-cta-dark">Shop Peptides →</Link>
              <Link href="/quality" className="pl-cta-outline">View COAs</Link>
            </div>
          </Reveal>

          <Reveal delay={240}>
            <div className="pl-trust-row">
              <div className="pl-trust-item">
                <svg className="pl-trust-icon" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                Batch Verified
              </div>
              <div className="pl-trust-item">
                <svg className="pl-trust-icon" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                Secure Checkout
              </div>
              <div className="pl-trust-item">
                <svg className="pl-trust-icon" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8"/>
                </svg>
                Free U.S. Shipping
              </div>
            </div>
          </Reveal>

        </div>

        {/* VIALS — single big bouncy photo */}
        <div id="pl-vials">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            id="pl-vials-img"
            src="/pl-vials-hero.jpg"
            alt="Purpose Labs TB-500, PL-TZ, BPC-157"
            draggable={false}
          />
        </div>

      </div>
    </section>
  );
}
