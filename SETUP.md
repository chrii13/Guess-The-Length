# 🚀 Guida Setup Meter Game

## Passo 1: Verifica Prerequisiti

Apri un terminale (PowerShell o CMD) e verifica:

```bash
node --version
npm --version
```

Se non hai Node.js, scaricalo da [nodejs.org](https://nodejs.org/) (versione LTS).

## Passo 2: Installa le Dipendenze

Apri il terminale nella cartella del progetto e esegui:

```bash
cd "c:\Users\chris\Desktop\Progetti Cursor"
npm install
```

Questo installerà tutte le dipendenze necessarie (Next.js, React, Supabase, Tailwind, ecc.).

## Passo 3: Configura Supabase

### 3.1 Crea un Account e Progetto Supabase

1. Vai su [https://supabase.com](https://supabase.com)
2. Clicca su **"Start your project"** o **"Sign Up"**
3. Crea un account (puoi usare GitHub per velocizzare)
4. Clicca su **"New Project"**
5. Compila i dati:
   - **Name**: Meter Game (o un nome a tua scelta)
   - **Database Password**: scegli una password sicura (SALVALA!)
   - **Region**: scegli la più vicina (es. West Europe)
6. Clicca **"Create new project"**
7. Aspetta 2-3 minuti che il progetto sia pronto

### 3.2 Configura il Database

1. Nel tuo progetto Supabase, vai su **SQL Editor** (icona nel menu laterale)
2. Clicca su **"New query"**
3. Apri il file `supabase-setup.sql` dalla cartella del progetto
4. Copia TUTTO il contenuto del file
5. Incollalo nell'editor SQL di Supabase
6. Clicca **"Run"** (o premi F5)
7. Dovresti vedere "Success. No rows returned"

### 3.3 Ottieni le Chiavi API

1. Nel tuo progetto Supabase, vai su **Settings** (icona ingranaggio)
2. Clicca su **API** nel menu laterale
3. Troverai due valori importanti:
   - **Project URL** (es. `https://abcdefghijklmnop.supabase.co`)
   - **anon public key** (una chiave molto lunga che inizia con `eyJ...`)

## Passo 4: Crea il File .env.local

1. Nella cartella del progetto, crea un nuovo file chiamato `.env.local`
2. Apri il file e incolla questo contenuto:

```env
NEXT_PUBLIC_SUPABASE_URL=il_tuo_project_url_qui
NEXT_PUBLIC_SUPABASE_ANON_KEY=la_tua_anon_key_qui
```

3. Sostituisci:
   - `il_tuo_project_url_qui` con il **Project URL** di Supabase
   - `la_tua_anon_key_qui` con l'**anon public key** di Supabase

**Esempio:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI5MCwiZXhwIjoxOTU0NTQzMjkwfQ.abcdefghijklmnopqrstuvwxyz1234567890
```

⚠️ **IMPORTANTE**: Non condividere mai questo file o le chiavi con nessuno!

## Passo 5: Avvia il Server di Sviluppo

Nel terminale, esegui:

```bash
npm run dev
```

Dovresti vedere un messaggio tipo:
```
  ▲ Next.js 14.0.4
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

## Passo 6: Apri il Browser

Apri il browser e vai su:
```
http://localhost:3000
```

Dovresti vedere la home page del gioco! 🎉

## Passo 7: Testa il Gioco

1. Clicca su **"Registrati"** per creare un account
2. Inserisci email, password e username
3. Dopo la registrazione, clicca su **"Gioca Ora"**
4. Il sistema si calibrerà automaticamente
5. Inizia a giocare!

## 🐛 Problemi Comuni

### Errore: "Missing Supabase environment variables"
- Controlla che il file `.env.local` esista nella root del progetto
- Verifica che le chiavi siano corrette (senza spazi extra)
- Riavvia il server (`Ctrl+C` e poi `npm run dev`)

### Errore: "relation does not exist"
- Vai su Supabase SQL Editor
- Esegui di nuovo lo script `supabase-setup.sql`

### Errore: "Cannot find module"
- Esegui `npm install` di nuovo
- Elimina la cartella `node_modules` e `.next` e riprova

### Il server non si avvia
- Verifica che la porta 3000 non sia già in uso
- Prova a cambiare porta: `npm run dev -- -p 3001`

## ✅ Checklist Finale

- [ ] Node.js installato
- [ ] Dipendenze installate (`npm install`)
- [ ] Progetto Supabase creato
- [ ] Database configurato (script SQL eseguito)
- [ ] File `.env.local` creato con le chiavi corrette
- [ ] Server avviato (`npm run dev`)
- [ ] Gioco accessibile su http://localhost:3000

## 🚀 Pronto per il Deploy?

Quando tutto funziona localmente, puoi pubblicarlo su Vercel seguendo le istruzioni nel README.md!

