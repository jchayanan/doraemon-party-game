"use client";

import { create } from "zustand";
import type { RoomRow } from "./supabase";

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

interface GameStore {
  playerId: string;
  room: RoomRow | null;
  initPlayer: () => void;
  setRoom: (room: RoomRow | null) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  playerId: "",
  room: null,
  initPlayer: () => {
    const id = getOrCreatePlayerId();
    set({ playerId: id });
  },
  setRoom: (room) => set({ room }),
}));
