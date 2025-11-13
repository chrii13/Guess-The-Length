# 🗑️ Guida per Eliminare Account e Dati Utente

Questa guida spiega come eliminare account registrati e tutti i dati associati dal database Supabase.

## ⚠️ ATTENZIONE

**Eliminare account e dati è un'operazione PERMANENTE e IRREVERSIBILE!**
Assicurati di avere un backup se necessario.

## 🎯 Metodi per Eliminare Account

### Metodo 1: Eliminare un Singolo Account (Raccomandato)

#### Passo 1: Trova l'ID dell'Utente

1. Vai su Supabase → **Authentication** → **Users**
2. Trova l'utente che vuoi eliminare
3. Copia l'**User ID** (UUID)

#### Passo 2: Esegui lo Script SQL

1. Vai su **SQL Editor** in Supabase
2. Esegui questo script (sostituisci `USER_ID_HERE` con l'ID dell'utente):

```sql
-- Sostituisci 'USER_ID_HERE' con l'ID dell'utente da eliminare
DO $$
DECLARE
  user_id_to_delete UUID := 'USER_ID_HERE';
BEGIN
  -- Elimina i punteggi (sarà eliminato automaticamente per CASCADE, ma lo facciamo esplicitamente)
  DELETE FROM public.scores WHERE user_id = user_id_to_delete;
  
  -- Elimina il profilo (sarà eliminato automaticamente per CASCADE, ma lo facciamo esplicitamente)
  DELETE FROM public.profiles WHERE id = user_id_to_delete;
  
  -- Elimina l'utente da auth.users (questo elimina tutto automaticamente)
  DELETE FROM auth.users WHERE id = user_id_to_delete;
  
  RAISE NOTICE 'Utente % eliminato con successo', user_id_to_delete;
END $$;
```

#### Passo 3: Verifica l'Eliminazione

```sql
-- Verifica che l'utente non esista più
SELECT * FROM auth.users WHERE id = 'USER_ID_HERE';
SELECT * FROM public.profiles WHERE id = 'USER_ID_HERE';
SELECT * FROM public.scores WHERE user_id = 'USER_ID_HERE';
```

### Metodo 2: Eliminare Tutti gli Account (ATTENZIONE!)

⚠️ **QUESTO ELIMINA TUTTI GLI UTENTI E TUTTI I DATI!**

```sql
-- ELIMINA TUTTI I DATI - USARE CON ESTREMA CAUTELA!
DO $$
BEGIN
  -- Elimina tutti i punteggi
  DELETE FROM public.scores;
  
  -- Elimina tutti i profili
  DELETE FROM public.profiles;
  
  -- Elimina tutti gli utenti (questo richiede privilegi admin)
  -- NOTA: Potrebbe non funzionare a causa delle policy RLS
  -- Potrebbe essere necessario disabilitare RLS temporaneamente
  
  RAISE NOTICE 'Tutti i dati sono stati eliminati';
END $$;
```

### Metodo 3: Eliminare Account per Email

Se conosci l'email dell'utente ma non l'ID:

```sql
-- Sostituisci 'user@example.com' con l'email dell'utente
DO $$
DECLARE
  user_email TEXT := 'user@example.com';
  user_id_to_delete UUID;
BEGIN
  -- Trova l'ID dell'utente dall'email
  SELECT id INTO user_id_to_delete 
  FROM auth.users 
  WHERE email = user_email;
  
  IF user_id_to_delete IS NULL THEN
    RAISE EXCEPTION 'Utente con email % non trovato', user_email;
  END IF;
  
  -- Elimina i punteggi
  DELETE FROM public.scores WHERE user_id = user_id_to_delete;
  
  -- Elimina il profilo
  DELETE FROM public.profiles WHERE id = user_id_to_delete;
  
  -- Elimina l'utente
  DELETE FROM auth.users WHERE id = user_id_to_delete;
  
  RAISE NOTICE 'Utente % (email: %) eliminato con successo', user_id_to_delete, user_email;
END $$;
```

