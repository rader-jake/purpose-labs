"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const GRAVITY = 0.45;
const JUMP_VELOCITY = -8;
const PIPE_WIDTH = 52;
const PIPE_GAP = 160;
const PIPE_SPEED = 2.4;
const PIPE_INTERVAL = 1600; // ms

type GameState = "idle" | "playing" | "dead";

export function FlappyVial() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>("idle");
  const animRef = useRef<number>(0);
  const lastPipeRef = useRef<number>(0);
  const vialImgRef = useRef<HTMLImageElement | null>(null);

  const birdRef = useRef({ y: 0, vy: 0 });
  const pipesRef = useRef<{ x: number; gapY: number }[]>([]);
  const scoreRef = useRef(0);

  const [displayState, setDisplayState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  // Load vial image once
  useEffect(() => {
    const img = new Image();
    img.src = "/hero-bpc157.png";
    img.onload = () => { vialImgRef.current = img; };
  }, []);

  const jump = useCallback(() => {
    if (stateRef.current === "dead") return;
    if (stateRef.current === "idle") {
      stateRef.current = "playing";
      setDisplayState("playing");
    }
    birdRef.current.vy = JUMP_VELOCITY;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      W = parent.clientWidth;
      H = parent.clientHeight;
      canvas!.width = W;
      canvas!.height = H;
      // Reset bird to center on resize
      birdRef.current.y = H / 2;
    }

    function reset() {
      birdRef.current = { y: H / 2, vy: 0 };
      pipesRef.current = [];
      scoreRef.current = 0;
      lastPipeRef.current = 0;
      setScore(0);
      stateRef.current = "idle";
      setDisplayState("idle");
    }

    function drawStars(ctx: CanvasRenderingContext2D) {
      // Static star pattern based on canvas size
      const seed = 42;
      for (let i = 0; i < 60; i++) {
        const sx = ((seed * (i * 7 + 3)) % W + W) % W;
        const sy = ((seed * (i * 13 + 7)) % H + H) % H;
        const r = i % 3 === 0 ? 1.2 : 0.6;
        const op = 0.3 + (i % 5) * 0.1;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${op})`;
        ctx.fill();
      }
    }

    function drawPipe(ctx: CanvasRenderingContext2D, x: number, gapY: number) {
      const top = gapY - PIPE_GAP / 2;
      const bottom = gapY + PIPE_GAP / 2;

      // Top pipe
      ctx.fillStyle = "#1e3a6e";
      ctx.fillRect(x, 0, PIPE_WIDTH, top);
      ctx.fillStyle = "#243f7a";
      ctx.fillRect(x - 4, top - 20, PIPE_WIDTH + 8, 20);

      // Bottom pipe
      ctx.fillStyle = "#1e3a6e";
      ctx.fillRect(x, bottom, PIPE_WIDTH, H - bottom);
      ctx.fillStyle = "#243f7a";
      ctx.fillRect(x - 4, bottom, PIPE_WIDTH + 8, 20);

      // Pipe highlight
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(x + 4, 0, 6, top);
      ctx.fillRect(x + 4, bottom, 6, H - bottom);
    }

    function drawBird(ctx: CanvasRenderingContext2D, y: number, vy: number) {
      const BIRDW = 36, BIRDH = 72;
      const x = W * 0.28;
      const tilt = Math.max(-30, Math.min(30, vy * 3));

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((tilt * Math.PI) / 180);

      if (vialImgRef.current) {
        ctx.drawImage(vialImgRef.current, -BIRDW / 2, -BIRDH / 2, BIRDW, BIRDH);
      } else {
        // Fallback rectangle
        ctx.fillStyle = "#fff";
        ctx.fillRect(-BIRDW / 2, -BIRDH / 2, BIRDW, BIRDH);
      }

      ctx.restore();
    }

    function checkCollision(y: number, pipes: { x: number; gapY: number }[]): boolean {
      const BIRDW = 28, BIRDH = 60;
      const bx = W * 0.28;

      // Floor / ceiling
      if (y - BIRDH / 2 < 0 || y + BIRDH / 2 > H) return true;

      for (const p of pipes) {
        if (
          bx + BIRDW / 2 > p.x + 6 &&
          bx - BIRDW / 2 < p.x + PIPE_WIDTH - 6
        ) {
          if (y - BIRDH / 2 < p.gapY - PIPE_GAP / 2 ||
              y + BIRDH / 2 > p.gapY + PIPE_GAP / 2) {
            return true;
          }
        }
      }
      return false;
    }

    let lastTime = 0;

    function loop(ts: number) {
      animRef.current = requestAnimationFrame(loop);
      const dt = ts - lastTime;
      lastTime = ts;
      void dt;

      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = "#14274E";
      ctx.fillRect(0, 0, W, H);
      drawStars(ctx);

      if (stateRef.current === "playing") {
        // Physics
        birdRef.current.vy += GRAVITY;
        birdRef.current.y += birdRef.current.vy;

        // Spawn pipes
        if (ts - lastPipeRef.current > PIPE_INTERVAL) {
          const gapY = H * 0.2 + Math.random() * H * 0.6;
          pipesRef.current.push({ x: W, gapY });
          lastPipeRef.current = ts;
        }

        // Move pipes + score
        pipesRef.current = pipesRef.current.filter(p => p.x + PIPE_WIDTH > -10);
        for (const p of pipesRef.current) {
          const wasRight = p.x > W * 0.28;
          p.x -= PIPE_SPEED;
          const isLeft = p.x + PIPE_WIDTH < W * 0.28;
          if (wasRight && isLeft) {
            scoreRef.current++;
            setScore(scoreRef.current);
          }
        }

        // Collision
        if (checkCollision(birdRef.current.y, pipesRef.current)) {
          stateRef.current = "dead";
          setDisplayState("dead");
          setBest(b => Math.max(b, scoreRef.current));
        }
      }

      // Draw pipes
      for (const p of pipesRef.current) {
        drawPipe(ctx, p.x, p.gapY);
      }

      // Draw bird
      drawBird(ctx, birdRef.current.y, birdRef.current.vy);

      // Idle screen
      if (stateRef.current === "idle") {
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font = `bold 16px 'Montserrat', sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("TAP TO PLAY", W / 2, H / 2 + 60);
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = `11px 'Montserrat', sans-serif`;
        ctx.fillText("FLAPPY VIAL", W / 2, H / 2 + 82);
      }

      // Score
      if (stateRef.current === "playing") {
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.font = `bold 28px 'Montserrat', sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(String(scoreRef.current), W / 2, 48);
      }

      // Dead screen
      if (stateRef.current === "dead") {
        ctx.fillStyle = "rgba(20,39,78,0.7)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.font = `bold 22px 'Montserrat', sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", W / 2, H / 2 - 30);
        ctx.font = `14px 'Montserrat', sans-serif`;
        ctx.fillText(`Score: ${scoreRef.current}`, W / 2, H / 2);
        ctx.fillText(`Best: ${Math.max(scoreRef.current, best)}`, W / 2, H / 2 + 22);
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.font = `12px 'Montserrat', sans-serif`;
        ctx.fillText("TAP TO RESTART", W / 2, H / 2 + 56);
      }
    }

    resize();
    reset();
    animRef.current = requestAnimationFrame(loop);

    const handleClick = () => {
      if (stateRef.current === "dead") {
        reset();
      } else {
        jump();
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        handleClick();
      }
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
  }, [jump, best]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full cursor-pointer"
      aria-label="Flappy Vial game — tap or press space to play"
      style={{ touchAction: "none" }}
    />
  );
}
