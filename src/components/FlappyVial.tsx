"use client";

import { useEffect, useRef, useCallback } from "react";

const GRAVITY = 0.45;
const JUMP_VELOCITY = -8;
const PIPE_WIDTH = 52;
const PIPE_GAP = 160;
const PIPE_SPEED = 2.4;
const PIPE_INTERVAL = 1600;

type GameState = "idle" | "playing" | "dead";
type Pipe = { x: number; gapY: number; scored: boolean };

export function FlappyVial() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>("idle");
  const animRef = useRef<number>(0);
  const lastPipeRef = useRef<number>(0);
  const vialImgRef = useRef<HTMLImageElement | null>(null);
  const birdRef = useRef({ y: 0, vy: 0 });
  const pipesRef = useRef<Pipe[]>([]);
  const scoreRef = useRef(0);
  const bestRef = useRef(0);

  useEffect(() => {
    const img = new Image();
    img.src = "/hero-bpc157.png";
    img.onload = () => { vialImgRef.current = img; };
  }, []);

  const jump = useCallback(() => {
    if (stateRef.current === "dead") return;
    if (stateRef.current === "idle") stateRef.current = "playing";
    birdRef.current.vy = JUMP_VELOCITY;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;

    let W = 0, H = 0;

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      W = parent.clientWidth;
      H = parent.clientHeight;
      canvas!.width = W;
      canvas!.height = H;
      if (stateRef.current !== "playing") birdRef.current.y = H / 2;
    }

    function reset() {
      birdRef.current = { y: H / 2, vy: 0 };
      pipesRef.current = [];
      scoreRef.current = 0;
      lastPipeRef.current = 0;
      stateRef.current = "idle";
    }

    function drawStars() {
      if (!ctx) return;
      for (let i = 0; i < 60; i++) {
        const sx = (i * 137.5 + 50) % W;
        const sy = (i * 97.3 + 30) % H;
        const r = i % 3 === 0 ? 1.2 : 0.6;
        const op = 0.25 + (i % 5) * 0.1;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${op})`;
        ctx.fill();
      }
    }

    function drawPipe(x: number, gapY: number) {
      if (!ctx) return;
      const top = gapY - PIPE_GAP / 2;
      const bottom = gapY + PIPE_GAP / 2;
      ctx.fillStyle = "#1e3a6e";
      ctx.fillRect(x, 0, PIPE_WIDTH, top);
      ctx.fillStyle = "#2a4f8a";
      ctx.fillRect(x - 5, top - 22, PIPE_WIDTH + 10, 22);
      ctx.fillStyle = "#1e3a6e";
      ctx.fillRect(x, bottom, PIPE_WIDTH, H - bottom);
      ctx.fillStyle = "#2a4f8a";
      ctx.fillRect(x - 5, bottom, PIPE_WIDTH + 10, 22);
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(x + 4, 0, 7, top);
      ctx.fillRect(x + 4, bottom + 22, 7, H - bottom);
    }

    function drawBird(y: number, vy: number) {
      const BIRDW = 44, BIRDH = 88;
      const x = W * 0.28;
      const tilt = Math.max(-30, Math.min(35, vy * 3));

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((tilt * Math.PI) / 180);

      if (vialImgRef.current) {
        // Glow effect
        ctx.shadowColor = "rgba(150,200,255,0.7)";
        ctx.shadowBlur = 18;
        ctx.drawImage(vialImgRef.current, -BIRDW / 2, -BIRDH / 2, BIRDW, BIRDH);
        // Second pass for stronger glow
        ctx.shadowBlur = 8;
        ctx.globalAlpha = 0.6;
        ctx.drawImage(vialImgRef.current, -BIRDW / 2, -BIRDH / 2, BIRDW, BIRDH);
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = "#fff";
        ctx.fillRect(-BIRDW / 2, -BIRDH / 2, BIRDW, BIRDH);
      }

      ctx.restore();
    }

    function checkCollision(y: number): boolean {
      const BIRDH = 70;
      const BIRDW = 22; // tight hitbox
      const bx = W * 0.28;
      if (y - BIRDH / 2 < 0 || y + BIRDH / 2 > H) return true;
      for (const p of pipesRef.current) {
        if (bx + BIRDW / 2 > p.x + 5 && bx - BIRDW / 2 < p.x + PIPE_WIDTH - 5) {
          if (y - BIRDH / 2 < p.gapY - PIPE_GAP / 2 || y + BIRDH / 2 > p.gapY + PIPE_GAP / 2) {
            return true;
          }
        }
      }
      return false;
    }

    function drawText(text: string, x: number, y: number, size: number, alpha = 1, bold = true) {
      ctx.font = `${bold ? "bold " : ""}${size}px 'Montserrat', sans-serif`;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.textAlign = "center";
      ctx.fillText(text, x, y);
    }

    let lastTime = 0;

    function loop(ts: number) {
      animRef.current = requestAnimationFrame(loop);
      lastTime = ts;
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = "#14274E";
      ctx.fillRect(0, 0, W, H);
      drawStars();

      if (stateRef.current === "playing") {
        // Physics
        birdRef.current.vy += GRAVITY;
        birdRef.current.y += birdRef.current.vy;

        // Spawn pipes
        if (ts - lastPipeRef.current > PIPE_INTERVAL) {
          pipesRef.current.push({
            x: W,
            gapY: H * 0.22 + Math.random() * H * 0.56,
            scored: false,
          });
          lastPipeRef.current = ts;
        }

        // Move pipes + score using scored flag
        const birdX = W * 0.28;
        pipesRef.current = pipesRef.current.filter(p => p.x + PIPE_WIDTH > -20);
        for (const p of pipesRef.current) {
          p.x -= PIPE_SPEED;
          // Score: pipe has fully passed the bird's x position
          if (!p.scored && p.x + PIPE_WIDTH < birdX) {
            p.scored = true;
            scoreRef.current++;
          }
        }

        if (checkCollision(birdRef.current.y)) {
          stateRef.current = "dead";
          bestRef.current = Math.max(bestRef.current, scoreRef.current);
        }
      }

      // Draw pipes
      for (const p of pipesRef.current) drawPipe(p.x, p.gapY);

      // Draw bird
      drawBird(birdRef.current.y, birdRef.current.vy);

      // Idle
      if (stateRef.current === "idle") {
        drawText("FLAPPY VIAL", W / 2, H / 2 - 10, 20, 0.9);
        drawText("TAP OR PRESS SPACE TO PLAY", W / 2, H / 2 + 20, 11, 0.6, false);
      }

      // Score during play
      if (stateRef.current === "playing") {
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 6;
        drawText(String(scoreRef.current), W / 2, 52, 36);
        ctx.shadowBlur = 0;
      }

      // Game over
      if (stateRef.current === "dead") {
        ctx.fillStyle = "rgba(10,25,60,0.75)";
        ctx.fillRect(0, 0, W, H);
        drawText("GAME OVER", W / 2, H / 2 - 36, 24);
        drawText(`Score: ${scoreRef.current}`, W / 2, H / 2 - 4, 15, 0.85, false);
        drawText(`Best: ${bestRef.current}`, W / 2, H / 2 + 20, 15, 0.85, false);
        drawText("TAP TO RESTART", W / 2, H / 2 + 58, 12, 0.6, false);
      }

      void lastTime;
    }

    resize();
    reset();
    animRef.current = requestAnimationFrame(loop);

    const handleClick = () => {
      if (stateRef.current === "dead") reset();
      else jump();
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") { e.preventDefault(); handleClick(); }
    };

    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("touchstart", (e) => { e.preventDefault(); handleClick(); }, { passive: false });
    window.addEventListener("keydown", handleKey);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("resize", resize);
    };
  }, [jump]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full cursor-pointer"
      aria-label="Flappy Vial — tap or press space to play"
      style={{ touchAction: "none" }}
    />
  );
}
