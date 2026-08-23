"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/auth";

const PRIZES = [
  { label: ["FREE", "VIAL"],    color: "#2000FF", text: "#FFFFFF", icon: "gift", gold: true },
  { label: ["FREE", "SHIPPING"], color: "#8A9BB0", text: "#1B2A4A", icon: "truck" },
  { label: ["10%", "OFF"],      color: "#1B2A4A", text: "#FFFFFF", icon: "tag" },
  { label: ["25%", "OFF"],      color: "#7BAFD4", text: "#1B2A4A", icon: "tag" },
  { label: ["15%", "OFF"],      color: "#1B2A4A", text: "#FFFFFF", icon: "tag" },
  { label: ["SPIN", "AGAIN"],    color: "#8A9BB0", text: "#1B2A4A", icon: "refresh" },
  { label: ["20%", "OFF"],      color: "#1B2A4A", text: "#FFFFFF", icon: "tag" },
  { label: ["FREE", "SHIPPING"], color: "#8A9BB0", text: "#1B2A4A", icon: "truck" },
];

// 8 segments — FREE VIAL:3% | SHIP:2×10% | 10%:25% | 25%:5% | 15%:14% | TRY AGAIN:15% | 20%:8%
const WEIGHTS = [3, 10, 25, 5, 14, 15, 8, 20];
const NUM = PRIZES.length;
const SLICE = (2 * Math.PI) / NUM;

function pickPrize() {
  const total = WEIGHTS.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < WEIGHTS.length; i++) { r -= WEIGHTS[i]; if (r <= 0) return i; }
  return 0;
}

