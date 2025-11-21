# 📚 Documentazione Completa - Guess the Length

## 🚀 Setup Iniziale

### Prerequisiti
- Node.js 18+ installato
- Account Supabase (gratuito)
- Git (opzionale, per GitHub)

### 1. Installa Dipendenze
```bash
npm install
```

### 2. Configura Supabase

#### Crea un Progetto Supabase
1. Vai su [supabase.com](https://supabase.com) e crea un account
2. Crea un nuovo progetto chiamato "Guess the Length"
3. Aspetta 2-3 minuti che il progetto sia pronto

#### Configura il Database
Esegui questi script SQL nell'ordine (SQL Editor → New Query):

1. **`supabase-setup.sql`** - Crea tabelle base (profiles, scores)
2. **`supabase-add-game-sessions.sql`** - Aggiunge tabella game_sessions
3. **`supabase-fix-profiles.sql`** - Correzioni profili (se necessario)
4. **`supabase-rls-security.sql`** - Configura RLS sicure

#### Ottieni le Chiavi API
1. Vai su **Settings** → **API** nel tuo progetto Supabase
2. Copia questi valori:
   - **Project URL** (es. `https://xxxxx.supabase.co`)
   - **anon public key** (chiave lunga che inizia con `eyJ...`)
   - **service_role key** (chiave lunga nella sezione "service_role" - ⚠️ PRIVATA!)

### 3. Configura Variabili d'Ambiente

Crea il file `.env.local` nella root del progetto:

**Windows (PowerShell):**
```powershell
Copy-Item env.example.txt .env.local
```

**Windows (CMD):**
```cmd
copy env.example.txt .env.local
```

**Mac/Linux:**
```bash
cp env.example.txt .env.local
```

Apri `.env.local` e configura:

```env
# Supabase (OBBLIGATORIE)
NEXT_PUBLIC_SUPABASE_URL=https://tuo-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Rate Limiting (Opzionali - default sicuri)
API_RATE_LIMIT_MAX_REQUESTS=10
API_RATE_LIMIT_WINDOW_MS=60000
API_MAX_BODY_SIZE=1048576

# Rate Limiting Check Email (Opzionali)
API_CHECK_EMAIL_RATE_LIMIT_MAX_REQUESTS=10
API_CHECK_EMAIL_RATE_LIMIT_WINDOW_MS=60000
API_CHECK_EMAIL_MAX_BODY_SIZE=1024
```

⚠️ **IMPORTANTE**: 
- `SUPABASE_SERVICE_ROLE_KEY` è PRIVATA - non condividerla!
- NON committare `.env.local` nel repository!
- Aggiungi `.env.local` al `.gitignore`

### 4. Avvia il Server
```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000)

---

## 📧 Personalizzazione Email Verifica

### Setup Email Template Supabase
1. Vai su **Settings** → **Auth** → **Email Templates**
2. Modifica template **"Confirm signup"**

**Subject:**
```
Benvenuto in Guess the Length! Verifica la tua email
```

**Body (HTML):**
```html
<h2>Benvenuto in Guess the Length! 🎮📏</h2>

<p>Ciao!</p>

<p>Grazie per esserti registrato a Guess the Length. Per completare la registrazione, verifica la tua email cliccando sul pulsante qui sotto:</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
    Verifica Email
  </a>
</p>

<p>Oppure copia e incolla questo link nel browser:</p>
<p><a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>

<p><strong>Goditi il gioco, e allungalo bene! 📏</strong></p>

<p>Saluti,<br>Christian</p>

<hr>
<p style="color: #666; font-size: 12px;">
  Se non hai richiesto questa email, puoi ignorarla in sicurezza.
</p>
```

**Variabili disponibili:**
- `{{ .ConfirmationURL }}` - Link di conferma
- `{{ .Email }}` - Email dell'utente
- `{{ .Token }}` - Token di conferma

---

## 🔒 Sicurezza Implementata

### Protezioni Attive

1. **XSS Protection**
   - Sanitizzazione input con DOMPurify
   - Validazione stringhe prima del rendering
   - Content Security Policy (CSP) headers

2. **SQL Injection Protection**
   - Query parametrizzate (Supabase automatico)
   - Validazione input con regex
   - RLS policies sul database

3. **CSRF Protection**
   - Verifica Origin/Referer headers
   - Middleware globale per API routes

4. **Rate Limiting**
   - Limitazione richieste per IP
   - Configurabile via variabili ambiente
   - Headers di rate limiting nelle risposte

5. **Input Sanitization**
   - Sanitizzazione automatica di tutti gli input
   - Validazione email, username, password
   - Rimozione caratteri pericolosi

6. **RLS (Row Level Security)**
   - Policies PostgreSQL per accesso dati
   - Protezione contro accessi non autorizzati
   - Triggers per validazione dati

### Headers di Sicurezza
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security
- Content-Security-Policy
- Referrer-Policy: strict-origin-when-cross-origin

---

## 🧪 Test di Sicurezza

### Eseguire i Test
```bash
npm test                    # Tutti i test
npm run test:security       # Solo test di sicurezza
npm run test:watch          # Test in modalità watch
```

### Test Disponibili
- **XSS Tests** - Verifica sanitizzazione XSS
- **SQL Injection Tests** - Verifica protezione SQL injection
- **Rate Limiting Tests** - Verifica rate limiting
- **API Authentication Tests** - Verifica autenticazione API (richiede server)

**Nota**: I test API richiedono il server Next.js in esecuzione (`npm run dev`)

---

## 🔑 Variabili d'Ambiente

### Obbligatorie
| Variabile | Tipo | Descrizione |
|-----------|------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | String | URL progetto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | String | Chiave pubblica Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | String | Chiave privata Supabase (solo server) |

### Opzionali (con default)
| Variabile | Default | Descrizione |
|-----------|---------|-------------|
| `API_RATE_LIMIT_MAX_REQUESTS` | `10` | Max richieste per finestra |
| `API_RATE_LIMIT_WINDOW_MS` | `60000` | Finestra temporale (ms) |
| `API_MAX_BODY_SIZE` | `1048576` | Max body size (bytes) |
| `API_CHECK_EMAIL_RATE_LIMIT_MAX_REQUESTS` | `10` | Rate limit check-email |
| `API_CHECK_EMAIL_RATE_LIMIT_WINDOW_MS` | `60000` | Window check-email |
| `API_CHECK_EMAIL_MAX_BODY_SIZE` | `1024` | Max body check-email |

### Note Importanti
- Chiavi con `NEXT_PUBLIC_` sono esposte al client (protette da RLS)
- Chiavi senza `NEXT_PUBLIC_` sono solo server-side
- `SUPABASE_SERVICE_ROLE_KEY` è PRIVATA - non condividerla!

---

## 📁 Struttura Progetto

```
guess-the-length/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   └── check-email/   # Endpoint verifica email
│   ├── page.tsx           # Home page
│   ├── play/              # Pagina di gioco
│   ├── result/            # Pagina risultato
│   ├── login/             # Login
│   ├── register/          # Registrazione
│   ├── profile/           # Profilo utente
│   └── leaderboard/       # Classifica
├── components/            # Componenti React
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── Meter.tsx          # Metro interattivo
│   └── ...
├── lib/                   # Utilities e logica
│   ├── supabase.ts        # Client Supabase
│   ├── api-security.ts    # Protezioni API
│   ├── sanitize.ts        # Sanitizzazione input
│   ├── validation.ts      # Validazione input
│   ├── rate-limit.ts      # Rate limiting
│   └── ...
├── __tests__/             # Test di sicurezza
│   └── security/
├── middleware.ts          # Middleware globale (headers, CSRF)
├── supabase-*.sql         # Script SQL per database
├── env.example.txt        # Template variabili ambiente
└── README.md              # Documentazione principale
```

---

## 🛠️ Comandi Utili

```bash
# Sviluppo
npm run dev                # Avvia server di sviluppo
npm run build              # Build produzione
npm run start              # Avvia server produzione
npm run lint               # Linting codice

# Test
npm test                   # Esegui tutti i test
npm run test:security      # Solo test di sicurezza
npm run test:watch         # Test in modalità watch
```

---

## 📦 Deploy su Vercel

### 1. Prepara il Progetto
```bash
npm run build  # Verifica che il build funzioni
```

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
2. Clicca **"Add New Project"**
3. Importa il repository GitHub
4. Nella sezione **Environment Variables**, aggiungi:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - (Opzionale) Variabili rate limiting
5. Clicca **Deploy**

### 4. Configurazione Post-Deploy
- Verifica che le variabili d'ambiente siano configurate
- Verifica che il database Supabase abbia le tabelle create
- Verifica che le RLS policies siano attive

---

## 🐛 Troubleshooting

### Errore: "Missing Supabase environment variables"
- Controlla che `.env.local` esista e contenga le chiavi corrette
- Riavvia il server dopo aver modificato `.env.local`

### Errore: "relation does not exist"
- Esegui gli script SQL in Supabase SQL Editor nell'ordine corretto

### Errore di autenticazione
- Verifica che le RLS policies siano configurate correttamente
- Controlla che l'utente sia autenticato prima di accedere alle pagine protette

### Test falliscono
- Assicurati che le dipendenze siano installate (`npm install`)
- Per test API, avvia il server (`npm run dev`)

---

## 📝 Note Tecniche

- **Calibrazione automatica**: Il sistema calibra automaticamente il rapporto pixel/cm usando le dimensioni CSS reali del browser
- **LocalStorage**: Il tema e la calibrazione sono salvati in localStorage
- **RLS**: Le Row Level Security policies proteggono i dati nel database
- **Rate Limiting**: In produzione, considera Redis per rate limiting distribuito
- **Email**: Configura il template email in Supabase per personalizzazione

---

## 🔐 File da Non Committare

Assicurati che questi file siano nel `.gitignore`:
- `.env.local` - Variabili ambiente locali
- `node_modules/` - Dipendenze
- `.next/` - Build Next.js
- `*.log` - File di log

---

**Ultimo aggiornamento**: 2024-11-19

