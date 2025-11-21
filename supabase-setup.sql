-- Script SQL per configurare il database Supabase
-- Esegui questo script nel SQL Editor del tuo progetto Supabase

-- Tabella per i profili utente
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
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
  metadata_username TEXT;
  counter INTEGER := 1;
  final_username TEXT;
BEGIN
  -- Estrai l'username dai metadata
  metadata_username := NEW.raw_user_meta_data->>'username';
  
  -- Se l'username è presente nei metadata (scelto dall'utente durante la registrazione)
  IF metadata_username IS NOT NULL AND metadata_username != '' THEN
    user_username := TRIM(metadata_username);
    
    -- Validazione lunghezza username
    IF LENGTH(user_username) < 3 OR LENGTH(user_username) > 30 THEN
      RAISE EXCEPTION 'Username length must be between 3 and 30 characters';
    END IF;
    
    -- Validazione caratteri (solo alfanumerici, underscore, trattino)
    IF user_username !~ '^[a-zA-Z0-9_-]+$' THEN
      RAISE EXCEPTION 'Username contains invalid characters. Only letters, numbers, underscores and hyphens are allowed';
    END IF;
    
    -- Non può iniziare o finire con underscore o trattino
    IF user_username ~ '^[_-]|[_-]$' THEN
      RAISE EXCEPTION 'Username cannot start or end with underscore or hyphen';
    END IF;
    
    -- Verifica che l'username sia unico
    IF EXISTS (SELECT 1 FROM public.profiles WHERE username = user_username) THEN
      -- Se esiste già, solleva un errore che impedirà la creazione dell'utente
      RAISE EXCEPTION 'Username already exists: %', user_username;
    END IF;
    
    final_username := user_username;
  ELSE
    -- Se non c'è username nei metadata, usa la parte prima della @ dell'email come fallback
    user_username := TRIM(split_part(NEW.email, '@', 1));
    
    -- Sanitizza l'username (rimuove caratteri non validi)
    user_username := REGEXP_REPLACE(user_username, '[^a-zA-Z0-9_-]', '', 'g');
    
    -- Se dopo la sanitizzazione è vuoto o troppo corto, usa un default
    IF LENGTH(user_username) < 3 THEN
      user_username := 'user' || SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 6);
    END IF;
    
    -- Limita lunghezza
    IF LENGTH(user_username) > 30 THEN
      user_username := SUBSTRING(user_username FROM 1 FOR 27);
    END IF;
    
    final_username := user_username;
    
    -- Se l'username esiste già, aggiungi un numero fino a trovarne uno disponibile
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
      final_username := user_username || counter;
      -- Limita lunghezza totale
      IF LENGTH(final_username) > 30 THEN
        final_username := SUBSTRING(user_username FROM 1 FOR 27) || counter;
      END IF;
      counter := counter + 1;
      
      -- Limita il numero di tentativi per evitare loop infiniti
      IF counter > 1000 THEN
        -- Usa l'ID come fallback se non si trova un username disponibile
        final_username := 'user' || SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 24);
        EXIT;
      END IF;
    END LOOP;
  END IF;
  
  -- Inserisci il profilo
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, final_username);
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Se c'è ancora una violazione univoca, solleva un errore
    RAISE EXCEPTION 'Username already exists: %', final_username;
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

-- Aggiungi constraint UNIQUE su username se non esiste già (per tabelle esistenti)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_username_key' 
    AND conrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
  END IF;
END $$;
