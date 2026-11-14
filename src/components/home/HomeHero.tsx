"use client";

import Link from "next/link";
import { Reveal } from "./Reveal";



export function HomeHero() {
  return (
    <section
      className="relative overflow-hidden w-full"
      style={{
        background: "#f2f4f7",
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
          background: rgba(79,195,161,0.12);
          border: 1px solid rgba(79,195,161,0.4);
          border-radius: 100px;
          padding: 7px 16px;
          margin-bottom: 28px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #2a9d7f;
        }
        .pl-badge-dot {
          width: 7px; height: 7px;
          background: #4fc3a1;
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
          color: #0d1b2e;
          margin: 0 0 26px;
        }
        .pl-headline .teal { color: #4fc3a1; display: block; }

        .pl-sub {
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 400;
          color: #5a6a7a;
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
          color: #0d1b2e !important;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 15px 36px;
          text-decoration: none;
          border: 1.5px solid rgba(13,27,46,0.4);
          border-radius: 3px;
          transition: border-color 0.2s;
        }
        .pl-cta-outline:hover { border-color: #0d1b2e; }

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
          color: #8a9aaa;
        }
        .pl-trust-icon { flex-shrink: 0; color: #4fc3a1; }

        /* Vials */
        #pl-vials {
          flex: 1;
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          align-self: stretch;
          position: relative;
          min-height: 600px;
          overflow: visible;
        }
        .pl-vial {
          position: absolute;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .pl-vial img {
          display: block;
          object-fit: contain;
        }


        @keyframes float-l { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes float-c { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-22px)} }
        @keyframes float-r { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .bogo-vial-l { animation: float-l 4.2s ease-in-out 0s infinite; }
        .bogo-vial-c { animation: float-c 3.8s ease-in-out 0.2s infinite; }
        .bogo-vial-r { animation: float-r 4.5s ease-in-out 0.4s infinite; }

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
            min-height: 240px;
            margin-top: 0;
            justify-content: center;
          }
          #pl-vials-img {
            position: relative;
            right: auto;
            bottom: auto;
            width: clamp(300px, 90vw, 460px);
          }
          /* Mobile order: headline → vials → sub → buttons → trust */
          #pl-hero-inner { display: flex; flex-direction: column; align-items: center; }
          #pl-hero-text { display: contents; }
          .pl-badge-wrap    { order: 0; width: 100%; text-align: center; }
          .pl-headline-wrap { order: 1; width: 100%; text-align: center; }
          #pl-vials         { order: 2; }
          .pl-sub-wrap      { order: 3; width: 100%; text-align: center; }
          .pl-ctas-wrap     { order: 4; width: 100%; }
          .pl-trust-wrap    { order: 5; width: 100%; }
        }
      `}</style>

      <div id="pl-hero-inner">

        {/* TEXT */}
        <div id="pl-hero-text">

          <div className="pl-badge-wrap">
          <Reveal delay={80}>
            <div className="pl-badge">
              <span className="pl-badge-dot" />
              3rd-Party Tested · Every Batch
            </div>
          </Reveal>
          </div>

          <div className="pl-headline-wrap">
          <Reveal delay={120}>
            <h1 className="pl-headline">
              Buy One,
              <span className="teal">Get One</span>
              Free
            </h1>
          </Reveal>
          </div>

          <div className="pl-sub-wrap">
          <Reveal delay={160}>
            <p className="pl-sub">
              Premium research peptides. Transparent sourcing. Documented purity. U.S. based.
            </p>
          </Reveal>
          </div>

          <div className="pl-ctas-wrap">
          <Reveal delay={200}>
            <div className="pl-ctas">
              <Link href="/products" className="pl-cta-dark">Shop Peptides →</Link>
              <Link href="/quality" className="pl-cta-outline">View COAs</Link>
            </div>
          </Reveal>
          </div>

          <div className="pl-trust-wrap">
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

        </div>

        {/* VIALS */}
        <div id="pl-vials">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/pl-vials-hero.png"
            alt="Purpose Labs TB-500, PL-TZ, BPC-157"
            draggable={false}
            className="bogo-vial-c"
            style={{
              position: "absolute",
              bottom: 0,
              right: "-20px",
              width: "clamp(460px, 58vw, 780px)",
              objectFit: "contain",
              filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.12))",
            }}
          />
        </div>

      </div>
    </section>
  );
}