function drawIcon(ctx: CanvasRenderingContext2D, icon: string, x: number, y: number, s: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = s * 0.09;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (icon === "tag") {
    // No icon — label text is enough
  } else if (icon === "truck") {
    const w = s * 0.82, h = s * 0.46;
    const bx = x - w / 2, by = y - h / 2;
    ctx.beginPath();
    ctx.roundRect(bx, by, w * 0.62, h, s * 0.05);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx + w * 0.62, by + h * 0.2);
    ctx.lineTo(bx + w * 0.85, by + h * 0.2);
    ctx.lineTo(bx + w, by + h * 0.55);
    ctx.lineTo(bx + w, by + h);
    ctx.lineTo(bx + w * 0.62, by + h);
    ctx.closePath();
    ctx.stroke();
    [w * 0.18, w * 0.8].forEach(wx => {
      ctx.beginPath();
      ctx.arc(bx + wx, by + h + s * 0.06, s * 0.11, 0, Math.PI * 2);
      ctx.stroke();
    });
  } else if (icon === "gift") {
    const w = s * 0.68, h = s * 0.52;
    const bx = x - w / 2, by = y - h * 0.25;
    ctx.beginPath();
    ctx.roundRect(bx, by, w, h, s * 0.04);
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(bx - s * 0.05, by - h * 0.3, w + s * 0.1, h * 0.32, s * 0.04);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, by - h * 0.3);
    ctx.lineTo(x, by + h);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x - s * 0.14, by - h * 0.14, s * 0.16, Math.PI * 0.1, Math.PI * 1.15);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + s * 0.14, by - h * 0.14, s * 0.16, -Math.PI * 0.15, Math.PI * 0.9);
    ctx.stroke();
  } else if (icon === "refresh") {
    const r = s * 0.4;
    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI * 0.25, Math.PI * 2.05);
    ctx.stroke();
    const ax = x + r * Math.cos(Math.PI * 0.25);
    const ay = y + r * Math.sin(Math.PI * 0.25);
    ctx.beginPath();
    ctx.moveTo(ax - s * 0.2, ay - s * 0.04);
    ctx.lineTo(ax, ay);
    ctx.lineTo(ax - s * 0.04, ay + s * 0.2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawWheel(canvas: HTMLCanvasElement, rotationRad: number, activeIdx: number, phase: string) {
  const size = canvas.width;
  const cx = size / 2, cy = size / 2;
  const outerR = size / 2 - 3;
  const innerR = outerR * 0.32;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);

  for (let i = 0; i < NUM; i++) {
    const start = rotationRad + i * SLICE - Math.PI / 2;
    const end = start + SLICE;
    const isActive = activeIdx === i && phase === "spinning";
    const p = PRIZES[i];
    ctx.beginPath();
    ctx.moveTo(cx + innerR * Math.cos(start), cy + innerR * Math.sin(start));
    ctx.arc(cx, cy, outerR, start, end);
    ctx.arc(cx, cy, innerR, end, start, true);
    ctx.closePath();
    ctx.fillStyle = p.color;
    ctx.fill();
    if (isActive) { ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.fill(); }
    ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1.5; ctx.stroke();
  }

  for (let i = 0; i < NUM; i++) {
    const angle = rotationRad + i * SLICE - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx + innerR * Math.cos(angle), cy + innerR * Math.sin(angle));
    ctx.lineTo(cx + outerR * Math.cos(angle), cy + outerR * Math.sin(angle));
    ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 1.5; ctx.stroke();
  }

  for (let i = 0; i < NUM; i++) {
    const start = rotationRad + i * SLICE - Math.PI / 2;
    const midAngle = start + SLICE / 2;
    const textR = (innerR + outerR) / 2;
    const tx = cx + textR * Math.cos(midAngle);
    const ty = cy + textR * Math.sin(midAngle);
    const p = PRIZES[i];
    const fs = Math.floor(size * 0.042);
    const iconSize = size * 0.075;
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(midAngle + Math.PI / 2);
    const hasIcon = p.icon !== "tag";
    if (hasIcon) drawIcon(ctx, p.icon, 0, -fs * 1.25, iconSize, p.text);
    const textOffset = hasIcon ? 0 : -fs * 0.55;
    ctx.font = `900 ${fs}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = p.text;
    ctx.fillText(p.label[0], 0, textOffset + fs * 0.2);
    ctx.fillText(p.label[1], 0, textOffset + fs * 1.35);
    ctx.restore();
  }

  ctx.beginPath(); ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 3; ctx.stroke();

  ctx.beginPath(); ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0,0,0,0.6)"; ctx.lineWidth = 4; ctx.stroke();
}

export function SpinWheel() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mvRef = useRef<any>(null);
  const [phase, setPhase] = useState<"idle" | "spinning" | "result">("idle");
  const [retryCount, setRetryCount] = useState(0);
  const [prize, setPrize] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [spinMsg, setSpinMsg] = useState<string | null>(null);
  const [realCoupon, setRealCoupon] = useState<string | null>(null);
  const [size, setSize] = useState(320);
  const angleRef = useRef(0);
  const activeRef = useRef(0);
  const phaseRef = useRef("idle");

  useEffect(() => {
    const update = () => setSize(Math.max(240, Math.min(window.innerWidth - 48, 400)));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size; canvas.height = size;
    drawWheel(canvas, angleRef.current, activeRef.current, phaseRef.current);
  }, [size, phase]);

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const mv = mvRef.current;
    if (!mv) return;
    const apply = async () => {
      try {
        const mat = mv.model?.materials?.find((m: any) => m.name === "Label");
        if (mat) {
          const tex = await mv.createTexture("/3d/label-klow.png");
          const pbr = mat.pbrMetallicRoughness;
          if (pbr?.baseColorTexture) pbr.baseColorTexture.setTexture(tex);
        }
      } catch (e) {}
    };
    if (mv.model) apply(); else mv.addEventListener("load", apply, { once: true });
  }, []);

  // Must match PRIZES array indices:
  // 0=FREE VIAL, 1=FREE SHIPPING, 2=10% OFF, 3=25% OFF, 4=15% OFF, 5=SPIN AGAIN, 6=20% OFF, 7=FREE SHIPPING
  const PRIZE_ID_MAP: Record<string, number> = {
    "FREE_PRODUCT":  0,
    "FREE_SHIPPING": 1,
    "10_OFF":        2,
    "25_OFF":        3,
    "15_OFF":        4,
    "TRY_AGAIN":     5,
    "20_OFF":        6,
  };

  const spin = async () => {
    if (phase !== "idle") return;
    setSpinMsg(null); setRealCoupon(null);

    const token = getAuthToken();
    const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    // Check status first
    const statusRes = await fetch("/api/spin", { credentials: "include", headers: authHeaders });
    const status = await statusRes.json();
    if (!status.isLoggedIn) { router.push("/account/login?redirect=spin"); return; }
    if (status.hasSpun) {
      const next = status.nextSpin ? new Date(status.nextSpin) : null;
      const days = next ? Math.ceil((next.getTime() - Date.now()) / 86400000) : 7;
      setSpinMsg(`Come back in ${days} day${days !== 1 ? "s" : ""} for your next spin!`);
      return;
    }

    // POST to spin
    const spinRes = await fetch("/api/spin", { method: "POST", credentials: "include", headers: authHeaders });
    if (!spinRes.ok) {
      const err = await spinRes.json();
      if (err.code === "already_spun" && err.nextSpin) {
        const days = Math.ceil((new Date(err.nextSpin).getTime() - Date.now()) / 86400000);
        setSpinMsg(`Come back in ${days} day${days !== 1 ? "s" : ""} for your next spin!`);
      } else {
        setSpinMsg("Something went wrong. Please try again.");
      }
      return;
    }
    const spinData = await spinRes.json();
    const serverPrizeId = spinData.prize as string;
    const result = PRIZE_ID_MAP[serverPrizeId] ?? pickPrize();
    if (spinData.couponCode) setRealCoupon(spinData.couponCode);

    setPhase("spinning"); phaseRef.current = "spinning"; setPrize(null);
    const fullSpins = 8 + Math.floor(Math.random() * 3);
    const currentNorm = ((-angleRef.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const targetNorm = result * SLICE + SLICE * 0.5;
    const diff = ((currentNorm - targetNorm) + Math.PI * 2) % (Math.PI * 2);
    const targetAngle = angleRef.current + fullSpins * Math.PI * 2 + diff;
    const DURATION = 6000;
    const startAngle = angleRef.current;
    const startTime = performance.now();
    const canvas = canvasRef.current!;
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const angle = startAngle + (targetAngle - startAngle) * eased;
      angleRef.current = angle;
      const pointerInWheel = ((-angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      activeRef.current = Math.floor(pointerInWheel / SLICE) % NUM;
      drawWheel(canvas, angle, activeRef.current, "spinning");
      const mv = mvRef.current;
      if (mv) mv.setAttribute("camera-orbit", `${((angle * 180 / Math.PI) + 180) % 360}deg 90deg 18m`);
      if (progress < 1) requestAnimationFrame(animate);
      else {
        angleRef.current = targetAngle; phaseRef.current = "result";
        drawWheel(canvas, targetAngle, result, "result");
        setPhase("result"); setPrize(result);
        // If TRY_AGAIN and under retry limit, auto-reset after 2s
        if (PRIZES[result].label.join("") === "SPINAGAIN" && retryCount < 2) {
          setTimeout(() => {
            setRetryCount(r => r + 1);
            setPhase("idle");
            phaseRef.current = "idle";
            setPrize(null);
          }, 2000);
        }
      }
    };
    requestAnimationFrame(animate);
  };

  const reset = () => { setPhase("idle"); phaseRef.current = "idle"; setPrize(null); setCopied(false); setSpinMsg(null); setRealCoupon(null); };
  const vialSize = Math.round(size * 0.35);
  const displayCoupon = realCoupon ?? (prize !== null ? `PL-${PRIZES[prize].label.join("").substring(0, 6)}-WIN` : "");

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, width: "100%" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <div style={{ fontSize: "clamp(36px, 11vw, 64px)", fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1, fontFamily: "system-ui, sans-serif" }}>
          <span style={{ color: "#1B2A4A" }}>SPIN TO </span>
          <span style={{ color: "#7BAFD4" }}>WIN</span>
        </div>
        <div style={{ fontSize: 11, letterSpacing: "0.28em", color: "#1B2A4A", textTransform: "uppercase", marginTop: 8, fontWeight: 600 }}>
          Exclusive Rewards. <span style={{ color: "#7BAFD4" }}>Just for You.</span>
        </div>
      </div>

      {/* Pointer */}
      <div style={{ width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "22px solid #1B2A4A", marginBottom: 0, zIndex: 2, position: "relative" }} />

      {/* Wheel + vial */}
      <div style={{ position: "relative", width: size, height: size }}>
        <canvas ref={canvasRef} width={size} height={size} style={{ display: "block", borderRadius: "50%", boxShadow: "0 16px 64px rgba(0,0,0,0.5)" }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: vialSize, height: vialSize,
          borderRadius: "50%", background: "#080f1f",
          overflow: "hidden", zIndex: 10,
          boxShadow: "0 0 0 4px rgba(0,0,0,0.8), 0 0 0 6px rgba(255,255,255,0.06)",
        }}>
          {/* @ts-ignore */}
          <model-viewer ref={mvRef} src="/3d/vial_powder_blue.glb" disable-zoom
            camera-orbit="180deg 90deg 18m" field-of-view="16deg"
            style={{ width: "100%", height: "100%", background: "transparent" }}
          />
          {phase === "result" && prize !== null && (
            <div style={{
              position: "absolute", inset: 0, background: "rgba(8,15,31,0.95)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              animation: "fadeIn 0.4s ease", backdropFilter: "blur(8px)", borderRadius: "50%",
            }}>
              <div style={{ fontSize: vialSize * 0.18, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{PRIZES[prize].label[0]}</div>
              <div style={{ fontSize: vialSize * 0.16, fontWeight: 900, color: "#7eb8d4" }}>{PRIZES[prize].label[1]}</div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed-height action area */}
      <div style={{ height: 64, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8 }}>
        {spinMsg && (
          <div style={{ fontSize: 13, color: "#c0392b", textAlign: "center", maxWidth: 300 }}>{spinMsg}</div>
        )}
        {phase === "idle" && !spinMsg && (
          <button onClick={spin} style={{
            background: "linear-gradient(180deg, #243756, #1B2A4A)", color: "#fff",
            border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10,
            padding: "14px 0", fontSize: 14, fontWeight: 900,
            letterSpacing: "0.3em", textTransform: "uppercase", cursor: "pointer",
            width: Math.min(size * 0.9, 320),
          }}>SPIN</button>
        )}
        {phase === "spinning" && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            {PRIZES[activeRef.current]?.label.join(" ")}
          </div>
        )}
        {phase === "result" && (
          <div style={{ display: "flex", gap: 8 }}>
            {PRIZES[prize!].label.join(" ") !== "SPIN AGAIN" && (
              <button style={{ background: "#fff", color: "#1B2A4A", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>Shop Now</button>
            )}
            <button onClick={reset} style={{ background: "transparent", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 20px", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>Try Again</button>
          </div>
        )}
      </div>

      {phase === "result" && prize !== null && PRIZES[prize].label.join(" ") !== "SPIN AGAIN" && (
        <div style={{
          marginTop: 16,
          background: "linear-gradient(135deg, #1B2A4A, #243756)",
          border: "1px solid rgba(123,175,212,0.35)",
          borderRadius: 14,
          padding: "18px 24px",
          textAlign: "center",
          width: Math.min(size * 0.9, 320),
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}>
          <div style={{ fontSize: 10, letterSpacing: "0.25em", color: "#7BAFD4", textTransform: "uppercase", marginBottom: 6, fontWeight: 700 }}>
            🎉 Your Discount Code
          </div>
          <div
            onClick={() => { navigator.clipboard.writeText(displayCoupon); setCopied(true); }}
            style={{
              fontFamily: "monospace",
              fontSize: 18,
              fontWeight: 900,
              letterSpacing: "0.12em",
              color: "#fff",
              background: "rgba(0,0,0,0.3)",
              borderRadius: 8,
              padding: "10px 16px",
              cursor: "pointer",
              border: "1px dashed rgba(123,175,212,0.5)",
              userSelect: "all",
            }}
          >
            {displayCoupon}
          </div>
          <div style={{ fontSize: 10, color: copied ? "#7BAFD4" : "rgba(255,255,255,0.4)", marginTop: 8, letterSpacing: "0.1em" }}>
            {copied ? "✓ COPIED TO CLIPBOARD" : "TAP TO COPY · EXPIRES IN 48 HOURS"}
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }`}</style>
    </div>
  );
}
