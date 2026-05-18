"use client";

interface PlayerStatusProps {
  roomCode: string;
  playerCount: number;
  isMyTurn: boolean;
  deckRemaining: number;
  currentTurnName?: string;
}

export default function PlayerStatus({
  roomCode,
  playerCount,
  isMyTurn,
  deckRemaining,
  currentTurnName,
}: PlayerStatusProps) {
  return (
    <div className="flex flex-col items-center gap-3 pt-2 pb-1">
      {/* Room code + player count row */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
          <span className="text-white/40 text-xs uppercase tracking-widest">Room</span>
          <span className="text-white font-bold text-sm tracking-widest">{roomCode}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
          <span className="text-white/40 text-sm">👥</span>
          <span className="text-white font-semibold text-sm">{playerCount} คน</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
          <span className="text-white/40 text-sm">🃏</span>
          <span className="text-white font-semibold text-sm">{deckRemaining} ใบ</span>
        </div>
      </div>

      {/* Turn indicator */}
      {isMyTurn ? (
        <div
          className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/40 rounded-xl px-5 py-2"
          style={{ animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}
        >
          <span
            className="w-2.5 h-2.5 rounded-full bg-emerald-400"
            style={{ animation: "ping 1.2s cubic-bezier(0,0,0.2,1) infinite" }}
          />
          <span className="text-emerald-300 font-bold text-base">เทิร์นของคุณ!</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-5 py-2">
          <span className="text-white/30 text-lg">⏳</span>
          <span className="text-white/40 font-medium text-base">
            {currentTurnName ? `เทิร์นของ ${currentTurnName}` : "รอผู้เล่นคนอื่น..."}
          </span>
        </div>
      )}
    </div>
  );
}
