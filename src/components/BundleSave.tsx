"use client";

type BundleSaveProps = {
  pricePerUnit: number;
  quantity: number;
  onSelect: (qty: number) => void;
};

const TIERS = [
  { buy: 1, label: "Buy 1", free: "Get 1 FREE", badge: null },
  { buy: 2, label: "Buy 2", free: "Get 2 FREE", badge: "MOST POPULAR" },
  { buy: 3, label: "Buy 3", free: "Get 3 FREE", badge: null },
  { buy: 4, label: "Buy 4", free: "Get 4 FREE", badge: "BEST VALUE" },
];

function VialIcons({ count }: { count: number }) {
  return (
    <div style={{ display: "flex", gap: 3, justifyContent: "center", marginBottom: 10 }}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="18" height="28" viewBox="0 0 18 28" fill="none">
          <rect x="5" y="0" width="8" height="3" rx="1" fill="#c0cfe8"/>
          <rect x="3" y="3" width="12" height="21" rx="3" fill={i % 2 === 0 ? "#1B2A4A" : "#356ba9"}/>
          <rect x="3" y="17" width="12" height="7" rx="3" fill={i % 2 === 0 ? "#356ba9" : "#a8c4e0"} opacity="0.7"/>
        </svg>
      ))}
    </div>
  );
}

export function BundleSave({ pricePerUnit, quantity, onSelect }: BundleSaveProps) {
  const perVial = (pricePerUnit / 2).toFixed(2);

  return (
    <div style={{
      background: "#f0f4ff",
      border: "1.5px solid #d0d9e8",
      borderRadius: 16,
      padding: "16px 14px",
      marginBottom: 4,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d1b2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13"/>
          <path d="M19 8H5a2 2 0 0 1 0-4h.5"/>
          <path d="M12 4c0-1.1.9-2 2-2s2 .9 2 2-2 4-2 4"/>
          <path d="M12 4c0-1.1-.9-2-2-2s-2 .9-2 2 2 4 2 4"/>
        </svg>
        <span style={{ fontWeight: 800, fontSize: 14, color: "#0d1b2e", letterSpacing: "0.03em", textTransform: "uppercase" }}>
          Bundle & Save
        </span>
      </div>

      {/* Tier cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {TIERS.map((tier) => {
          const selected = quantity === tier.buy;
          return (
            <div key={tier.buy} style={{ position: "relative" }}>
              {/* Badge */}
              {tier.badge && (
                <div style={{
                  position: "absolute",
                  top: -10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: tier.badge === "MOST POPULAR" ? "#6366f1" : "#0d1b2e",
                  color: "#fff",
                  fontSize: 8,
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  padding: "3px 7px",
                  borderRadius: 100,
                  whiteSpace: "nowrap",
                  zIndex: 1,
                }}>
                  {tier.badge}
                </div>
              )}

              <button
                onClick={() => onSelect(tier.buy)}
                style={{
                  width: "100%",
                  background: selected ? "#0d1b2e" : "#fff",
                  border: `2px solid ${selected ? "#0d1b2e" : "#d0d9e8"}`,
                  borderRadius: 12,
                  padding: "12px 6px 10px",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.15s",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <VialIcons count={tier.buy} />
                <p style={{ fontSize: 13, fontWeight: 800, color: selected ? "#fff" : "#0d1b2e", margin: "0 0 4px" }}>
                  {tier.label}
                </p>
                <div style={{
                  background: selected ? "rgba(255,255,255,0.15)" : "#e8f0fe",
                  borderRadius: 100,
                  padding: "2px 8px",
                  marginBottom: 6,
                }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: selected ? "#fff" : "#356ba9", letterSpacing: "0.04em" }}>
                    {tier.free}
                  </span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 900, color: selected ? "#fff" : "#0d1b2e", margin: 0 }}>
                  ${perVial}
                </p>
                <p style={{ fontSize: 9, color: selected ? "rgba(255,255,255,0.6)" : "#9ca3af", margin: "1px 0 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  per vial
                </p>
              </button>
            </div>
          );
        })}
      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: "#9ca3af", marginTop: 12, marginBottom: 0 }}>
        BOGO applied automatically in cart.
      </p>
    </div>
  );
}
