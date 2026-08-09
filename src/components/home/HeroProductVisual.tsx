"use client";

import { useEffect, useRef, useState } from "react";

type HeroProductVisualProps = {
  imageSrc: string;
  imageAlt: string;
};

const MAX_TILT = 8;

export function HeroProductVisual({ imageSrc, imageAlt }: HeroProductVisualProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });
  const [shine, setShine] = useState({ x: 50, y: 50 });
  const [isActive, setIsActive] = useState(false);
  const [isTouch, setIsTouch] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animFrame = requestAnimationFrame(() => {
      setIsTouch(isTouchDevice);
      setReducedMotion(motionQuery.matches);
    });
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener("change", handleMotionChange);
    return () => {
      cancelAnimationFrame(animFrame);
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  function handleMouseMove(clientX: number, clientY: number) {
    if (isTouch || reducedMotion) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = (clientX - rect.left) / rect.width;
    const relY = (clientY - rect.top) / rect.height;
    setTransform({ rotateX: (0.5 - relY) * 2 * MAX_TILT, rotateY: (relX - 0.5) * 2 * MAX_TILT });
    setShine({ x: relX * 100, y: relY * 100 });
  }

  function reset() {
    setTransform({ rotateX: 0, rotateY: 0 });
    setIsActive(false);
  }

  const shouldAnimate = !reducedMotion;
  const shouldTilt = !isTouch && !reducedMotion && isActive;

  return (
    <div
      ref={containerRef}
      className="relative mx-auto flex items-center justify-center aspect-square w-full select-none cursor-default"
      style={{ perspective: shouldTilt ? "1000px" : undefined, maxWidth: "min(100%, 360px)" }}
      onMouseEnter={() => !isTouch && setIsActive(true)}
      onMouseMove={(e) => handleMouseMove(e.clientX, e.clientY)}
      onMouseLeave={reset}
    >
      <style>{`
        @keyframes hero-float {
          0%,100% { transform: translateY(0px) rotate(-0.5deg); }
          50%      { transform: translateY(-14px) rotate(0.5deg); }
        }
        @keyframes glow-breathe {
          0%,100% { opacity: 0.75; transform: translate(-50%,-50%) scale(1); }
          50%      { opacity: 0.95; transform: translate(-50%,-50%) scale(1.06); }
        }
        .animate-hero-float { animation: hero-float 6s ease-in-out infinite; }
        .animate-glow-breathe { animation: glow-breathe 6s ease-in-out infinite; }
      `}</style>

      <div
        className={`absolute top-1/2 left-1/2 rounded-full pointer-events-none ${shouldAnimate ? "animate-glow-breathe" : ""}`}
        style={{
          width: "140%", height: "140%",
          background: "radial-gradient(circle, rgba(255,255,255,0.98) 0%, rgba(155,164,180,0.18) 40%, transparent 65%)",
          filter: "blur(35px)",
          zIndex: 1,
        }}
      />

      <div
        className={`relative z-10 flex h-full w-full items-center justify-center ${shouldAnimate ? "animate-hero-float" : ""}`}
        style={{ transformStyle: shouldTilt ? "preserve-3d" : undefined }}
      >
        <div
          className="relative flex h-full w-full items-center justify-center transition-transform ease-out"
          style={{
            transformStyle: shouldTilt ? "preserve-3d" : undefined,
            transform: shouldTilt ? `rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)` : "rotateX(0deg) rotateY(0deg)",
            transitionDuration: shouldTilt ? "100ms" : "500ms",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={imageAlt}
            draggable={false}
            className="pointer-events-none max-h-[82%] max-w-[68%] select-none object-contain"
            style={{
              filter: "drop-shadow(0 15px 30px rgba(20,39,78,0.12))",
              transform: shouldTilt ? "translateZ(30px)" : undefined,
            }}
          />
          {shouldTilt && (
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[82%] max-h-[82%] w-[68%] max-w-[68%] -translate-x-1/2 -translate-y-1/2"
              style={{
                background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 45%)`,
                mixBlendMode: "soft-light",
                zIndex: 2,
                transform: "translateZ(31px)",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
