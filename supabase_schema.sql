-- ============================================================
-- 暇っち - Supabase スキーマ
-- Supabase ダッシュボードの SQL Editor で実行してください
-- ============================================================

-- 1. グループテーブル
CREATE TABLE IF NOT EXISTS groups (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL,
  invite_code TEXT        UNIQUE NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. メンバーテーブル
CREATE TABLE IF NOT EXISTS members (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id   UUID        NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id    TEXT        NOT NULL,
  name       TEXT        NOT NULL,
  emoji      TEXT        NOT NULL DEFAULT '😊',
  color      TEXT        NOT NULL DEFAULT '#4F86F7',
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- 3. 空き日テーブル
CREATE TABLE IF NOT EXISTS availability (
  id         UUID  DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id   UUID  NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id    TEXT  NOT NULL,
  date       DATE  NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id, date)
);

-- ============================================================
-- Row Level Security (MVP: 全員読み書き可)
-- 本番運用時はポリシーを見直してください
-- ============================================================
ALTER TABLE groups       DISABLE ROW LEVEL SECURITY;
ALTER TABLE members      DISABLE ROW LEVEL SECURITY;
ALTER TABLE availability DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- リアルタイム通知を有効化
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE availability;
ALTER PUBLICATION supabase_realtime ADD TABLE members;
