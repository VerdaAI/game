-- Leaderboard table for Daily Challenge scores
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  rounds INTEGER NOT NULL DEFAULT 5,
  evaded INTEGER NOT NULL DEFAULT 0,
  caught INTEGER NOT NULL DEFAULT 0,
  best_heist INTEGER NOT NULL DEFAULT 0,
  manipulations TEXT, -- comma-separated list of manips used
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for top scores
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard (score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created ON leaderboard (created_at DESC);

-- Enable RLS
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Anyone can read the leaderboard
CREATE POLICY "Anyone can read leaderboard" ON leaderboard
  FOR SELECT USING (true);

-- Anyone can insert scores (no auth required for game)
CREATE POLICY "Anyone can insert scores" ON leaderboard
  FOR INSERT WITH CHECK (true);
