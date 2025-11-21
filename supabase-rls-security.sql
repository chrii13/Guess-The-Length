-- ==========================================
-- Script SQL per Configurazione RLS Sicura
-- Guess the Length - Row Level Security Policies
-- ==========================================
-- 
-- SCOPO:
-- Questo script configura Row Level Security (RLS) sicure per proteggere
-- database e utenti da accessi non autorizzati.
--
-- ESECUZIONE:
-- 1. Esegui prima supabase-setup.sql (se non già fatto)
-- 2. Esegui supabase-add-game-sessions.sql (se non già fatto)
-- 3. Esegui questo script per aggiornare le policies RLS
--
-- ==========================================

-- ==========================================
-- 1. PROFILES - Policies RLS Sicure
-- ==========================================

-- Rimuovi tutte le policies esistenti per evitare conflitti
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
DROP POLICY IF EXISTS "System can manage profiles" ON profiles;

-- Assicurati che RLS sia abilitato
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: Tutti possono leggere i profili (necessario per classifica)
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT
  USING (true);

-- INSERT: Solo utenti autenticati possono creare il proprio profilo
-- Verifica che l'ID corrisponda all'utente autenticato
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = id
    AND username IS NOT NULL
    AND LENGTH(TRIM(username)) >= 3
    AND LENGTH(TRIM(username)) <= 30
    AND TRIM(username) ~ '^[a-zA-Z0-9_-]+$'
    AND NOT (TRIM(username) ~ '^[_-]|[_-]$')
  );

-- UPDATE: Solo il proprietario può aggiornare il proprio profilo
-- Le policies RLS non possono usare OLD per confronti, quindi usiamo trigger per proteggere campi immutabili
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND username IS NOT NULL
    AND LENGTH(TRIM(username)) >= 3
    AND LENGTH(TRIM(username)) <= 30
    AND TRIM(username) ~ '^[a-zA-Z0-9_-]+$'
    AND NOT (TRIM(username) ~ '^[_-]|[_-]$')
  );

-- DELETE: Solo il proprietario può eliminare il proprio profilo
-- (In genere non necessario, ma aggiunto per sicurezza)
CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE
  USING (auth.uid() = id);

-- ==========================================
-- 2. SCORES - Policies RLS Sicure
-- ==========================================

-- Rimuovi tutte le policies esistenti
DROP POLICY IF EXISTS "Scores are viewable by everyone" ON scores;
DROP POLICY IF EXISTS "Users can insert their own score" ON scores;
DROP POLICY IF EXISTS "Users can update their own score" ON scores;
DROP POLICY IF EXISTS "Users can delete their own score" ON scores;

-- Assicurati che RLS sia abilitato
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- SELECT: Tutti possono leggere i punteggi (necessario per classifica)
CREATE POLICY "Scores are viewable by everyone" ON scores
  FOR SELECT
  USING (true);

-- INSERT: Solo utenti autenticati possono creare il proprio punteggio
-- Verifica che user_id corrisponda all'utente autenticato
-- Valida che best_score sia positivo e ragionevole
CREATE POLICY "Users can insert their own score" ON scores
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
    AND best_score > 0
    AND best_score <= 1000000
  );

-- UPDATE: Solo il proprietario può aggiornare il proprio punteggio
-- Le policies RLS non possono usare OLD per confronti, quindi usiamo trigger per proteggere campi immutabili
CREATE POLICY "Users can update their own score" ON scores
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND best_score > 0
    AND best_score <= 1000000
  );

-- DELETE: Solo il proprietario può eliminare il proprio punteggio
-- (In genere non necessario, ma aggiunto per sicurezza)
CREATE POLICY "Users can delete their own score" ON scores
  FOR DELETE
  USING (auth.uid() = user_id);

-- ==========================================
-- 3. GAME_SESSIONS - Policies RLS Sicure
-- ==========================================

-- Rimuovi tutte le policies esistenti
DROP POLICY IF EXISTS "Users can view their own game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Users can insert their own game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Users can update their own game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Users can delete their own game sessions" ON game_sessions;

