"use client";

import { CARD_DESCRIPTIONS, cardValue, cardSuit } from "@/lib/deck";
import { useEffect, useState, useRef, useCallback } from "react";

interface CardDisplayProps {
  card: string | null;
  drawCount: number;
  /** Called when user commits a draw (via drag past threshold) */
  onDraw?: () => void;
  /** Whether the current player can draw (their turn, game not over, not loading) */
  canDraw?: boolean;
}

type Suit = "♠" | "♥" | "♦" | "♣";

const RED_SUITS: Set<Suit> = new Set(["♥", "♦"]);

// Pip layout maps for standard playing card pip grids (3×7 grid positions)
// Each entry is [col (0-2), row (0-6)] — col 1 = center, rows 0–6 top to bottom
const PIP_LAYOUTS: Record<string, [number, number][]> = {
  A:   [[1, 3]],
  "2": [[1, 1], [1, 5]],
  "3": [[1, 1], [1, 3], [1, 5]],
  "4": [[0, 1], [2, 1], [0, 5], [2, 5]],
  "5": [[0, 1], [2, 1], [1, 3], [0, 5], [2, 5]],
  "6": [[0, 1], [2, 1], [0, 3], [2, 3], [0, 5], [2, 5]],
  "7": [[0, 1], [2, 1], [1, 2], [0, 3], [2, 3], [0, 5], [2, 5]],
  "8": [[0, 1], [2, 1], [1, 2], [0, 3], [2, 3], [1, 4], [0, 5], [2, 5]],
  "9": [[0, 0], [2, 0], [0, 2], [2, 2], [1, 3], [0, 4], [2, 4], [0, 6], [2, 6]],
  "10":[[0, 0], [2, 0], [1, 1], [0, 2], [2, 2], [0, 4], [2, 4], [1, 5], [0, 6], [2, 6]],
};

const COL_X = ["22%", "50%", "78%"];
const ROW_Y = ["12%", "18%", "34%", "50%", "66%", "82%", "88%"];

function PipGrid({ value, suit, red }: { value: string; suit: string; red: boolean }) {
  const layout = PIP_LAYOUTS[value];
  if (!layout) return null;
  const color = red ? "#e81010" : "#111111";
  return (
    <div className="absolute inset-0 pointer-events-none">
      {layout.map(([col, row], i) => {
        const rotate = row > 3 ? "rotate(180deg)" : undefined;
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: COL_X[col],
              top: ROW_Y[row],
              transform: `translate(-50%, -50%)${rotate ? " rotate(180deg)" : ""}`,
              fontSize: value === "A" ? "7.5rem" : "4.2rem",
              lineHeight: 1,
              color,
              userSelect: "none",
            }}
          >
            {suit}
          </span>
        );
      })}
    </div>
  );
}

const FACE_ART: Record<string, { emoji: string; title: string }> = {
  J: { emoji: "🤺", title: "JACK" },
  Q: { emoji: "👸", title: "QUEEN" },
  K: { emoji: "🤴", title: "KING" },
};

function CardFace({ value, suit }: { value: string; suit: Suit }) {
  const red = RED_SUITS.has(suit);
  const textColor = red ? "#e81010" : "#111111";
  const faceArt = FACE_ART[value];

  return (
    <div
      className="relative select-none"
      style={{
        width: 260,
        height: 364,
        borderRadius: 16,
        background: "#fafaf9",
        boxShadow:
          "0 4px 6px rgba(0,0,0,0.18), 0 12px 40px rgba(0,0,0,0.22), inset 0 0 0 1.5px rgba(0,0,0,0.08)",
        flexShrink: 0,
      }}
    >
      {/* Top-left corner */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 12,
          lineHeight: 0.95,
          color: textColor,
          fontWeight: 900,
          fontFamily: "Georgia, 'Times New Roman', serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 36,
        }}
      >
        <div style={{ fontSize: 34, letterSpacing: "-0.05em" }}>{value}</div>
        <div style={{ fontSize: 22, marginTop: 1 }}>{suit}</div>
      </div>

      {/* Bottom-right corner (rotated) */}
      <div
        style={{
          position: "absolute",
          bottom: 10,
          right: 12,
          lineHeight: 0.95,
          color: textColor,
          fontWeight: 900,
          fontFamily: "Georgia, 'Times New Roman', serif",
          transform: "rotate(180deg)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 36,
        }}
      >
        <div style={{ fontSize: 34, letterSpacing: "-0.05em" }}>{value}</div>
        <div style={{ fontSize: 22, marginTop: 1 }}>{suit}</div>
      </div>

      {/* Center: pip grid or face art */}
      {faceArt ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          {/* Decorative inner frame */}
          <div
            style={{
              position: "absolute",
              width: 160,
              height: 230,
              borderRadius: 8,
              border: `2px solid ${red ? "#fca5a5" : "#cbd5e1"}`,
              background: red ? "#fff8f8" : "#f8fafc",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
            }}
          />
          <span style={{ fontSize: "5.5rem", position: "relative" }}>{faceArt.emoji}</span>
          <span
            style={{
              position: "relative",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.15em",
              color: textColor,
              opacity: 0.7,
              fontFamily: "Georgia, serif",
            }}
          >
            {faceArt.title}
          </span>
        </div>
      ) : (
        <PipGrid value={value} suit={suit} red={red} />
      )}
    </div>
  );
}

