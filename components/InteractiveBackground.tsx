"use client";

import { useEffect, useState, useRef } from "react";

export function InteractiveBackground() {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const targetPos = useRef({ x: -1000, y: -1000 });
  const currentPos = useRef({ x: -1000, y: -1000 });
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        targetPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    // Smooth RAF animation loop for cursor spotlight
    const updateLoop = () => {
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.08;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.08;

      setMousePos({
        x: Math.round(currentPos.current.x),
        y: Math.round(currentPos.current.y),
      });

      animFrameId.current = requestAnimationFrame(updateLoop);
    };

    animFrameId.current = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  return (
    <div 
      aria-hidden="true" 
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
    >
      {/* 1. Dynamic Cursor Spotlight (Follows mouse smoothly) */}
      <div
        className="absolute inset-0 transition-opacity duration-700 opacity-60 dark:opacity-80"
        style={{
          background: `radial-gradient(700px circle at ${mousePos.x}px ${mousePos.y}px, rgba(200, 166, 94, 0.12), rgba(13, 32, 64, 0.05) 40%, transparent 80%)`,
        }}
      />

      {/* 2. Floating Aurora Mesh Orbs (Slow, majestic, pure CSS GPU transforms) */}
      {/* Orb A: Royal Gold / Amber (Top Right) */}
      <div 
        className="aurora-orb-1 absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-[#C8A65E]/20 via-[#E5C178]/10 to-transparent blur-3xl dark:from-[#C8A65E]/15 dark:via-amber-500/10"
      />

      {/* Orb B: Royal Navy / Indigo (Bottom Left) */}
      <div 
        className="aurora-orb-2 absolute -bottom-32 -left-32 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-[#0D2040]/30 via-[#1E3A6A]/15 to-transparent blur-3xl dark:from-[#0D2040]/50 dark:via-[#162E54]/25"
      />

      {/* Orb C: Jordan Emerald Glow (Center / Drifting) */}
      <div 
        className="aurora-orb-3 absolute top-1/3 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-gradient-to-r from-[#007A3D]/10 via-[#C8A65E]/10 to-transparent blur-3xl dark:from-[#007A3D]/15 dark:via-[#C8A65E]/8"
      />

      {/* 3. Subtle Twinkling Star Dust (14 discrete, delicate points) */}
      <div className="absolute inset-0 opacity-40 dark:opacity-70">
        {[
          { top: "12%", left: "18%", delay: "0s", size: "w-1.5 h-1.5" },
          { top: "22%", left: "75%", delay: "1.2s", size: "w-2 h-2" },
          { top: "38%", left: "42%", delay: "2.4s", size: "w-1 h-1" },
          { top: "54%", left: "88%", delay: "0.8s", size: "w-1.5 h-1.5" },
          { top: "65%", left: "14%", delay: "1.9s", size: "w-2 h-2" },
          { top: "78%", left: "62%", delay: "3.1s", size: "w-1 h-1" },
          { top: "85%", left: "28%", delay: "1.5s", size: "w-1.5 h-1.5" },
          { top: "16%", left: "92%", delay: "2.8s", size: "w-1 h-1" },
          { top: "45%", left: "8%", delay: "0.4s", size: "w-2 h-2" },
          { top: "90%", left: "80%", delay: "2.1s", size: "w-1.5 h-1.5" },
        ].map((star, i) => (
          <div
            key={i}
            className={`star-particle absolute ${star.size} rounded-full bg-[#C8A65E] shadow-sm shadow-[#C8A65E]/50`}
            style={{
              top: star.top,
              left: star.left,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>

      {/* Pure CSS Animations for 60fps GPU Performance */}
      <style jsx global>{`
        @keyframes floatAurora1 {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(-60px, 80px, 0) scale(1.12);
          }
        }
        @keyframes floatAurora2 {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(70px, -60px, 0) scale(1.15);
          }
        }
        @keyframes floatAurora3 {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(-40px, -50px, 0) scale(0.92);
          }
        }
        @keyframes starTwinkle {
          0%, 100% {
            opacity: 0.15;
            transform: scale(0.8);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.3);
          }
        }
        .aurora-orb-1 {
          animation: floatAurora1 22s ease-in-out infinite;
          will-change: transform;
        }
        .aurora-orb-2 {
          animation: floatAurora2 26s ease-in-out infinite;
          will-change: transform;
        }
        .aurora-orb-3 {
          animation: floatAurora3 20s ease-in-out infinite;
          will-change: transform;
        }
        .star-particle {
          animation: starTwinkle 4s ease-in-out infinite;
          will-change: transform, opacity;
        }

        @media (prefers-reduced-motion: reduce) {
          .aurora-orb-1,
          .aurora-orb-2,
          .aurora-orb-3,
          .star-particle {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
