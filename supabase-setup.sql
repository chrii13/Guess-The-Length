-- Script SQL per configurare il database Supabase
-- Esegui questo script nel SQL Editor del tuo progetto Supabase

-- Tabella per i profili utente
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabella per i punteggi
CREATE TABLE IF NOT EXISTS scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  best_score NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- Abilita Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Rimuovi le policy esistenti se esistono (per evitare errori)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Scores are viewable by everyone" ON scores;
DROP POLICY IF EXISTS "Users can insert their own score" ON scores;
DROP POLICY IF EXISTS "Users can update their own score" ON scores;

-- Policy per profiles: tutti possono leggere, solo il proprietario può modificare
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy per scores: tutti possono leggere, solo il proprietario può modificare
CREATE POLICY "Scores are viewable by everyone" ON scores
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own score" ON scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own score" ON scores
  FOR UPDATE USING (auth.uid() = user_id);

-- Funzione per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Rimuovi il trigger se esiste prima di crearlo
DROP TRIGGER IF EXISTS update_scores_updated_at ON scores;

-- Trigger per aggiornare updated_at su scores
CREATE TRIGGER update_scores_updated_at BEFORE UPDATE ON scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Funzione per creare automaticamente il profilo quando viene creato un utente
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_username TEXT;
BEGIN
  -- Estrai l'username dai metadata o dall'email
  user_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  
  -- Inserisci o aggiorna il profilo
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, user_username)
  ON CONFLICT (id) DO UPDATE
  SET username = COALESCE(
    EXCLUDED.username,
    public.profiles.username,
    user_username
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Se c'è un errore, logga ma non bloccare la creazione dell'utente
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger che chiama handle_new_user quando viene creato un nuovo utente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

