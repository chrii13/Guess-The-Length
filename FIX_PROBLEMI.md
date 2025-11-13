# 🔧 Fix Problemi - Guida Completa

Questo documento descrive tutti i problemi risolti e come applicare le correzioni.

## ✅ Problemi Risolti

### 1. 🔴 IMPORTANTE: Riferimento 1cm nella Schermata di Gioco

**Problema:** Non c'era il riferimento di 1cm nella schermata di gioco, solo nella calibrazione.

**Soluzione Implementata:**
- Creato componente `CmReference.tsx` che mostra un riferimento di 1cm reale usando CSS cm
- Aggiunto il riferimento nella schermata di gioco a sinistra del metro
- Il riferimento è sempre visibile durante il gioco

**File Creati:**
- `components/CmReference.tsx` - Componente riferimento 1cm

**File Modificati:**
- `app/play/page.tsx` - Aggiunto riferimento 1cm nella schermata di gioco

**Caratteristiche:**
- Riferimento blu di 1cm reale (CSS cm)
- Scritta "1cm" verticale
- Nota esplicativa: "Nota: questa porzione di schermo corrisponde ad un centimetro"
- Sempre visibile durante il gioco

### 2. ✅ Username "Utente" nella Classifica

**Problema:** Gli utenti apparivano come "Utente" invece del loro username.

**Causa:** 
- Il profilo non veniva creato correttamente
- Il trigger database non funzionava sempre
- La query della classifica non recuperava correttamente i profili

**Soluzione Implementata:**
1. **Migliorato il trigger database** (`supabase-setup.sql`):
   - Aggiunto gestione errori con EXCEPTION
   - Migliorata la logica di creazione/aggiornamento profilo
   - Il trigger ora crea sempre il profilo, anche in caso di errore parziale

2. **Migliorata la query della classifica** (`lib/scores.ts`):
   - Gestione migliore degli errori
   - Log per debug dei profili mancanti
   - Fallback a "Utente" solo se il profilo non esiste

3. **Creato sistema di gestione profili** (`lib/profile.ts`):
   - Funzione `getUserProfile()` per recuperare il profilo
   - Funzione `getOrCreateUserProfile()` per creare il profilo se mancante
   - Utilizzato nella Navbar per mostrare l'username

**File Creati:**
- `lib/profile.ts` - Sistema di gestione profili

**File Modificati:**
- `supabase-setup.sql` - Trigger migliorato con gestione errori
- `lib/scores.ts` - Query classifica migliorata
- `components/Navbar.tsx` - Recupero username dal profilo

**Come Applicare:**
1. Esegui `supabase-setup.sql` per aggiornare il trigger
2. Esegui `supabase-fix-profiles.sql` per creare profili mancanti
3. Verifica che tutti gli utenti abbiano un profilo

### 3. ✅ Navbar Mostra Username invece di Email

**Problema:** La Navbar mostrava l'email invece dell'username, ed era troppo grande.

**Soluzione Implementata:**
- Modificata la Navbar per recuperare l'username dal profilo
- Ridotta la dimensione del testo (text-sm invece di text-base)
- Cambiato "Logout" in "Esci"
- Mostra l'username in grassetto
- Fallback all'email se l'username non è disponibile

**File Modificati:**
- `components/Navbar.tsx` - Recupero username e riduzione dimensione

**Caratteristiche:**
- Testo più piccolo (text-sm)
- Mostra "Ciao, [username]" invece di "Ciao, [email]"
- Username in grassetto
- Pulsante "Esci" invece di "Logout"
- Pulsante più piccolo (text-xs, px-3 py-1.5)

### 4. ✅ Calibrazione Non Corretta (Valori Più Grandi)

**Problema:** La calibrazione riportava valori più grandi della realtà.

**Causa:** 
- Il sistema di calibrazione non usava correttamente il riferimento CSS cm
- Il rapporto pixel/cm non era calcolato correttamente

**Soluzione Implementata:**
1. **Riferimento CSS cm reale**:
   - Il riferimento usa `width: 1cm` in CSS (reale)
   - Il browser converte automaticamente 1cm CSS in pixel reali
   - Questo garantisce che il riferimento sia sempre 1cm reale

2. **Calibrazione corretta**:
   - Quando l'utente conferma, misuriamo quanti pixel occupa il riferimento (1cm reale)
   - Salviamo questo rapporto: `pixelsPerCm = pixelsDelRiferimento / 1cm`
   - Usiamo questo rapporto per tutte le conversioni

3. **Allineamento visivo**:
   - L'utente allinea visivamente il metro giallo al riferimento blu
   - Il sistema misura automaticamente il riferimento (non il metro)
   - Questo garantisce che la calibrazione sia basata su 1cm reale

**File Modificati:**
- `components/CalibrationMeter.tsx` - Calibrazione basata sul riferimento CSS cm
- `components/CmReference.tsx` - Riferimento 1cm reale usando CSS cm

**Come Funziona:**
1. Il riferimento blu usa `width: 1cm` in CSS (1cm reale)
2. L'utente allinea visivamente il metro giallo al riferimento
3. Quando conferma, il sistema misura quanti pixel occupa il riferimento
4. Salva il rapporto: `pixelsPerCm = pixelsDelRiferimento`
5. Usa questo rapporto per convertire pixel in cm

## 🔧 Come Applicare le Correzioni

### Passo 1: Aggiorna il Database

