"use client";

import { useEffect, useRef, useCallback } from "react";

// ── Game constants ────────────────────────────────────────────────────────────
const GRAVITY        = 0.5;
const JUMP_VEL       = -9;
const MAX_FALL       = 12;
const PIPE_W         = 58;
const PIPE_GAP       = 145;
const PIPE_SPEED     = 2.6;
const PIPE_INTERVAL  = 1500;   // ms between pipes
const GROUND_H       = 56;
const BIRD_W         = 38;
const BIRD_H         = 76;
const HIT_W          = 20;     // tight hitbox
const HIT_H          = 60;

type Phase = "ready" | "playing" | "dying" | "dead";
type Pipe  = { x: number; gapY: number; scored: boolean };

export function FlappyVial() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const phaseRef   = useRef<Phase>("ready");
  const animRef    = useRef<number>(0);
  const vialRef    = useRef<HTMLImageElement | null>(null);

  // game state stored in refs so the loop closure stays fresh
  const bird       = useRef({ y: 0, vy: 0 });
  const pipes      = useRef<Pipe[]>([]);
  const scoreRef   = useRef(0);
  const bestRef    = useRef(0);
  const groundX    = useRef(0);
  const lastPipe   = useRef(0);
  const flashRef   = useRef(0);   // white flash opacity on death
  const readyBob   = useRef(0);   // idle bob timer

  // Load vial image
  useEffect(() => {
    const img = new Image();
    img.src = "/hero-bpc157.png";
    img.onload = () => { vialRef.current = img; };
  }, []);

  const flap = useCallback(() => {
    const p = phaseRef.current;
    if (p === "dying") return;
    if (p === "dead") {
      // restart
      phaseRef.current = "ready";
      return;
    }
    if (p === "ready") phaseRef.current = "playing";
    bird.current.vy = JUMP_VEL;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;
    let W = 0, H = 0;

    // ── helpers ──────────────────────────────────────────────────────────────

    function resize() {
      const p = canvas.parentElement;
      if (!p) return;
      W = p.clientWidth;
      H = p.clientHeight;
      canvas.width  = W;
      canvas.height = H;
    }

    function initRound() {
      bird.current  = { y: H * 0.42, vy: 0 };
      pipes.current = [];
      scoreRef.current = 0;
      lastPipe.current  = 0;
      groundX.current   = 0;
      readyBob.current  = 0;
    }

    // ── drawing helpers ───────────────────────────────────────────────────────

    function drawBg() {
      // Deep navy gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H - GROUND_H);
      grad.addColorStop(0,   "#0b1a38");
      grad.addColorStop(0.6, "#14274e");
      grad.addColorStop(1,   "#1a3060");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H - GROUND_H);

      // Stars
      for (let i = 0; i < 55; i++) {
        const sx = (i * 137.508 + 22) % W;
        const sy = (i * 97.3   + 15) % (H - GROUND_H - 40);
        const r  = i % 4 === 0 ? 1.3 : 0.65;
        const op = 0.2 + (i % 6) * 0.08;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${op})`;
        ctx.fill();
      }
    }

    function drawGround() {
      const gy = H - GROUND_H;

      // Ground fill
      ctx.fillStyle = "#1a3a1a";
      ctx.fillRect(0, gy, W, GROUND_H);

      // Dirt strip
      ctx.fillStyle = "#2d5a1e";
      ctx.fillRect(0, gy, W, 14);

      // Scrolling stripe pattern
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      const stripeW = 40;
      const offset  = groundX.current % stripeW;
      for (let x = -stripeW + offset; x < W; x += stripeW) {
        ctx.fillRect(x, gy + 14, stripeW / 2, GROUND_H - 14);
      }

      // Top edge highlight
      ctx.fillStyle = "#3a7a22";
      ctx.fillRect(0, gy, W, 4);
    }

    function drawPipe(p: Pipe) {
      const top    = p.gapY - PIPE_GAP / 2;
      const bottom = p.gapY + PIPE_GAP / 2;
      const capH   = 26, capExtra = 8;

      // Top pipe body
      const tg = ctx.createLinearGradient(p.x, 0, p.x + PIPE_W, 0);
      tg.addColorStop(0,   "#1b4a1b");
      tg.addColorStop(0.4, "#27682a");
      tg.addColorStop(1,   "#1b4a1b");
      ctx.fillStyle = tg;
      ctx.fillRect(p.x, 0, PIPE_W, top);

      // Top pipe cap
      ctx.fillStyle = "#2d7a30";
      ctx.fillRect(p.x - capExtra, top - capH, PIPE_W + capExtra * 2, capH);

      // Bottom pipe body
      ctx.fillStyle = tg;
      ctx.fillRect(p.x, bottom, PIPE_W, H - GROUND_H - bottom);

      // Bottom pipe cap
      ctx.fillStyle = "#2d7a30";
      ctx.fillRect(p.x - capExtra, bottom, PIPE_W + capExtra * 2, capH);

      // Highlight stripe
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(p.x + 6, 0, 8, top - capH);
      ctx.fillRect(p.x + 6, bottom + capH, 8, H - GROUND_H - bottom - capH);
    }

    function drawBird(y: number, vy: number) {
      const x    = W * 0.28;
      const tilt = Math.max(-25, Math.min(40, vy * 3.5));

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((tilt * Math.PI) / 180);

      if (vialRef.current) {
        // Glow
        ctx.shadowColor = "rgba(120,190,255,0.8)";
        ctx.shadowBlur  = 20;
        ctx.drawImage(vialRef.current, -BIRD_W / 2, -BIRD_H / 2, BIRD_W, BIRD_H);
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = "#aaddff";
        ctx.fillRect(-BIRD_W / 2, -BIRD_H / 2, BIRD_W, BIRD_H);
      }

      ctx.restore();
    }

    function drawScore(n: number, x: number, y: number, size = 38) {
      ctx.textAlign    = "center";
      ctx.textBaseline = "top";
      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.font      = `bold ${size}px 'Montserrat', Arial, sans-serif`;
      ctx.fillText(String(n), x + 2, y + 2);
      // White
      ctx.fillStyle = "#ffffff";
      ctx.fillText(String(n), x, y);
    }

    function drawReady() {
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";

      // Panel
      const pw = 200, ph = 80;
      const px = W / 2 - pw / 2, py = H * 0.32 - ph / 2;
      ctx.fillStyle = "rgba(20,39,78,0.85)";
      roundRect(px, py, pw, ph, 12);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
      roundRect(px, py, pw, ph, 12);
      ctx.stroke();

      ctx.fillStyle = "#fff";
      ctx.font      = `bold 18px 'Montserrat', Arial, sans-serif`;
      ctx.fillText("FLAPPY VIAL", W / 2, H * 0.32 - 14);
      ctx.font      = `12px 'Montserrat', Arial, sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.fillText("TAP OR PRESS SPACE", W / 2, H * 0.32 + 14);
    }

    function drawGameOver() {
      // Dim overlay
      ctx.fillStyle = "rgba(10,20,50,0.6)";
      ctx.fillRect(0, 0, W, H);

      const pw = 240, ph = 160;
      const px = W / 2 - pw / 2, py = H / 2 - ph / 2 - 20;

      // Card
      ctx.fillStyle = "rgba(15,30,65,0.95)";
      roundRect(px, py, pw, ph, 16);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1.5;
      roundRect(px, py, pw, ph, 16);
      ctx.stroke();

      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle = "#fff";
      ctx.font      = `bold 22px 'Montserrat', Arial, sans-serif`;
      ctx.fillText("GAME OVER", W / 2, py + 36);

      // Score row
      ctx.font      = `13px 'Montserrat', Arial, sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText("SCORE", W / 2 - 50, py + 76);
      ctx.fillText("BEST",  W / 2 + 50, py + 76);
      ctx.fillStyle = "#fff";
      ctx.font      = `bold 26px 'Montserrat', Arial, sans-serif`;
      ctx.fillText(String(scoreRef.current),  W / 2 - 50, py + 102);
      ctx.fillText(String(bestRef.current),   W / 2 + 50, py + 102);

      // Divider
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(W / 2 - 1, py + 58, 2, 58);

      // Restart hint
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.font      = `11px 'Montserrat', Arial, sans-serif`;
      ctx.fillText("TAP TO PLAY AGAIN", W / 2, py + 140);
    }

    function roundRect(x: number, y: number, w: number, h: number, r: number) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    function hitTest(): boolean {
      const bx = W * 0.28;
      const by = bird.current.y;

      // Ground
      if (by + HIT_H / 2 >= H - GROUND_H) return true;
      // Ceiling
      if (by - HIT_H / 2 <= 0) return true;

      for (const p of pipes.current) {
        if (bx + HIT_W / 2 > p.x + 6 && bx - HIT_W / 2 < p.x + PIPE_W - 6) {
          if (by - HIT_H / 2 < p.gapY - PIPE_GAP / 2 ||
              by + HIT_H / 2 > p.gapY + PIPE_GAP / 2) {
            return true;
          }
        }
      }
      return false;
    }

    // ── main loop ─────────────────────────────────────────────────────────────

    let lastTs = 0;

    function loop(ts: number) {
      animRef.current = requestAnimationFrame(loop);
      const dt = Math.min(ts - lastTs, 50);
      lastTs = ts;

      const phase = phaseRef.current;

      // ── physics ──
      if (phase === "playing") {
        bird.current.vy = Math.min(bird.current.vy + GRAVITY, MAX_FALL);
        bird.current.y += bird.current.vy;

        // Scroll ground
        groundX.current = (groundX.current + PIPE_SPEED) % 40;

        // Spawn pipes
        if (ts - lastPipe.current > PIPE_INTERVAL) {
          pipes.current.push({
            x: W,
            gapY: (H - GROUND_H) * 0.22 + Math.random() * (H - GROUND_H) * 0.56,
            scored: false,
          });
          lastPipe.current = ts;
        }

        // Move pipes + score
        const bx = W * 0.28;
        pipes.current = pipes.current.filter(p => p.x + PIPE_W > -10);
        for (const p of pipes.current) {
          p.x -= PIPE_SPEED;
          if (!p.scored && p.x + PIPE_W < bx) {
            p.scored = true;
            scoreRef.current++;
          }
        }

        // Collision → dying
        if (hitTest()) {
          phaseRef.current = "dying";
          flashRef.current  = 1;
          bestRef.current   = Math.max(bestRef.current, scoreRef.current);
        }
      }

      if (phase === "dying") {
        // Bird falls to ground
        bird.current.vy = Math.min(bird.current.vy + GRAVITY, MAX_FALL);
        bird.current.y += bird.current.vy;
        flashRef.current = Math.max(0, flashRef.current - 0.06);

        if (bird.current.y + BIRD_H / 2 >= H - GROUND_H) {
          bird.current.y  = H - GROUND_H - BIRD_H / 2;
          bird.current.vy = 0;
          phaseRef.current = "dead";
        }
      }

      if (phase === "ready") {
        readyBob.current += 0.05;
        bird.current.y = H * 0.42 + Math.sin(readyBob.current) * 5;
        bird.current.vy = 0;
        initPipeIfNeeded();
      }

      // ── draw ──
      ctx.clearRect(0, 0, W, H);
      drawBg();
      for (const p of pipes.current) drawPipe(p);
      drawGround();
      drawBird(bird.current.y, bird.current.vy);

      // Score
      if (phase === "playing" || phase === "dying") {
        drawScore(scoreRef.current, W / 2, 18);
      }

      // White flash
      if (flashRef.current > 0) {
        ctx.fillStyle = `rgba(255,255,255,${flashRef.current})`;
        ctx.fillRect(0, 0, W, H);
      }

      if (phase === "ready") drawReady();
      if (phase === "dead")  drawGameOver();

      void dt;
    }

    function initPipeIfNeeded() {
      // No pipes during ready state — just clear them
      pipes.current = [];
    }

    // ── init ──────────────────────────────────────────────────────────────────

    resize();
    initRound();
    animRef.current = requestAnimationFrame(loop);

    const onClick = () => flap();
    const onKey   = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        flap();
      }
    };
    const onTouch = (e: TouchEvent) => { e.preventDefault(); flap(); };

    canvas.addEventListener("click",      onClick);
    canvas.addEventListener("touchstart", onTouch, { passive: false });
    window.addEventListener("keydown",    onKey);
    window.addEventListener("resize",     resize);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("click",      onClick);
      canvas.removeEventListener("touchstart", onTouch);
      window.removeEventListener("keydown",    onKey);
      window.removeEventListener("resize",     resize);
    };
  }, [flap]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full cursor-pointer"
      aria-label="Flappy Vial — tap or press space to play"
      style={{ touchAction: "none" }}
    />
  );
}
