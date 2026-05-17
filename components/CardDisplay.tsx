"use client";

import { cardGroup, CARD_DESCRIPTIONS } from "@/lib/deck";
import { useEffect, useState } from "react";

interface CardDisplayProps {
  card: string | null;
  drawCount: number;
}

const GROUP_STYLES = {
  drink:   "from-red-950/60 to-red-900/30 border-red-700/50 text-red-300",
  game:    "from-blue-950/60 to-blue-900/30 border-blue-700/50 text-blue-300",
  special: "from-amber-950/60 to-amber-900/30 border-amber-700/50 text-amber-300",
};

const GROUP_VALUE_COLOR = {
  drink:   "text-red-400",
  game:    "text-blue-400",
  special: "text-amber-400",
};

export default function CardDisplay({ card, drawCount }: CardDisplayProps) {
  const [visible, setVisible] = useState(false);
  const [displayedCard, setDisplayedCard] = useState<string | null>(null);

  useEffect(() => {
    if (card === null) return;
    // Trigger flip: hide → show new card
    setVisible(false);
    const t = setTimeout(() => {
      setDisplayedCard(card);
      setVisible(true);
    }, 150);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawCount]);

  if (!displayedCard) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10 px-6">
        <div className="w-40 h-56 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center">
          <span className="text-white/20 text-5xl select-none">🃏</span>
        </div>
        <p className="text-white/30 text-sm tracking-wide">รอจั่วไพ่...</p>
      </div>
    );
  }

  const group = cardGroup(displayedCard);
  const groupStyle = GROUP_STYLES[group];
  const valueColor = GROUP_VALUE_COLOR[group];
  const description = CARD_DESCRIPTIONS[displayedCard] ?? "";

  return (
    <div
      className="flex flex-col items-center justify-center gap-5 py-8 px-6"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1) rotateY(0deg)" : "scale(0.85) rotateY(90deg)",
        transition: "opacity 0.25s ease-out, transform 0.25s ease-out",
      }}
    >
      {/* Card face */}
      <div
        className={`relative w-44 h-60 rounded-2xl border bg-gradient-to-br ${groupStyle} flex flex-col items-center justify-center shadow-2xl select-none`}
      >
        {/* Corner values */}
        <span className={`absolute top-3 left-4 text-xl font-bold ${valueColor}`}>
          {displayedCard}
        </span>
        <span className={`absolute bottom-3 right-4 text-xl font-bold rotate-180 ${valueColor}`}>
          {displayedCard}
        </span>
        {/* Center value */}
        <span className={`text-7xl font-black ${valueColor} tracking-tight`}>
          {displayedCard}
        </span>
      </div>

      {/* Thai description */}
      <div className="max-w-xs text-center">
        <p className="text-white text-lg font-semibold leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