-- Assicurati che RLS sia abilitato
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- SELECT: Solo il proprietario può vedere le proprie partite
CREATE POLICY "Users can view their own game sessions" ON game_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Solo utenti autenticati possono creare le proprie partite
-- Verifica che user_id corrisponda all'utente autenticato
-- Valida che tutti i valori siano positivi e ragionevoli
CREATE POLICY "Users can insert their own game sessions" ON game_sessions
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
    AND score > 0
    AND score <= 1000000
    AND round_1_target > 0
    AND round_1_target <= 1000
    AND round_1_best_error >= 0
    AND round_1_best_error <= 1000
    AND round_2_target > 0
    AND round_2_target <= 1000
    AND round_2_best_error >= 0
    AND round_2_best_error <= 1000
    AND round_3_target > 0
    AND round_3_target <= 1000
    AND round_3_best_error >= 0
    AND round_3_best_error <= 1000
  );

-- UPDATE: Solo il proprietario può aggiornare le proprie partite
-- Le policies RLS non possono usare OLD per confronti, quindi usiamo trigger per proteggere campi immutabili
-- (In genere non necessario, ma aggiunto per sicurezza)
CREATE POLICY "Users can update their own game sessions" ON game_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND score > 0
    AND score <= 1000000
    AND round_1_target > 0
    AND round_1_target <= 1000
    AND round_1_best_error >= 0
    AND round_1_best_error <= 1000
    AND round_2_target > 0
    AND round_2_target <= 1000
    AND round_2_best_error >= 0
    AND round_2_best_error <= 1000
    AND round_3_target > 0
    AND round_3_target <= 1000
    AND round_3_best_error >= 0
    AND round_3_best_error <= 1000
  );

-- DELETE: Solo il proprietario può eliminare le proprie partite
-- (In genere non necessario, ma aggiunto per sicurezza)
CREATE POLICY "Users can delete their own game sessions" ON game_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- ==========================================
-- 4. TRIGGER per Proteggere Campi Immutabili
-- ==========================================

-- Trigger per proteggere campi immutabili in profiles
CREATE OR REPLACE FUNCTION protect_immutable_fields_profiles()
RETURNS TRIGGER AS $$
BEGIN
  -- Previeni modifiche di id
  IF NEW.id != OLD.id THEN
    RAISE EXCEPTION 'Cannot modify id field';
  END IF;
  
  -- Previeni modifiche di created_at
  IF NEW.created_at != OLD.created_at THEN
    RAISE EXCEPTION 'Cannot modify created_at field';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Rimuovi trigger se esiste
DROP TRIGGER IF EXISTS protect_profiles_immutable ON profiles;

-- Crea trigger per profiles
CREATE TRIGGER protect_profiles_immutable
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION protect_immutable_fields_profiles();

-- Trigger per proteggere campi immutabili in scores
CREATE OR REPLACE FUNCTION protect_immutable_fields_scores()
RETURNS TRIGGER AS $$
BEGIN
  -- Previeni modifiche di id
  IF NEW.id != OLD.id THEN
    RAISE EXCEPTION 'Cannot modify id field';
  END IF;
  
  -- Previeni modifiche di user_id
  IF NEW.user_id != OLD.user_id THEN
    RAISE EXCEPTION 'Cannot modify user_id field';
  END IF;
  
  -- Previeni modifiche di created_at
  IF NEW.created_at != OLD.created_at THEN
    RAISE EXCEPTION 'Cannot modify created_at field';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Rimuovi trigger se esiste
DROP TRIGGER IF EXISTS protect_scores_immutable ON scores;

-- Crea trigger per scores
CREATE TRIGGER protect_scores_immutable
  BEFORE UPDATE ON scores
  FOR EACH ROW
  EXECUTE FUNCTION protect_immutable_fields_scores();