## 🔧 Risoluzione Problemi

### Problema: "permission denied for table auth.users"

Se ricevi questo errore, devi disabilitare temporaneamente RLS o usare un account con privilegi admin.

**Soluzione 1: Usa l'API Admin di Supabase**

Usa l'API Admin invece dello SQL Editor:

```javascript
// In Node.js o in un ambiente server
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Usa la service role key, non l'anon key
)

// Elimina l'utente
const { data, error } = await supabaseAdmin.auth.admin.deleteUser('USER_ID_HERE')
```

**Soluzione 2: Disabilita RLS Temporaneamente**

```sql
-- DISABILITA RLS (solo per admin)
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

-- Esegui le eliminazioni
DELETE FROM auth.users WHERE id = 'USER_ID_HERE';

-- RIABILITA RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
```

### Problema: "foreign key constraint"

Se ricevi errori di foreign key, assicurati di eliminare i dati nell'ordine corretto:

1. Prima elimina i punteggi
2. Poi elimina i profili
3. Infine elimina l'utente

## 📋 Script Completo per Reset Completo

Se vuoi resettare completamente il database per testare:

```sql
-- RESET COMPLETO DEL DATABASE
-- ATTENZIONE: Questo elimina TUTTI i dati!

BEGIN;

-- Disabilita RLS temporaneamente
ALTER TABLE public.scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Elimina tutti i punteggi
TRUNCATE TABLE public.scores CASCADE;

-- Elimina tutti i profili
TRUNCATE TABLE public.profiles CASCADE;

-- Elimina tutti gli utenti (richiede privilegi admin)
-- Nota: Potrebbe non funzionare se non hai i privilegi necessari
DELETE FROM auth.users;

-- Riabilita RLS
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

COMMIT;

-- Verifica che tutto sia stato eliminato
SELECT COUNT(*) FROM public.scores; -- Dovrebbe essere 0
SELECT COUNT(*) FROM public.profiles; -- Dovrebbe essere 0
SELECT COUNT(*) FROM auth.users; -- Dovrebbe essere 0
```

## 🔍 Verifica Dati Esistenti

Prima di eliminare, puoi verificare quali dati esistono:

```sql
-- Visualizza tutti gli utenti
SELECT id, email, created_at FROM auth.users;

-- Visualizza tutti i profili
SELECT id, username, created_at FROM public.profiles;

-- Visualizza tutti i punteggi
SELECT user_id, best_score, created_at FROM public.scores;

-- Visualizza utenti con i loro punteggi
SELECT 
  u.email,
  p.username,
  s.best_score
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.scores s ON u.id = s.user_id
ORDER BY s.best_score ASC NULLS LAST;
```

## 📝 Note Importanti

1. **Backup**: Prima di eliminare dati importanti, fai sempre un backup
2. **CASCADE**: Le eliminazioni sono configurate con CASCADE, quindi eliminare un utente elimina automaticamente i suoi punteggi e profilo
3. **RLS**: Le policy Row Level Security potrebbero impedire alcune operazioni. Potrebbe essere necessario disabilitarle temporaneamente
4. **Service Role Key**: Per operazioni amministrative, usa la Service Role Key invece dell'Anon Key
5. **Test**: Testa sempre le operazioni di eliminazione su un ambiente di test prima di usarle in produzione

## 🚀 Eliminazione Rapida per Test

Se vuoi solo eliminare rapidamente un utente per testare la registrazione:

1. Vai su Supabase → **Authentication** → **Users**
2. Clicca sui tre puntini accanto all'utente
3. Seleziona **"Delete user"**
4. Conferma l'eliminazione

Questo elimina automaticamente:
- L'utente da `auth.users`
- Il profilo da `profiles` (tramite CASCADE)
- I punteggi da `scores` (tramite CASCADE)

## 📞 Supporto

Per problemi o domande:
- Email: christianpetrone5775@gmail.com
- Controlla la documentazione Supabase: https://supabase.com/docs

---

**Ultima modifica:** $(date)

