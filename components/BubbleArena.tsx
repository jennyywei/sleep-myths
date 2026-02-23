"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useCallback,
} from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Sparkle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 1 → 0
  color: string;
  size: number;
}

interface BubbleObj {
  id: number;
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  phase: "idle" | "correct" | "wrong";
  phaseMs: number;
  colorA: string;
  colorB: string;
  glowColor: string;
  sparkles: Sparkle[];
}

interface LaserObj {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  lifeMs: number;
  totalMs: number;
  isCorrect: boolean;
}

export interface BubbleArenaHandle {
  answerByIndex: (index: number) => void;
}

interface BubbleArenaProps {
  choices: string[];
  correctAnswer: string;
  round: 1 | 2 | 3;
  disabled: boolean;
  onAnswer: (choice: string) => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const RADIUS = 100;
const GUN_Y_OFFSET = 80; // px from bottom — bubbles won't drift into this zone
const LASER_MS = 380;
const SPEEDS: Record<1 | 2 | 3, number> = { 1: 80, 2: 115, 3: 150 };

const BUBBLE_PALETTE = [
  { colorA: "#ddd6fe", colorB: "#6d28d9", glowColor: "rgba(167,139,250,0.65)" },
  { colorA: "#bae6fd", colorB: "#0369a1", glowColor: "rgba(125,211,252,0.65)" },
  { colorA: "#fecdd3", colorB: "#be123c", glowColor: "rgba(253,164,175,0.65)" },
  { colorA: "#bbf7d0", colorB: "#047857", glowColor: "rgba(110,231,183,0.65)" },
];

const SPARK_COLORS = [
  "#c4b5fd", "#7dd3fc", "#fda4af", "#6ee7b7",
  "#fde68a", "#f9a8d4", "#a5f3fc", "#d8b4fe",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function initBubbles(
  choices: string[],
  W: number,
  H: number,
  speed: number
): BubbleObj[] {
  const r = RADIUS;
  const floorY = H - GUN_Y_OFFSET - r + 50;
  // Four quadrant starting positions
  const quads = [
    { x: W * 0.26, y: H * 0.25 },
    { x: W * 0.74, y: H * 0.25 },
    { x: W * 0.26, y: H * 0.62 },
    { x: W * 0.74, y: H * 0.62 },
  ];

  return choices.slice(0, 4).map((text, i) => {
    const q = quads[i];
    const angle = Math.random() * Math.PI * 2;
    const spd = speed * (0.78 + Math.random() * 0.44);
    const x = Math.max(r + 8, Math.min(W - r - 8, q.x + (Math.random() - 0.5) * 70));
    const y = Math.max(r + 8, Math.min(floorY, q.y + (Math.random() - 0.5) * 50));
    return {
      id: i,
      text,
      x,
      y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      r,
      phase: "idle" as const,
      phaseMs: 0,
      sparkles: [],
      ...BUBBLE_PALETTE[i % BUBBLE_PALETTE.length],
    };
  });
}

function resolveCollision(a: BubbleObj, b: BubbleObj) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const minDist = a.r + b.r;
  const distSq = dx * dx + dy * dy;
  if (distSq >= minDist * minDist) return;
  const dist = Math.sqrt(distSq) || 0.001;
  const nx = dx / dist;
  const ny = dy / dist;
  // Separate
  const overlap = (minDist - dist) * 0.52;
  a.x -= nx * overlap;
  a.y -= ny * overlap;
  b.x += nx * overlap;
  b.y += ny * overlap;
  // Exchange velocity components along collision normal (equal mass)
  const dvx = b.vx - a.vx;
  const dvy = b.vy - a.vy;
  const dot = dvx * nx + dvy * ny;
  if (dot > 0) return;
  a.vx += dot * nx;
  a.vy += dot * ny;
  b.vx -= dot * nx;
  b.vy -= dot * ny;
}

function drawBubble(
  ctx: CanvasRenderingContext2D,
  b: BubbleObj,
  hovered: boolean
) {
  const { r } = b;
  const isWrong = b.phase === "wrong";
  const isCorrect = b.phase === "correct";

  // Shake offset for wrong
  const shakeX = isWrong
    ? Math.sin(b.phaseMs * 0.055) * 9 * (b.phaseMs / 560)
    : 0;

  // Scale + fade for correct
  const correctProgress = isCorrect
    ? Math.max(0, 1 - b.phaseMs / 420)
    : 0;
  const scale = isCorrect ? 1 + correctProgress * 0.5 : 1;
  const alpha = isCorrect ? Math.max(0, 1 - correctProgress * 1.3) : 1;

  if (isCorrect && alpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(b.x + shakeX, b.y);
  ctx.scale(scale, scale);

  // Outer glow
  ctx.shadowBlur = hovered ? 36 : 22;
  ctx.shadowColor = b.glowColor;

  // Bubble fill — radial gradient
  const grad = ctx.createRadialGradient(-r * 0.32, -r * 0.32, 0, 0, 0, r);
  grad.addColorStop(0, b.colorA);
  grad.addColorStop(1, b.colorB);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // Glass highlight (inner shine)
  ctx.shadowBlur = 0;
  const hg = ctx.createRadialGradient(-r * 0.28, -r * 0.28, 0, -r * 0.1, -r * 0.1, r * 0.72);
  hg.addColorStop(0, "rgba(255,255,255,0.4)");
  hg.addColorStop(1, "rgba(255,255,255,0)");
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = hg;
  ctx.fill();

  // Border
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.strokeStyle = isWrong ? "rgba(239,68,68,0.9)" : "rgba(255,255,255,0.45)";
  ctx.lineWidth = isWrong ? 3 : 1.5;
  ctx.stroke();

  // Lightning crack lines for wrong
  if (isWrong) {
    ctx.beginPath();
    ctx.moveTo(-6, -r * 0.62);
    ctx.lineTo(-1, -4);
    ctx.lineTo(8, -6);
    ctx.lineTo(3, r * 0.52);
    ctx.strokeStyle = "rgba(239,68,68,0.75)";
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(14, -r * 0.48);
    ctx.lineTo(7, 6);
    ctx.lineTo(15, r * 0.38);
    ctx.stroke();
  }

  // Index number (top-right corner of bubble)
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = `400 12px 'Gaegu', cursive`;
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillText(String(b.id + 1), r * 0.74, -r * 0.78);

  // Answer text — centered, wrapped
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 20px 'Gaegu', cursive`;
  const lines = wrapText(ctx, b.text, r * 1.6);
  const lineH = 24;
  const totalH = lines.length * lineH;
  lines.forEach((ln, li) => {
    ctx.fillText(ln, 0, -totalH / 2 + li * lineH + lineH / 2);
  });

  ctx.restore();
  ctx.globalAlpha = 1;
}

// ── Component ─────────────────────────────────────────────────────────────────

const BubbleArena = forwardRef<BubbleArenaHandle, BubbleArenaProps>(
  function BubbleArena({ choices, correctAnswer, round, disabled, onAnswer }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const bubblesRef = useRef<BubbleObj[]>([]);
    const laserRef = useRef<LaserObj | null>(null);
    const mouseRef = useRef({ x: -999, y: -999 });
    const disabledRef = useRef(disabled);
    const correctAnswerRef = useRef(correctAnswer);
    const rafRef = useRef<number>(0);

    useEffect(() => { disabledRef.current = disabled; }, [disabled]);
    useEffect(() => { correctAnswerRef.current = correctAnswer; }, [correctAnswer]);

    // Reinitialize bubbles whenever the question changes
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || choices.length === 0) return;
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      if (W === 0 || H === 0) return;
      bubblesRef.current = initBubbles(choices, W, H, SPEEDS[round]);
    }, [choices, round]);

    const getGunPos = useCallback(() => {
      const c = canvasRef.current;
      if (!c) return { x: 200, y: 500 };
      return { x: c.offsetWidth / 2, y: c.offsetHeight - GUN_Y_OFFSET };
    }, []);

    // Fire — shared by click, touch, and keyboard
    const fire = useCallback(
      (bubbleId: number) => {
        const b = bubblesRef.current[bubbleId];
        if (!b || b.phase !== "idle") return;

        const isCorrect = b.text === correctAnswerRef.current;
        b.phase = isCorrect ? "correct" : "wrong";
        b.phaseMs = isCorrect ? 420 : 560;

        if (isCorrect) {
          b.vx = 0;
          b.vy = 0;
          b.sparkles = Array.from({ length: 20 }, (_, si) => {
            const angle = (si / 20) * Math.PI * 2 + Math.random() * 0.3;
            const spd = 75 + Math.random() * 90;
            return {
              x: b.x,
              y: b.y,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd,
              life: 1,
              color: SPARK_COLORS[si % SPARK_COLORS.length],
              size: 3 + Math.random() * 5,
            };
          });
        }

        const gun = getGunPos();
        laserRef.current = {
          x1: gun.x,
          y1: gun.y,
          x2: b.x,
          y2: b.y,
          lifeMs: LASER_MS,
          totalMs: LASER_MS,
          isCorrect,
        };

        onAnswer(b.text);
      },
      [getGunPos, onAnswer]
    );

    // Expose keyboard answer method
    useImperativeHandle(ref, () => ({
      answerByIndex: (index: number) => {
        if (!disabledRef.current) fire(index);
      },
    }));

    // RAF physics + render loop
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const setupCanvas = () => {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.offsetWidth * dpr;
        canvas.height = canvas.offsetHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      setupCanvas();

      const ro = new ResizeObserver(() => {
        setupCanvas();
        const W = canvas.offsetWidth;
        const H = canvas.offsetHeight;
        if (W === 0 || H === 0) return;
        // Clamp existing bubbles to new bounds
        for (const b of bubblesRef.current) {
          b.x = Math.max(b.r + 8, Math.min(W - b.r - 8, b.x));
          b.y = Math.max(b.r + 8, Math.min(H - GUN_Y_OFFSET - b.r - 12, b.y));
        }
      });
      ro.observe(canvas);

      let lastTime = performance.now();

      const loop = (now: number) => {
        const dtMs = Math.min(now - lastTime, 50);
        const dt = dtMs / 1000;
        lastTime = now;

        const W = canvas.offsetWidth;
        const H = canvas.offsetHeight;
        const floorY = H - GUN_Y_OFFSET - RADIUS - 12;
        const bubbles = bubblesRef.current;

        // Physics update
        for (const b of bubbles) {
          if (b.phase === "correct") {
            b.phaseMs -= dtMs;
            b.sparkles = b.sparkles
              .map((s) => ({
                ...s,
                x: s.x + s.vx * dt,
                y: s.y + s.vy * dt,
                life: s.life - dt * 1.6,
              }))
              .filter((s) => s.life > 0);
            continue;
          }

          b.x += b.vx * dt;
          b.y += b.vy * dt;

          // Wall bounce
          if (b.x - b.r < 0) { b.x = b.r; b.vx = Math.abs(b.vx); }
          if (b.x + b.r > W) { b.x = W - b.r; b.vx = -Math.abs(b.vx); }
          if (b.y - b.r < 0) { b.y = b.r; b.vy = Math.abs(b.vy); }
          if (b.y + b.r > floorY) { b.y = floorY - b.r; b.vy = -Math.abs(b.vy); }

          if (b.phase === "wrong") {
            b.phaseMs -= dtMs;
            if (b.phaseMs <= 0) b.phase = "idle";
          }
        }

        // Circle–circle collisions
        for (let i = 0; i < bubbles.length; i++) {
          for (let j = i + 1; j < bubbles.length; j++) {
            if (bubbles[i].phase !== "correct" && bubbles[j].phase !== "correct") {
              resolveCollision(bubbles[i], bubbles[j]);
            }
          }
        }

        // Laser timer
        if (laserRef.current) {
          laserRef.current.lifeMs -= dtMs;
          if (laserRef.current.lifeMs <= 0) laserRef.current = null;
        }

        // Render
        ctx.clearRect(0, 0, W, H);

        // Draw laser
        const laser = laserRef.current;
        if (laser) {
          const a = Math.max(0, laser.lifeMs / laser.totalMs);
          ctx.save();
          ctx.globalAlpha = a * 0.9;
          ctx.strokeStyle = laser.isCorrect ? "#67e8f9" : "#f87171";
          ctx.lineWidth = 3;
          ctx.shadowBlur = 14;
          ctx.shadowColor = laser.isCorrect ? "#38bdf8" : "#ef4444";
          ctx.beginPath();
          ctx.moveTo(laser.x1, laser.y1);
          ctx.lineTo(laser.x2, laser.y2);
          ctx.stroke();
          ctx.restore();
        }

        // Draw sparkles (behind bubbles for correct bursts)
        for (const b of bubbles) {
          for (const s of b.sparkles) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, s.life);
            ctx.fillStyle = s.color;
            ctx.shadowBlur = 7;
            ctx.shadowColor = s.color;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size * Math.max(0.1, s.life), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }

        // Draw bubbles
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        for (const b of bubbles) {
          if (b.phase === "correct" && b.phaseMs <= 0 && b.sparkles.length === 0) continue;
          const hovered =
            !disabledRef.current && Math.hypot(mx - b.x, my - b.y) < b.r;
          drawBubble(ctx, b, hovered);
        }

        rafRef.current = requestAnimationFrame(loop);
      };

      // Wait for Gaegu font before starting render
      const startId = setTimeout(() => {
        rafRef.current = requestAnimationFrame(loop);
      }, 400);

      return () => {
        clearTimeout(startId);
        cancelAnimationFrame(rafRef.current);
        ro.disconnect();
      };
    }, []);

    // Mouse tracking
    const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
      const c = canvasRef.current;
      if (!c) return;
      const rect = c.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }, []);

    // Click
    const onClick = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (disabledRef.current) return;
        const c = canvasRef.current;
        if (!c) return;
        const rect = c.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        for (const b of bubblesRef.current) {
          if (b.phase !== "idle") continue;
          if (Math.hypot(mx - b.x, my - b.y) <= b.r) {
            fire(b.id);
            break;
          }
        }
      },
      [fire]
    );

    // Touch
    const onTouchEnd = useCallback(
      (e: React.TouchEvent<HTMLCanvasElement>) => {
        if (disabledRef.current) return;
        const c = canvasRef.current;
        if (!c) return;
        const rect = c.getBoundingClientRect();
        const touch = e.changedTouches[0];
        if (!touch) return;
        const mx = touch.clientX - rect.left;
        const my = touch.clientY - rect.top;
        for (const b of bubblesRef.current) {
          if (b.phase !== "idle") continue;
          if (Math.hypot(mx - b.x, my - b.y) <= b.r) {
            fire(b.id);
            break;
          }
        }
      },
      [fire]
    );

    return (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ cursor: disabled ? "default" : "crosshair" }}
        onMouseMove={onMouseMove}
        onClick={onClick}
        onTouchEnd={onTouchEnd}
      />
    );
  }
);

export default BubbleArena;
