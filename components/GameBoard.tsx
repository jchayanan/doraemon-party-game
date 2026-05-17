"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { RoomRow } from "@/lib/supabase";
import { createShuffledDeck } from "@/lib/deck";
import { useGameStore } from "@/lib/store";
import CardDisplay from "@/components/CardDisplay";
import PlayerStatus from "@/components/PlayerStatus";
import RuleReminder from "@/components/RuleReminder";

interface GameBoardProps {
  code: string;
}

export default function GameBoard({ code }: GameBoardProps) {
  const router = useRouter();
  const { playerId, initPlayer, setRoom } = useGameStore();
  const room = useGameStore((s) => s.room);
  const [drawCount, setDrawCount] = useState(0);
  const [drawing, setDrawing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Init player ID on mount
  useEffect(() => {
    initPlayer();
  }, [initPlayer]);

  // Fetch room + subscribe to realtime
  useEffect(() => {
    if (!playerId) return;

    let ignore = false;

    async function fetchAndJoin() {
      // Fetch current room
      const { data: existing, error: fetchErr } = await supabase
        .from("rooms")
        .select("*")
        .eq("room_code", code)
        .single();

      if (fetchErr || !existing) {
        setError("ไม่พบห้องนี้ กลับไปหน้าหลัก");
        return;
      }

      const roomData = existing as RoomRow;

      // Add player to room if not already in it
      if (!roomData.player_ids.includes(playerId)) {
        const updated = [...roomData.player_ids, playerId];
        const { data: updated_room, error: joinErr } = await supabase
          .from("rooms")
          .update({ player_ids: updated })
          .eq("room_code", code)
          .select()
          .single();

        if (joinErr) {
          setError("ไม่สามารถเข้าร่วมห้องได้");
          return;
        }
        if (!ignore) setRoom(updated_room as RoomRow);
      } else {
        if (!ignore) setRoom(roomData);
      }
    }

    fetchAndJoin();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`room:${code}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `room_code=eq.${code}`,
        },
        (payload) => {
          if (!ignore) {
            const newRoom = payload.new as RoomRow;
            setRoom(newRoom);
            if (newRoom.current_card) {
              setDrawCount((c) => c + 1);
            }
          }
        }
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, [playerId, code, setRoom]);

  const handleDraw = useCallback(async () => {
    if (!room || drawing) return;
    setDrawing(true);
    setError(null);

    const deck = [...room.deck];
    const drawnCard = deck.pop()!;
    const nextIndex = (room.current_turn_index + 1) % room.player_ids.length;

    const { error: updateErr } = await supabase
      .from("rooms")
      .update({
        deck,
        current_card: drawnCard,
        current_turn_index: nextIndex,
        status: deck.length === 0 ? "finished" : "playing",
      })
      .eq("room_code", code);

    if (updateErr) {
      setError("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
    }
    setDrawing(false);
  }, [room, drawing, code]);

  const handleReset = useCallback(async () => {
    if (!room || resetting) return;
    setResetting(true);
    setError(null);

    const newDeck = createShuffledDeck();
    const { error: resetErr } = await supabase
      .from("rooms")
      .update({
        deck: newDeck,
        current_card: null,
        current_turn_index: 0,
        status: "waiting",
      })
      .eq("room_code", code);

    if (resetErr) {
      setError("รีเซ็ตไม่สำเร็จ ลองใหม่อีกครั้ง");
    } else {
      setDrawCount(0);
    }
    setResetting(false);
  }, [room, resetting, code]);

  const handleStartGame = useCallback(async () => {
    if (!room) return;
    const { error: startErr } = await supabase
      .from("rooms")
      .update({ status: "playing" })
      .eq("room_code", code);
    if (startErr) setError("เริ่มเกมไม่สำเร็จ ลองใหม่อีกครั้ง");
  }, [room, code]);

  const handleMovePlayer = useCallback(async (index: number, dir: -1 | 1) => {
    if (!room) return;
    const newOrder = [...room.player_ids];
    const target = index + dir;
    if (target < 0 || target >= newOrder.length) return;
    [newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]];
    await supabase
      .from("rooms")
      .update({ player_ids: newOrder })
      .eq("room_code", code);
  }, [room, code]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 bg-[oklch(0.09_0.01_230)]">
        <span className="text-5xl">😵</span>
        <p className="text-white/60 text-center text-base">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="rounded-xl bg-white/10 border border-white/15 text-white px-6 py-3 font-semibold"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  // ── Lobby (waiting) ──────────────────────────────────────────────────────
  if (room && room.status === "waiting") {
    const isHost = room.player_ids[0] === playerId;
    return (
      <div className="min-h-screen flex flex-col bg-[oklch(0.09_0.01_230)] px-6 pt-14 pb-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col items-center gap-1 mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-2"
            style={{ background: "oklch(0.55 0.22 230)", boxShadow: "0 0 40px oklch(0.55 0.22 230 / 0.35)" }}
          >
            🎟️
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">ห้อง {room.room_code}</h1>
          <p className="text-white/40 text-sm">{isHost ? "คุณคือ host — จัดเรียงผู้เล่นแล้วเริ่มเลย!" : "รอ host เริ่มเกม..."}</p>
        </div>

        {/* Player list */}
        <div className="flex flex-col gap-2 mb-8">
          <p className="text-white/30 text-xs uppercase tracking-widest mb-1">
            ผู้เล่น ({room.player_ids.length})
          </p>
          {room.player_ids.map((pid, i) => {
            const isMe = pid === playerId;
            const isFirst = i === 0;
            const isLast = i === room.player_ids.length - 1;
            return (
              <div
                key={pid}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors"
                style={{
                  background: isMe ? "oklch(0.55 0.22 230 / 0.15)" : "rgba(255,255,255,0.04)",
                  border: isMe ? "1px solid oklch(0.55 0.22 230 / 0.4)" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {/* Position number */}
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                  style={{ background: "oklch(0.55 0.22 230 / 0.25)", color: "oklch(0.75 0.18 230)" }}
                >
                  {i + 1}
                </span>

                {/* Name */}
                <span className="flex-1 font-semibold text-sm text-white">
                  {isMe ? "👤 คุณ" : `👤 ผู้เล่น ${i + 1}`}
                </span>

                {/* Badges */}
                <div className="flex items-center gap-2">
                  {i === 0 && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: "oklch(0.55 0.22 230)", color: "white" }}>HOST</span>
                  )}
                  {isMe && i !== 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/60">YOU</span>
                  )}
                </div>

                {/* Reorder buttons — host only */}
                {isHost && (
                  <div className="flex gap-1 ml-1">
                    <button
                      onClick={() => handleMovePlayer(i, -1)}
                      disabled={isFirst}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white/60 transition-colors disabled:opacity-20"
                      style={{ background: "rgba(255,255,255,0.07)" }}
                      aria-label="ย้ายขึ้น"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMovePlayer(i, 1)}
                      disabled={isLast}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white/60 transition-colors disabled:opacity-20"
                      style={{ background: "rgba(255,255,255,0.07)" }}
                      aria-label="ย้ายลง"
                    >
                      ↓
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action */}
        {isHost ? (
          <button
            id="start-game-btn"
            onClick={handleStartGame}
            disabled={room.player_ids.length < 1}
            className="w-full rounded-2xl py-5 text-xl font-black text-white tracking-wide transition-all duration-200 active:scale-95 disabled:opacity-40"
            style={{
              background: "oklch(0.55 0.22 230)",
              boxShadow: "0 0 40px oklch(0.55 0.22 230 / 0.4)",
            }}
          >
            🎮 เริ่มเกม!
          </button>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-8 h-8 rounded-full border-4 border-blue-500/30 border-t-blue-400"
              style={{ animation: "spin 1s linear infinite" }}
            />
            <p className="text-white/40 text-sm">รอ host เริ่มเกม...</p>
          </div>
        )}

        <button
          onClick={() => router.push("/")}
          className="mt-4 text-white/30 text-sm text-center w-full py-2"
        >
          ออกจากห้อง
        </button>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[oklch(0.09_0.01_230)]">
        <div
          className="w-10 h-10 rounded-full border-4 border-blue-500/30 border-t-blue-400"
          style={{ animation: "spin 1s linear infinite" }}
        />
        <p className="text-white/40 text-sm">กำลังเชื่อมต่อ...</p>
      </div>
    );
  }

  const isMyTurn =
    room.player_ids.length > 0 &&
    room.player_ids[room.current_turn_index] === playerId;

  const isFinished = room.status === "finished" || room.deck.length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-[oklch(0.09_0.01_230)]">
      {/* Header */}
      <div className="pt-safe px-4 pt-6 pb-2">
        <PlayerStatus
          roomCode={room.room_code}
          playerCount={room.player_ids.length}
          isMyTurn={isMyTurn}
          deckRemaining={room.deck.length}
        />
      </div>

      {/* Card area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <CardDisplay card={room.current_card} drawCount={drawCount} />
      </div>

      {/* Draw button or game over */}
      <div className="px-6 pb-4 flex flex-col items-center gap-3">
        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        {isFinished ? (
          <div className="w-full max-w-xs text-center flex flex-col gap-3">
            <p className="text-white/60 text-lg font-semibold">
              🎉 ไพ่หมดแล้ว! จบเกม
            </p>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="w-full rounded-2xl py-4 font-black text-base text-white transition-all duration-200 active:scale-95 disabled:opacity-50"
              style={{
                background: "oklch(0.55 0.22 230)",
                boxShadow: resetting ? "none" : "0 0 30px oklch(0.55 0.22 230 / 0.4)",
              }}
            >
              {resetting ? "กำลังรีเซ็ต..." : "🔄 รีเซ็ตเกม (เล่นรอบใหม่)"}
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full rounded-2xl border border-white/15 bg-white/10 text-white py-4 font-bold text-base active:scale-95 transition-transform"
            >
              ออกจากห้อง
            </button>
          </div>
        ) : (
          <button
            id="draw-card-btn"
            onClick={handleDraw}
            disabled={!isMyTurn || drawing}
            className={[
              "w-full max-w-xs rounded-2xl py-5 text-xl font-black tracking-wide transition-all duration-200",
              isMyTurn && !drawing
                ? "bg-[oklch(0.55_0.22_230)] text-white shadow-[0_0_40px_oklch(0.55_0.22_230/0.4)] active:scale-95 active:shadow-none"
                : "bg-white/5 border border-white/10 text-white/25 cursor-not-allowed",
            ].join(" ")}
          >
            {drawing ? "กำลังจั่ว..." : isMyTurn ? "จั่วไพ่ 🃏" : "รอเทิร์นของคุณ"}
          </button>
        )}
      </div>

      {/* Sticky rule reminder */}
      <RuleReminder />
    </div>
  );
}
