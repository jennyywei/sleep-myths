"use client";

import { useEffect, useRef } from "react";

interface BlasterProps {
  arenaRef: React.RefObject<HTMLDivElement | null>;
}

export default function Blaster({ arenaRef }: BlasterProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const arena = arenaRef.current;
    if (!arena) return;

    const onMove = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const baseX = rect.left + rect.width / 2;
      const baseY = rect.top + rect.height; // rotate from the bottom
      // Angle from "straight up" — atan2(dx, -dy) gives CCW from up
      const angle =
        Math.atan2(e.clientX - baseX, baseY - e.clientY) * (180 / Math.PI);
      el.style.transform = `rotate(${angle}deg)`;
    };

    const onTouch = (e: TouchEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const t = e.touches[0];
      if (!t) return;
      const rect = el.getBoundingClientRect();
      const baseX = rect.left + rect.width / 2;
      const baseY = rect.top + rect.height;
      const angle =
        Math.atan2(t.clientX - baseX, baseY - t.clientY) * (180 / Math.PI);
      el.style.transform = `rotate(${angle}deg)`;
    };

    arena.addEventListener("mousemove", onMove);
    arena.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      arena.removeEventListener("mousemove", onMove);
      arena.removeEventListener("touchmove", onTouch);
    };
  }, [arenaRef]);

  return (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none z-10">
      {/* wrapper: rotates around its bottom-center */}
      <div
        ref={wrapRef}
        style={{ transformOrigin: "50% 100%", transition: "transform 0.04s linear" }}
      >
        {/* Dream wand / blaster SVG — points upward by default */}
        <svg
          width="48"
          height="110"
          viewBox="0 0 48 110"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Glowing orb tip */}
          <circle cx="24" cy="10" r="11" fill="#67e8f9" opacity="0.9"
            style={{ filter: "drop-shadow(0 0 10px #38bdf8)" }} />
          <circle cx="24" cy="10" r="7" fill="white" opacity="0.85" />
          {/* Inner star sparkle */}
          <polygon
            points="24,4 25.5,9 31,9 26.5,12.5 28,18 24,14.5 20,18 21.5,12.5 17,9 22.5,9"
            fill="rgba(99,102,241,0.6)"
          />
          {/* Barrel */}
          <rect x="19" y="18" width="10" height="26" rx="5" fill="#a78bfa" />
          {/* Body */}
          <rect x="13" y="40" width="22" height="26" rx="9" fill="#7c3aed" />
          {/* Energy window */}
          <rect x="17" y="47" width="14" height="9" rx="4"
            fill="rgba(196,181,253,0.55)" />
          {/* Grip detail lines on window */}
          <line x1="21" y1="47" x2="21" y2="56" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          <line x1="24" y1="47" x2="24" y2="56" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          <line x1="27" y1="47" x2="27" y2="56" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          {/* Handle */}
          <rect x="18" y="64" width="12" height="36" rx="6" fill="#6d28d9" />
          {/* Handle grip notches */}
          <rect x="19" y="71" width="10" height="3" rx="2" fill="rgba(255,255,255,0.18)" />
          <rect x="19" y="79" width="10" height="3" rx="2" fill="rgba(255,255,255,0.18)" />
          <rect x="19" y="87" width="10" height="3" rx="2" fill="rgba(255,255,255,0.18)" />
          {/* Side fins */}
          <path d="M13 44 L4 56 L13 52 Z" fill="#6d28d9" opacity="0.8" />
          <path d="M35 44 L44 56 L35 52 Z" fill="#6d28d9" opacity="0.8" />
        </svg>
      </div>
    </div>
  );
}
