import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type RoomRow = {
  id: string;
  room_code: string;
  status: "waiting" | "playing" | "finished";
  player_ids: string[];
  player_names: Record<string, string>;
  current_turn_index: number;
  deck: string[];
  current_card: string | null;
  created_at: string;
};
