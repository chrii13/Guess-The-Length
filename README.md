# 📏 Meter Game

Un gioco web interattivo dove devi allungare un metro giallo realistico per indovinare lunghezze casuali. Pubblicato su Vercel con autenticazione e database gestiti tramite Supabase.

## 🎮 Come Funziona

- Ogni partita ha **3 lunghezze casuali** da indovinare (tra 1.00 e 15.00 cm)
- Per ogni lunghezza hai **2 tentativi**
- Il punteggio è la **somma degli errori migliori** (uno per ogni lunghezza)
- **Obiettivo**: ottenere il punteggio più basso possibile!

## 🚀 Setup Locale

### Prerequisiti

- Node.js 18+ installato
- Account Supabase (gratuito)

### 1. Clona e Installa

```bash
# Installa le dipendenze
npm install
```

### 2. Configura Supabase

#### Crea un progetto Supabase

1. Vai su [supabase.com](https://supabase.com) e crea un account
2. Crea un nuovo progetto
3. Aspetta che il progetto sia pronto (circa 2 minuti)

#### Configura il Database

1. Vai nella sezione **SQL Editor** del tuo progetto Supabase
2. Esegui questo script SQL per creare le tabelle necessarie:

```sql
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

-- Trigger per aggiornare updated_at su scores
CREATE TRIGGER update_scores_updated_at BEFORE UPDATE ON scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Ottieni le chiavi API

1. Vai su **Settings** → **API** nel tuo progetto Supabase
2. Copia:
   - **Project URL** (es. `https://xxxxx.supabase.co`)
   - **anon/public key** (chiave pubblica)

### 3. Configura le Variabili d'Ambiente

Crea un file `.env.local` nella root del progetto:

```env
NEXT_PUBLIC_SUPABASE_URL=il_tuo_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=la_tua_anon_key
```

**Esempio:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Avvia il Server di Sviluppo

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

## 📦 Deploy su Vercel

### Prerequisiti

- Account Vercel (gratuito)
- Progetto Supabase configurato

### 1. Prepara il Progetto

Assicurati che il progetto funzioni localmente prima di fare il deploy.

### 2. Push su GitHub (consigliato)

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 3. Deploy su Vercel

1. Vai su [vercel.com](https://vercel.com) e accedi
2. Clicca su **"Add New Project"**
3. Importa il tuo repository GitHub (o connetti manualmente)
4. Nella sezione **Environment Variables**, aggiungi:
   - `NEXT_PUBLIC_SUPABASE_URL` = il tuo Project URL di Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = la tua anon key di Supabase
5. Clicca **Deploy**

Vercel costruirà e pubblicherà automaticamente il tuo progetto. Riceverai un URL pubblico (es. `https://meter-game.vercel.app`).

### 4. Configurazione Post-Deploy

Dopo il deploy, assicurati che:
- Le variabili d'ambiente siano configurate correttamente
- Il database Supabase abbia le tabelle create (vedi sopra)
- Le policy RLS siano attive

## 🛠️ Tecnologie Utilizzate

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipizzazione statica
- **Tailwind CSS** - Styling utility-first
- **Supabase** - Backend as a Service (Auth + Database)
- **Vercel** - Hosting e deploy

## 📁 Struttura del Progetto

```
meter-game/
├── app/                    # App Router di Next.js
│   ├── page.tsx           # Home page
│   ├── play/              # Pagina di gioco
│   ├── result/            # Pagina risultato
│   ├── login/             # Login
│   ├── register/          # Registrazione
│   └── leaderboard/       # Classifica
├── components/            # Componenti React
│   ├── AuthProvider.tsx   # Provider autenticazione
│   ├── Meter.tsx          # Componente metro interattivo
│   └── Navbar.tsx         # Barra di navigazione
├── lib/                   # Utilities e configurazioni
│   ├── supabase.ts        # Client Supabase
│   ├── game.ts            # Logica di gioco
│   └── scores.ts          # Funzioni database punteggi
└── README.md
```

## 🎯 Funzionalità

- ✅ Autenticazione utente (registrazione/login)
- ✅ Gioco interattivo con metro allungabile
- ✅ Sistema di punteggi con salvataggio automatico
- ✅ Classifica globale
- ✅ Design responsive e moderno
- ✅ Pronto per produzione

## 🐛 Troubleshooting

### Errore: "Missing Supabase environment variables"
- Controlla che il file `.env.local` esista e contenga le chiavi corrette
- Riavvia il server di sviluppo dopo aver modificato `.env.local`

### Errore: "relation does not exist"
- Esegui lo script SQL nel SQL Editor di Supabase per creare le tabelle

### Errore di autenticazione
- Verifica che le policy RLS siano configurate correttamente
- Controlla che l'utente sia autenticato prima di accedere alle pagine protette

## 📝 Note

- Il metro è calibrato a 37.8 pixel per centimetro (96 DPI standard)
- I punteggi sono salvati automaticamente alla fine di ogni partita
- Solo il miglior punteggio di ogni utente viene mantenuto nel database

## 📄 Licenza

Questo progetto è open source e disponibile per uso personale e commerciale.

---

Buon divertimento! 🎮📏