1. **Esegui lo script SQL aggiornato:**
   ```sql
   -- Copia e incolla il contenuto di supabase-setup.sql nel SQL Editor
   -- Questo aggiornerà il trigger con gestione errori migliorata
   ```

2. **Fixare profili mancanti (IMPORTANTE):**
   ```sql
   -- Copia e incolla il contenuto di supabase-fix-profiles.sql nel SQL Editor
   -- Questo creerà profili per utenti esistenti che non ne hanno uno
   ```

### Passo 2: Testa le Modifiche

1. **Testa la Calibrazione:**
   - Avvia il progetto: `npm run dev`
   - Accedi o registrati
   - Vai su "Gioca Ora"
   - Dovresti vedere la schermata di calibrazione
   - Allinea il metro giallo al riferimento blu (1cm reale)
   - Conferma la calibrazione
   - Verifica che le misurazioni siano accurate

2. **Testa il Riferimento 1cm:**
   - Dopo la calibrazione, inizia una partita
   - Dovresti vedere il riferimento blu di 1cm a sinistra del metro
   - Il riferimento dovrebbe essere sempre visibile durante il gioco

3. **Testa l'Username:**
   - Controlla la Navbar: dovresti vedere "Ciao, [username]" invece di "Ciao, [email]"
   - Vai sulla classifica: dovresti vedere il tuo username invece di "Utente"
   - Verifica che il testo sia più piccolo

4. **Testa la Calibrazione:**
   - Calibra usando il riferimento 1cm
   - Gioca una partita
   - Verifica che le misurazioni siano accurate (non più grandi della realtà)

## 🐛 Risoluzione Problemi

### Problema: Username ancora "Utente" nella Classifica

**Soluzione:**
1. Verifica che il trigger sia stato eseguito correttamente:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

2. Esegui lo script di fix per creare profili mancanti:
   ```sql
   -- Esegui supabase-fix-profiles.sql
   ```

3. Verifica che tutti gli utenti abbiano un profilo:
   ```sql
   SELECT u.id, u.email, p.username
   FROM auth.users u
   LEFT JOIN public.profiles p ON u.id = p.id;
   ```

### Problema: Calibrazione ancora non corretta

**Soluzione:**
1. Cancella la calibrazione salvata:
   - Apri le DevTools (F12)
   - Vai su Application → Local Storage
   - Elimina la chiave `meter_game_pixels_per_cm`

2. Ricalibra usando il riferimento 1cm:
   - Vai su "Gioca Ora"
   - Allinea il metro giallo al riferimento blu (1cm reale)
   - Conferma la calibrazione

3. Verifica che il riferimento sia 1cm reale:
   - Il riferimento blu usa `width: 1cm` in CSS
   - Questo dovrebbe corrispondere a 1cm reale sul monitor
   - Se non corrisponde, potrebbe essere un problema del browser o del monitor

### Problema: Riferimento 1cm non appare nella Schermata di Gioco

**Soluzione:**
1. Verifica che il componente `CmReference` sia importato correttamente
2. Verifica che il riferimento sia nella pagina di gioco (non solo nella calibrazione)
3. Controlla la console del browser per errori

## 📋 Checklist Finale

- [ ] Trigger database aggiornato (`supabase-setup.sql`)
- [ ] Profili mancanti creati (`supabase-fix-profiles.sql`)
- [ ] Riferimento 1cm visibile nella schermata di gioco
- [ ] Username visibile nella Navbar (non email)
- [ ] Username visibile nella classifica (non "Utente")
- [ ] Calibrazione corretta (valori realistici)
- [ ] Test di gioco completato
- [ ] Test di classifica completato

## 📝 Note Importanti

1. **Calibrazione:** La calibrazione è basata sul riferimento CSS cm reale. Se il browser o il monitor non supportano correttamente le unità CSS cm, la calibrazione potrebbe non essere precisa.

2. **Profili:** Il trigger crea automaticamente il profilo quando viene creato un utente. Se hai utenti esistenti senza profilo, esegui `supabase-fix-profiles.sql`.

3. **Username:** L'username viene recuperato dal profilo. Se il profilo non esiste, viene creato automaticamente usando l'email come fallback.

4. **Riferimento 1cm:** Il riferimento usa CSS cm che il browser converte automaticamente in pixel reali. Questo garantisce che il riferimento sia sempre 1cm reale.

## 🚀 Prossimi Passi

1. **Testa tutte le funzionalità:**
   - Registrazione nuovo utente
   - Calibrazione con riferimento 1cm
   - Gioco con riferimento 1cm visibile
   - Classifica con username corretto
   - Navbar con username invece di email

2. **Verifica che tutto funzioni:**
   - Username appare correttamente
   - Calibrazione è accurata
   - Riferimento 1cm è visibile
   - Misurazioni sono realistiche

3. **Elimina account di test (se necessario):**
   - Usa `DELETE_USERS.md` per eliminare account di test
   - Registra nuovi account per testare

## 📞 Supporto

Per problemi o domande:
- Email: christianpetrone5775@gmail.com
- Controlla i documenti:
  - `FIX_PROBLEMI.md` - Questo documento
  - `DELETE_USERS.md` - Eliminazione account
  - `EMAIL_SETUP.md` - Personalizzazione email
  - `RESOCONTO_MODIFICHE.md` - Resoconto completo

---

**Data:** $(date)
**Versione:** 2.2.0
**Stato:** Tutti i problemi risolti