// Card back design
function CardBack() {
  return (
    <div
      style={{
        width: 260,
        height: 364,
        borderRadius: 16,
        background: "oklch(0.25 0.18 260)",
        boxShadow:
          "0 4px 6px rgba(0,0,0,0.3), 0 12px 40px rgba(0,0,0,0.35), inset 0 0 0 1.5px rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Diagonal pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(45deg, oklch(0.3 0.2 260) 0px, oklch(0.3 0.2 260) 1px, transparent 1px, transparent 12px), repeating-linear-gradient(-45deg, oklch(0.3 0.2 260) 0px, oklch(0.3 0.2 260) 1px, transparent 1px, transparent 12px)",
          opacity: 0.6,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 10,
          borderRadius: 9,
          border: "1.5px solid oklch(0.5 0.2 260)",
          opacity: 0.4,
        }}
      />
      <span style={{ fontSize: "4rem", position: "relative" }}>🃏</span>
    </div>
  );
}

// ─── Constants ───────────────────────────────────────────────────────────────
const CARD_WIDTH = 260;
const FLIP_THRESHOLD_DEG = 45; // degrees past which we commit the draw

export default function CardDisplay({ card, drawCount, onDraw, canDraw }: CardDisplayProps) {
  const [phase, setPhase] = useState<"idle" | "face-down" | "face-up">("idle");
  const [displayedCard, setDisplayedCard] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Drag state ──────────────────────────────────────────────────────────────
  const [dragAngle, setDragAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false); // spring-back or snap
  const startXRef = useRef(0);
  const hasCommittedRef = useRef(false);
  const springTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Auto-flip animation (triggered by drawCount from DB) ──────────────────
  useEffect(() => {
    if (card === null) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    // Reset drag state when a new card arrives
    setIsDragging(false);
    setDragAngle(0);
    setIsAnimating(false);
    hasCommittedRef.current = false;

    setPhase("face-down");

    timerRef.current = setTimeout(() => {
      setDisplayedCard(card);
      timerRef.current = setTimeout(() => {
        setPhase("face-up");
      }, 80);
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawCount]);

  // ── Pointer handlers ───────────────────────────────────────────────────────
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!canDraw || phase === "face-down") return;
      if (springTimerRef.current) clearTimeout(springTimerRef.current);
      e.currentTarget.setPointerCapture(e.pointerId);
      startXRef.current = e.clientX;
      hasCommittedRef.current = false;
      setIsDragging(true);
      setIsAnimating(false);
      setDragAngle(0);
    },
    [canDraw, phase]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const delta = Math.abs(e.clientX - startXRef.current);
      // Map drag distance to rotateY: full card width / 2 = 90°
      const angle = Math.min((delta / (CARD_WIDTH / 2)) * 90, 90);
      setDragAngle(angle);
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragAngle >= FLIP_THRESHOLD_DEG && !hasCommittedRef.current) {
      // ── Commit draw ──────────────────────────────────────────────────────
      hasCommittedRef.current = true;
      setIsAnimating(true);
      // Snap to 90°, then reset so the drawCount effect takes over
      setDragAngle(90);
      springTimerRef.current = setTimeout(() => {
        setDragAngle(0);
        setIsAnimating(false);
      }, 280);
      onDraw?.();
    } else {
      // ── Spring back ──────────────────────────────────────────────────────
      setIsAnimating(true);
      setDragAngle(0);
      springTimerRef.current = setTimeout(() => {
        setIsAnimating(false);
      }, 450);
    }
  }, [isDragging, dragAngle, onDraw]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const parsedValue = displayedCard ? cardValue(displayedCard) : "";
  const parsedSuit = displayedCard ? (cardSuit(displayedCard) as Suit) : "♠";
  const description = parsedValue ? (CARD_DESCRIPTIONS[parsedValue] ?? "") : "";

  // When it's the player's turn, always show a draggable card back
  // (overrides the previously drawn face-up card)
  const showDraggableBack = canDraw && phase !== "face-down";

  // ── Transform computation ──────────────────────────────────────────────────
  let transform: string;
  let transition: string;

  if (showDraggableBack && (isDragging || dragAngle > 0)) {
    // During active drag or snap/spring animation
    if (isDragging) {
      transition = "none";
      transform = `rotateY(${dragAngle}deg) scale(0.97)`;
    } else {
      // Spring back: bouncy easing; Snap commit: snappy easing
      const easing =
        dragAngle === 90
          ? "cubic-bezier(0.4, 0, 0.2, 1)"  // snap to 90
          : "cubic-bezier(0.34, 1.56, 0.64, 1)"; // spring bounce back
      transition = `transform 0.4s ${easing}`;
      transform = `rotateY(${dragAngle}deg) scale(1)`;
    }
  } else if (phase === "face-down") {
    transition = "transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)";
    transform = "rotateY(90deg) scale(0.92)";
  } else {
    transition = "transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)";
    transform = "rotateY(0deg) scale(1)";
  }

  const cardWrapperStyle: React.CSSProperties = {
    transition,
    transformStyle: "preserve-3d",
    transform,
    cursor: showDraggableBack
      ? isDragging
        ? "grabbing"
        : "grab"
      : "default",
    userSelect: "none",
    touchAction: "none", // prevent scroll hijack on mobile
  };

  // Drag progress ratio 0–1 for hint opacity
  const dragProgress = dragAngle / FLIP_THRESHOLD_DEG;

  return (
    <>
      {/* Keyframe animations for the hint arrows */}
      <style>{`
        @keyframes nudgeLeft {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-5px); }
        }
        @keyframes nudgeRight {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
      `}</style>

      <div className="flex flex-col items-center gap-6 py-6 px-6">
        {/* Card */}
        <div style={{ perspective: 900 }}>
          <div
            style={cardWrapperStyle}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {showDraggableBack || phase === "face-down" || !displayedCard ? (
              <CardBack />
            ) : (
              <CardFace value={parsedValue} suit={parsedSuit} />
            )}
          </div>
        </div>

        {/* Drag threshold progress bar — visible only when dragging */}
        {showDraggableBack && isDragging && (
          <div
            style={{
              width: 140,
              height: 4,
              borderRadius: 99,
              background: "rgba(255,255,255,0.12)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(dragProgress * 100, 100)}%`,
                borderRadius: 99,
                background:
                  dragProgress >= 1
                    ? "oklch(0.72 0.2 145)"   // green = committed!
                    : "oklch(0.65 0.22 230)",  // blue = dragging
                transition: "background 0.15s",
              }}
            />
          </div>
        )}

        {/* Drag hint — visible when it's the player's turn and not dragging */}
        {showDraggableBack && !isDragging && !isAnimating && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "rgba(255,255,255,0.45)",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.04em",
              userSelect: "none",
            }}
          >
            <span style={{ display: "inline-block", animation: "nudgeLeft 1.4s ease-in-out infinite" }}>
              ←
            </span>
            ลากเพื่อพลิกไพ่
            <span style={{ display: "inline-block", animation: "nudgeRight 1.4s ease-in-out infinite" }}>
              →
            </span>
          </div>
        )}

        {/* Card description */}
        {phase === "face-up" && !canDraw && displayedCard ? (
          <div
            className="max-w-[280px] text-center"
            style={{
              opacity: 1,
              transform: "translateY(0)",
              transition: "opacity 0.3s ease-out 0.15s, transform 0.3s ease-out 0.15s",
            }}
          >
            <p className="text-white text-lg font-semibold leading-relaxed">{description}</p>
          </div>
        ) : !displayedCard && !canDraw ? (
          <p className="text-white/30 text-sm tracking-wide mt-2">รอจั่วไพ่...</p>
        ) : null}
      </div>
    </>
  );
}
