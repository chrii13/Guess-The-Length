-- Script per fixare i profili mancanti
-- Esegui questo script se alcuni utenti non hanno un profilo

-- Funzione per creare profili mancanti per utenti esistenti
CREATE OR REPLACE FUNCTION create_missing_profiles()
RETURNS void AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Per ogni utente che non ha un profilo, creane uno
  FOR user_record IN 
    SELECT u.id, u.email, u.raw_user_meta_data
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    WHERE p.id IS NULL
  LOOP
    INSERT INTO public.profiles (id, username)
    VALUES (
      user_record.id,
      COALESCE(
        user_record.raw_user_meta_data->>'username',
        split_part(user_record.email, '@', 1)
      )
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
  
  RAISE NOTICE 'Profili mancanti creati con successo';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Esegui la funzione per creare i profili mancanti
SELECT create_missing_profiles();

-- Verifica che tutti gli utenti abbiano un profilo
SELECT 
  u.id,
  u.email,
  p.username,
  CASE WHEN p.id IS NULL THEN 'PROFILO MANCANTE' ELSE 'OK' END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

