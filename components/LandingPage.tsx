"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useGameStore, pickRandomName } from "@/lib/store";
import { createShuffledDeck } from "@/lib/deck";

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

export default function LandingPage() {
  const router = useRouter();
  const { initPlayer, playerId, playerName, setPlayerName } = useGameStore();
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState<"create" | "join" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    initPlayer();
  }, [initPlayer]);

  // Sync nameInput with store once loaded
  useEffect(() => {
    if (playerName) setNameInput(playerName);
  }, [playerName]);

  function handleRandomName() {
    const pick = pickRandomName(nameInput);
    setNameInput(pick);
    setPlayerName(pick);
  }

  function handleNameChange(val: string) {
    setNameInput(val);
    setPlayerName(val);
  }

  async function handleCreate() {
    if (!playerId) return;
    const name = nameInput.trim() || playerName || "ผู้เล่น";
    setLoading("create");
    setError(null);

    const roomCode = generateRoomCode();
    const deck = createShuffledDeck();

    const { error: insertErr } = await supabase.from("rooms").insert({
      room_code: roomCode,
      deck,
      player_ids: [playerId],
      player_names: { [playerId]: name },
      current_turn_index: 0,
      status: "waiting",
      current_card: null,
    });

    if (insertErr) {
      setError("สร้างห้องไม่สำเร็จ ลองใหม่อีกครั้ง");
      setLoading(null);
      return;
    }

    router.push(`/room/${roomCode}`);
  }

  async function handleJoin() {
    const code = joinCode.trim().toUpperCase();
    if (!code || code.length < 4) {
      setError("กรุณากรอก Room ID ให้ถูกต้อง (4-6 ตัวอักษร)");
      return;
    }
    if (!playerId) return;
    setLoading("join");
    setError(null);

    const { data, error: fetchErr } = await supabase
      .from("rooms")
      .select("*")
      .eq("room_code", code)
      .single();

    if (fetchErr || !data) {
      setError("ไม่พบห้องนี้ ตรวจสอบ Room ID อีกครั้ง");
      setLoading(null);
      return;
    }

    router.push(`/room/${code}`);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
      {/* Hero */}
      <div className="flex flex-col items-center gap-4 mb-10 text-center">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-2xl"
          style={{
            background: "oklch(0.55 0.22 230)",
            boxShadow: "0 0 60px oklch(0.55 0.22 230 / 0.4)",
          }}
        >
          🍻
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
          Doraemon<br />Card Game
        </h1>
        <p className="text-white/40 text-sm leading-relaxed max-w-xs">
          แพรวโบว์ X 3สหาย D'kids
        </p>
      </div>

      <div className="w-full max-w-xs flex flex-col gap-5">
        {/* Name picker */}
        <div className="flex flex-col gap-2">
          <label className="text-white/40 text-xs uppercase tracking-widest pl-1">
            ชื่อของคุณ
          </label>
          <div className="flex gap-2">
            <input
              id="player-name-input"
              type="text"
              placeholder="ใส่ชื่อ..."
              value={nameInput}
              onChange={(e) => handleNameChange(e.target.value)}
              maxLength={20}
              className="flex-1 rounded-2xl bg-white/5 border border-white/10 text-white text-sm font-semibold py-3.5 px-4 placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-colors"
            />
            <button
              id="random-name-btn"
              type="button"
              onClick={handleRandomName}
              title="สุ่มชื่อ"
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl bg-white/5 border border-white/10 text-white transition-all duration-150 active:scale-90 hover:bg-white/10"
            >
              🎲
            </button>
          </div>
          {nameInput && (
            <p className="text-white/30 text-xs pl-1">
              ทุกคนในห้องจะเห็นคุณเป็น <span className="text-white/60 font-semibold">"{nameInput}"</span>
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-white/8" />

        {/* Create Room */}
        <button
          id="create-room-btn"
          onClick={handleCreate}
          disabled={loading !== null || !nameInput.trim()}
          className="relative w-full rounded-2xl py-5 text-lg font-black text-white tracking-wide transition-all duration-200 active:scale-95 disabled:opacity-50"
          style={{
            background: "oklch(0.55 0.22 230)",
            boxShadow: loading === null && nameInput.trim()
              ? "0 0 40px oklch(0.55 0.22 230 / 0.4)"
              : "none",
          }}
        >
          {loading === "create" ? (
            <span className="flex items-center justify-center gap-2">
              <span
                className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                style={{ animation: "spin 0.8s linear infinite" }}
              />
              กำลังสร้าง...
            </span>
          ) : (
            "สร้างห้องใหม่ +"
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs uppercase tracking-widest">หรือ</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Join Room */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleJoin();
          }}
          className="flex flex-col gap-3"
        >
          <input
            id="join-room-input"
            type="text"
            inputMode="text"
            enterKeyHint="go"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="กรอก Room ID..."
            value={joinCode}
            onChange={(e) => {
              setJoinCode(e.target.value.toUpperCase());
              setError(null);
            }}
            maxLength={6}
            className="w-full rounded-2xl bg-white/5 border border-white/10 text-white text-center text-xl font-bold tracking-[0.3em] py-4 px-4 placeholder:text-white/20 placeholder:tracking-normal placeholder:text-base focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-colors"
          />
          <button
            id="join-room-btn"
            type="submit"
            disabled={loading !== null || !joinCode.trim() || !nameInput.trim()}
            className="w-full rounded-2xl py-4 text-base font-bold text-white border border-white/15 bg-white/8 transition-all duration-200 active:scale-95 disabled:opacity-40"
          >
            {loading === "join" ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                  style={{ animation: "spin 0.8s linear infinite" }}
                />
                กำลังเข้าร่วม...
              </span>
            ) : (
              "เข้าร่วมห้อง →"
            )}
          </button>
        </form>

        {error && (
          <p className="text-red-400 text-sm text-center mt-1 leading-snug">
            {error}
          </p>
        )}
      </div>

      {/* Footer hint */}
      <p className="mt-16 text-white/20 text-xs text-center">
        ไม่ต้องสมัครสมาชิก • เล่นได้เลย
      </p>
    </div>
  );
}
