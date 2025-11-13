-- Script SQL per aggiungere la tabella game_sessions
-- Esegui questo script nel SQL Editor del tuo progetto Supabase DOPO aver eseguito supabase-setup.sql

-- Tabella per salvare tutte le partite giocate (storico)
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score NUMERIC(10, 2) NOT NULL,
  round_1_target NUMERIC(10, 2) NOT NULL,
  round_1_best_error NUMERIC(10, 2) NOT NULL,
  round_2_target NUMERIC(10, 2) NOT NULL,
  round_2_best_error NUMERIC(10, 2) NOT NULL,
  round_3_target NUMERIC(10, 2) NOT NULL,
  round_3_best_error NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crea un indice per migliorare le performance delle query
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON game_sessions(created_at DESC);

-- Abilita Row Level Security (RLS)
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Rimuovi le policy esistenti se esistono
DROP POLICY IF EXISTS "Users can view their own game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Users can insert their own game sessions" ON game_sessions;

-- Policy per game_sessions: gli utenti possono vedere solo le proprie partite
CREATE POLICY "Users can view their own game sessions" ON game_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy per game_sessions: gli utenti possono inserire solo le proprie partite
CREATE POLICY "Users can insert their own game sessions" ON game_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

