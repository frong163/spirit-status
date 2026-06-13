-- ============================================
-- Spirit Status — Full Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────
CREATE TABLE profiles (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  avatar_url    TEXT,

  -- Spiritual attributes (0–100 each)
  luck          INTEGER DEFAULT 50 CHECK (luck   >= 0 AND luck   <= 100),
  wealth        INTEGER DEFAULT 50 CHECK (wealth >= 0 AND wealth <= 100),
  love          INTEGER DEFAULT 50 CHECK (love   >= 0 AND love   <= 100),
  career        INTEGER DEFAULT 50 CHECK (career >= 0 AND career <= 100),
  energy        INTEGER DEFAULT 50 CHECK (energy >= 0 AND energy <= 100),

  -- Computed
  spirit_score  DECIMAL(5,1) DEFAULT 50.0,
  aura_tier     TEXT         DEFAULT 'Mystic',

  -- Streak tracking
  daily_streak  INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_draw_date DATE,

  -- Meta
  badges        JSONB   DEFAULT '[]',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- DRAW HISTORY
-- ─────────────────────────────────────────────
CREATE TABLE draw_history (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id             UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  card_id             INTEGER      NOT NULL,
  card_name           TEXT         NOT NULL,
  attribute_changes   JSONB        NOT NULL,
  spirit_score_before DECIMAL(5,1),
  spirit_score_after  DECIMAL(5,1),
  drawn_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX idx_profiles_spirit_score ON profiles(spirit_score DESC);
CREATE INDEX idx_profiles_luck         ON profiles(luck   DESC);
CREATE INDEX idx_profiles_wealth       ON profiles(wealth DESC);
CREATE INDEX idx_profiles_love         ON profiles(love   DESC);
CREATE INDEX idx_profiles_career       ON profiles(career DESC);
CREATE INDEX idx_profiles_energy       ON profiles(energy DESC);
CREATE INDEX idx_profiles_username     ON profiles(username);
CREATE INDEX idx_draw_history_user     ON draw_history(user_id, drawn_at DESC);

-- ─────────────────────────────────────────────
-- LEADERBOARD VIEWS
-- ─────────────────────────────────────────────
CREATE VIEW leaderboard_spirit AS
SELECT
  ROW_NUMBER() OVER (ORDER BY spirit_score DESC) AS rank,
  id            AS user_id,
  username,
  avatar_url,
  spirit_score,
  aura_tier,
  luck, wealth, love, career, energy,
  daily_streak
FROM profiles
ORDER BY spirit_score DESC;

CREATE VIEW leaderboard_luck AS
SELECT ROW_NUMBER() OVER (ORDER BY luck DESC) AS rank,
  id AS user_id, username, avatar_url, luck, spirit_score, aura_tier, daily_streak,
  wealth, love, career, energy
FROM profiles ORDER BY luck DESC;

CREATE VIEW leaderboard_wealth AS
SELECT ROW_NUMBER() OVER (ORDER BY wealth DESC) AS rank,
  id AS user_id, username, avatar_url, wealth, spirit_score, aura_tier, daily_streak,
  luck, love, career, energy
FROM profiles ORDER BY wealth DESC;

CREATE VIEW leaderboard_love AS
SELECT ROW_NUMBER() OVER (ORDER BY love DESC) AS rank,
  id AS user_id, username, avatar_url, love, spirit_score, aura_tier, daily_streak,
  luck, wealth, career, energy
FROM profiles ORDER BY love DESC;

CREATE VIEW leaderboard_career AS
SELECT ROW_NUMBER() OVER (ORDER BY career DESC) AS rank,
  id AS user_id, username, avatar_url, career, spirit_score, aura_tier, daily_streak,
  luck, wealth, love, energy
FROM profiles ORDER BY career DESC;

CREATE VIEW leaderboard_energy AS
SELECT ROW_NUMBER() OVER (ORDER BY energy DESC) AS rank,
  id AS user_id, username, avatar_url, energy, spirit_score, aura_tier, daily_streak,
  luck, wealth, love, career
FROM profiles ORDER BY energy DESC;

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_history ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read, only owner can write
CREATE POLICY "profiles_select"  ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert"  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update"  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Draw history: only owner can read/write
CREATE POLICY "draws_select" ON draw_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "draws_insert" ON draw_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- TRIGGERS
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Auto-create profile row when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      'spirit_' || substring(NEW.id::text, 1, 8)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────────
-- OPTIONAL: seed test data (remove in production)
-- ─────────────────────────────────────────────
-- INSERT INTO profiles (id, username, luck, wealth, love, career, energy, spirit_score, aura_tier, daily_streak)
-- VALUES
--   (uuid_generate_v4(), 'celestial_sage',   95, 88, 92, 85, 90, 90.0, 'Celestial', 14),
--   (uuid_generate_v4(), 'oracle_dawn',      78, 75, 80, 72, 77, 76.4, 'Oracle',    7),
--   (uuid_generate_v4(), 'mystic_wanderer',  55, 60, 58, 62, 56, 58.2, 'Mystic',    3);

-- ─────────────────────────────────────────────
-- FRIENDS SYSTEM
-- ─────────────────────────────────────────────
CREATE TABLE friendships (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id  UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status     TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

CREATE INDEX idx_friendships_user   ON friendships(user_id, status);
CREATE INDEX idx_friendships_friend ON friendships(friend_id, status);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "friends_select" ON friendships FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "friends_insert" ON friendships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "friends_update" ON friendships FOR UPDATE USING (auth.uid() = friend_id OR auth.uid() = user_id);
CREATE POLICY "friends_delete" ON friendships FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);
