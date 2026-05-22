"use client";

import { CARD_DESCRIPTIONS, cardValue, cardSuit } from "@/lib/deck";
import { useEffect, useState, useRef } from "react";

interface CardDisplayProps {
  card: string | null;
  drawCount: number;
}

type Suit = "\u2660" | "\u2665" | "\u2666" | "\u2663";

const RED_SUITS: Set<Suit> = new Set(["\u2665", "\u2666"]);

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
        // Pips in the bottom half are rotated 180°
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

// Face card art for J / Q / K
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
    // Outer card shell — white with crisp shadow
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
          {/* Decorative inner frame for face cards (looks like a real card canvas and won't overlap the corners) */}
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

export default function CardDisplay({ card, drawCount }: CardDisplayProps) {
  const [phase, setPhase] = useState<"idle" | "face-down" | "face-up">("idle");
  const [displayedCard, setDisplayedCard] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (card === null) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    // Phase 1: show card back (flip down)
    setPhase("face-down");

    timerRef.current = setTimeout(() => {
      // Phase 2: swap card value (suit comes from card string), then flip up
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

  const parsedValue = displayedCard ? cardValue(displayedCard) : "";
  const parsedSuit = displayedCard ? (cardSuit(displayedCard) as Suit) : "\u2660";
  const description = parsedValue ? (CARD_DESCRIPTIONS[parsedValue] ?? "") : "";

  // Flip transform values
  const cardStyle: React.CSSProperties = {
    transition: "transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)",
    transformStyle: "preserve-3d",
    transform:
      phase === "face-down"
        ? "rotateY(90deg) scale(0.92)"
        : phase === "face-up"
        ? "rotateY(0deg) scale(1)"
        : "rotateY(0deg) scale(1)",
  };

  return (
    <div className="flex flex-col items-center gap-6 py-6 px-6">
      {/* Card */}
      <div style={{ perspective: 800 }}>
        <div style={cardStyle}>
          {phase === "face-down" || !displayedCard ? (
            <CardBack />
          ) : (
            <CardFace value={parsedValue} suit={parsedSuit} />
          )}
        </div>
      </div>

      {/* Description */}
      {phase === "face-up" && displayedCard ? (
        <div
          className="max-w-[280px] text-center"
          style={{
            opacity: phase === "face-up" ? 1 : 0,
            transform: phase === "face-up" ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.3s ease-out 0.15s, transform 0.3s ease-out 0.15s",
          }}
        >
          <p className="text-white text-lg font-semibold leading-relaxed">
            {description}
          </p>
        </div>
      ) : !displayedCard ? (
        <p className="text-white/30 text-sm tracking-wide mt-2">รอจั่วไพ่...</p>
      ) : null}
    </div>
  );
}
