"use client";

import { create } from "zustand";
import type { RoomRow } from "./supabase";

const ANIMALS = [
  "หมี", "แมว", "หมา", "ลิง", "เสือ", "ช้าง", "กบ", "จระเข้",
  "กระต่าย", "เป็ด", "ยีราฟ", "ฮิปโป", "แรด", "หมาป่า", "ปู",
  "นก", "หมู", "ม้า", "กวาง", "สิงโต", "แพะ", "วัว", "ควาย",
];

const ADJECTIVES = [
  "ขี้เกียจ", "ขี้อาย", "กล้าหาญ", "ขี้โมโห", "ใจดี", "ขี้ลืม",
  "ขี้เล่น", "ขี้เหนียว", "ตลก", "น่ารัก", "ฉลาด", "เชื่องช้า",
  "ขี้กลัว", "งงงวย", "ขี้อิจฉา", "ขี้บ่น", "แสนดี", "เฉียบแหลม",
];

export function pickRandomName(exclude?: string): string {
  let name: string;
  do {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    name = `${animal}${adj}`;
  } while (name === exclude);
  return name;
}

function generateId(): string {
  return crypto.randomUUID();
}

function getOrCreatePlayerId(): string {
  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem("doraemon_player_id");
  if (stored) return stored;
  const id = generateId();
  localStorage.setItem("doraemon_player_id", id);
  return id;
}

function getOrCreatePlayerName(): string {
  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem("doraemon_player_name");
  if (stored) return stored;
  const name = pickRandomName();
  localStorage.setItem("doraemon_player_name", name);
  return name;
}

interface GameStore {
  playerId: string;
  playerName: string;
  room: RoomRow | null;
  initPlayer: () => void;
  setPlayerName: (name: string) => void;
  setRoom: (room: RoomRow | null) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  playerId: "",
  playerName: "",
  room: null,
  initPlayer: () => {
    const id = getOrCreatePlayerId();
    const name = getOrCreatePlayerName();
    set({ playerId: id, playerName: name });
  },
  setPlayerName: (name: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("doraemon_player_name", name);
    }
    set({ playerName: name });
  },
  setRoom: (room) => set({ room }),
}));


