export function TrustBanner() {
  const signals = [
    "≥99% Purity Guaranteed",
    "HPLC + Mass Spec Verified",
    "COA On Every Batch",
    "Independent U.S. Laboratory",
    "Same-Day Fulfillment",
    "FedEx 2Day Shipping",
    "Endotoxin Tested",
    "Sterility Verified",
    "Veteran Owned",
    "Research Use Only",
  ];

  const marqueeContent = [...signals, ...signals].map((s, i) => (
    <span key={i} className="trust-item">
      {s}
      <span className="trust-dot" aria-hidden="true"> · </span>
    </span>
  ));

  return (
    <div
      className="w-full overflow-hidden"
      style={{ background: "#0D1225", padding: "14px 0" }}
      aria-label="Trust signals"
    >
      <style>{`
        @keyframes marquee-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .trust-track {
          display: flex;
          width: max-content;
          animation: marquee-scroll 36s linear infinite;
          white-space: nowrap;
        }
        .trust-track:hover {
          animation-play-state: paused;
        }
        .trust-item {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #ffffff;
          font-variant: small-caps;
        }
        .trust-dot {
          color: rgba(255,255,255,0.35);
        }
      `}</style>
      <div className="trust-track">
        {marqueeContent}
      </div>
    </div>
  );
}
