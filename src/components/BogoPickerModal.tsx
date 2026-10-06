"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { BogoProduct } from "@/lib/cart/bogoProducts";

interface BogoPickerModalProps {
  products: BogoProduct[];
  onSelect: (product: BogoProduct) => Promise<void>;
  onClose: () => void;
  isAdding: boolean;
}

export default function BogoPickerModal({
  products,
  onSelect,
  onClose,
  isAdding,
}: BogoPickerModalProps) {
  const [selected, setSelected] = useState<BogoProduct | null>(null);
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleAdd = async () => {
    if (!selected || isAdding) return;
    await onSelect(selected);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!mounted) return null;

  const modal = (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 20,
          maxWidth: 640,
          width: "100%",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid #eee",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#1B2A4A",
                  fontFamily: "var(--font-display, serif)",
                }}
              >
                Choose your BOGO vial
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>
                Select any vial from the same tier — it&apos;s on us.
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 22,
                color: "#888",
                lineHeight: 1,
                padding: "2px 4px",
                marginLeft: 12,
                flexShrink: 0,
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 24px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: 12,
            }}
          >
            {products.map((product) => {
              const isSelected = selected?.id === product.id && selected?.name === product.name;
              return (
                <button
                  key={`${product.id}-${product.name}`}
                  onClick={() => setSelected(product)}
                  style={{
                    background: "white",
                    border: isSelected ? "2px solid #1B2A4A" : "1.5px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 10,
                    cursor: "pointer",
                    textAlign: "left",
                    position: "relative",
                    transition: "border-color 0.15s",
                  }}
                >
                  {/* Checkmark overlay */}
                  {isSelected && (
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "#1B2A4A",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1,
                      }}
                    >
                      <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>✓</span>
                    </div>
                  )}
                  {/* Image */}
                  <div
                    style={{
                      background: "#F8F6F1",
                      borderRadius: 8,
                      height: 80,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 8,
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  </div>
                  {/* Name */}
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#1B2A4A",
                      lineHeight: 1.3,
                      marginBottom: 2,
                    }}
                  >
                    {product.name}
                  </div>
                  {/* Price */}
                  <div style={{ fontSize: 11, color: "#888" }}>${product.price.toFixed(2)}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sticky bottom bar */}
        <div
          style={{
            borderTop: "1px solid #eee",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexShrink: 0,
            background: "white",
          }}
        >
          <div style={{ fontSize: 13, color: "#666", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selected ? (
              <span>
                <span style={{ color: "#888" }}>Selected: </span>
                <span style={{ fontWeight: 600, color: "#1B2A4A" }}>{selected.name}</span>
              </span>
            ) : (
              <span style={{ color: "#aaa" }}>No vial selected</span>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={!selected || isAdding}
            style={{
              background: !selected || isAdding ? "#9aa8bc" : "#1B2A4A",
              color: "white",
              border: "none",
              borderRadius: 10,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 700,
              cursor: !selected || isAdding ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "background 0.15s",
            }}
          >
            {isAdding ? (
              <>
                <span
                  style={{
                    display: "inline-block",
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                Adding…
              </>
            ) : (
              "Add selected vial · $0.00"
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  return createPortal(modal, document.body);
}