-- Trigger per proteggere campi immutabili in game_sessions
CREATE OR REPLACE FUNCTION protect_immutable_fields_game_sessions()
RETURNS TRIGGER AS $$
BEGIN
  -- Previeni modifiche di id
  IF NEW.id != OLD.id THEN
    RAISE EXCEPTION 'Cannot modify id field';
  END IF;
  
  -- Previeni modifiche di user_id
  IF NEW.user_id != OLD.user_id THEN
    RAISE EXCEPTION 'Cannot modify user_id field';
  END IF;
  
  -- Previeni modifiche di created_at
  IF NEW.created_at != OLD.created_at THEN
    RAISE EXCEPTION 'Cannot modify created_at field';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Rimuovi trigger se esiste
DROP TRIGGER IF EXISTS protect_game_sessions_immutable ON game_sessions;

-- Crea trigger per game_sessions
CREATE TRIGGER protect_game_sessions_immutable
  BEFORE UPDATE ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION protect_immutable_fields_game_sessions();

-- ==========================================
-- 5. INDICI per Performance e Sicurezza
-- ==========================================

-- Indici per migliorare le performance delle query con RLS
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_best_score ON scores(best_score);

CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON game_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_created ON game_sessions(user_id, created_at DESC);

-- ==========================================
-- 6. FUNZIONI DI VALIDAZIONE (Opzionali ma Raccomandate)
-- ==========================================

-- Funzione per validare username
CREATE OR REPLACE FUNCTION validate_username(username_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  IF username_input IS NULL OR LENGTH(TRIM(username_input)) < 3 OR LENGTH(TRIM(username_input)) > 30 THEN
    RETURN FALSE;
  END IF;
  
  IF TRIM(username_input) !~ '^[a-zA-Z0-9_-]+$' THEN
    RETURN FALSE;
  END IF;
  
  IF TRIM(username_input) ~ '^[_-]|[_-]$' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Funzione per validare punteggio
CREATE OR REPLACE FUNCTION validate_score(score_input NUMERIC)
RETURNS BOOLEAN AS $$
BEGIN
  IF score_input IS NULL OR score_input <= 0 OR score_input > 1000000 THEN
    RETURN FALSE;
  END IF;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ==========================================
-- 7. VERIFICA CONFIGURAZIONE RLS
-- ==========================================

-- Verifica che RLS sia abilitato su tutte le tabelle
DO $$
DECLARE
  rls_enabled BOOLEAN;
BEGIN
  -- Verifica profiles
  SELECT relrowsecurity INTO rls_enabled
  FROM pg_class
  WHERE relname = 'profiles';
  
  IF NOT rls_enabled THEN
    RAISE WARNING 'RLS non è abilitato su profiles!';
  ELSE
    RAISE NOTICE '✓ RLS abilitato su profiles';
  END IF;
  
  -- Verifica scores
  SELECT relrowsecurity INTO rls_enabled
  FROM pg_class
  WHERE relname = 'scores';
  
  IF NOT rls_enabled THEN
    RAISE WARNING 'RLS non è abilitato su scores!';
  ELSE
    RAISE NOTICE '✓ RLS abilitato su scores';
  END IF;
  
  -- Verifica game_sessions
  SELECT relrowsecurity INTO rls_enabled
  FROM pg_class
  WHERE relname = 'game_sessions';
  
  IF NOT rls_enabled THEN
    RAISE WARNING 'RLS non è abilitato su game_sessions!';
  ELSE
    RAISE NOTICE '✓ RLS abilitato su game_sessions';
  END IF;
END $$;

-- ==========================================
-- 8. REPORT FINALE
-- ==========================================

-- Mostra tutte le policies RLS configurate
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'scores', 'game_sessions')
ORDER BY tablename, policyname;

-- ==========================================
-- FINE SCRIPT
-- ==========================================
--
-- VERIFICA POST-ESECUZIONE:
-- 1. Controlla che tutte le policies siano state create
-- 2. Testa che gli utenti possano solo modificare i propri dati
-- 3. Verifica che le query funzionino correttamente
--
-- NOTA:
-- Le policies qui implementate seguono il principio "deny by default"
-- e permettono solo operazioni esplicite e verificate.
-- ==========================================
