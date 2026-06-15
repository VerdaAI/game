import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fmxgukefthokkwjciqjp.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  rounds: number;
  evaded: number;
  caught: number;
  best_heist: number;
  manipulations: string | null;
  email: string | null;
  created_at: string;
}

export async function submitScore(entry: Omit<LeaderboardEntry, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("leaderboard")
    .insert(entry)
    .select()
    .single();

  if (error) {
    console.error("Failed to submit score:", error);
    return null;
  }
  return data;
}

export async function getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .order("score", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch leaderboard:", error);
    return [];
  }
  return data || [];
}

export interface RankedEntry extends LeaderboardEntry {
  attempts: number;
  penalty: number;
  effective_score: number;
}

export async function getWeeklyLeaderboard(limit = 20): Promise<RankedEntry[]> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .gte("created_at", weekAgo.toISOString())
    .order("score", { ascending: false })
    .limit(200); // fetch more to deduplicate

  if (error) {
    console.error("Failed to fetch weekly leaderboard:", error);
    return [];
  }

  // Deduplicate: one entry per player_name, best score, -1 per extra attempt
  const byPlayer = new Map<string, { best: LeaderboardEntry; attempts: number }>();
  for (const entry of data || []) {
    const name = entry.player_name.toLowerCase().trim();
    const existing = byPlayer.get(name);
    if (!existing) {
      byPlayer.set(name, { best: entry, attempts: 1 });
    } else {
      existing.attempts += 1;
      if (entry.score > existing.best.score) {
        existing.best = entry;
      }
    }
  }

  const ranked: RankedEntry[] = Array.from(byPlayer.values()).map(({ best, attempts }) => {
    const penalty = Math.max(0, attempts - 1); // -1 per extra try
    return {
      ...best,
      attempts,
      penalty,
      effective_score: Math.max(0, best.score - penalty),
    };
  });

  ranked.sort((a, b) => b.effective_score - a.effective_score);
  return ranked.slice(0, limit);
}
