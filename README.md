# 📏 Guess the Length

<div align="center">

**Un gioco web interattivo in cui l'obiettivo è allungare il metro per indovinare lunghezze casuali**

[![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.39.0-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 📖 Descrizione

Gioco web interattivo dove l'obiettivo è indovinare lunghezze casuali utilizzando un metro. Ogni partita presenta 3 lunghezze da indovinare (1.00-15.00 cm) con 2 tentativi ciascuna. Il punteggio è la somma degli errori migliori - obiettivo: ottenere il punteggio più basso possibile!

**Caratteristiche:**
- 🎮 3 lunghezze per partita, 2 tentativi ciascuna
- 🔐 Autenticazione completa con Supabase
- 📊 Classifica globale e statistiche personali
- 🎨 Design moderno con Dark Mode
- 🔒 Sicurezza completa (XSS, SQL Injection, CSRF, Rate Limiting)
- 📱 Responsive e ottimizzato per mobile

---

## 📁 Struttura del Progetto

```
guess-the-length/
├── app/              # Next.js App Router (pages & API routes)
├── components/       # Componenti React riutilizzabili
├── lib/              # Utilities (supabase, game logic, security)
├── hooks/            # Custom React Hooks
├── __tests__/        # Test automatici (security, API)
├── public/assets/    # Asset statici (SVG)
└── *.sql             # Script SQL per database Supabase
```

---

## 📋 Prerequisiti

- **Node.js** 18.0+ ([scarica](https://nodejs.org/))
- **npm** 9.0+ (incluso con Node.js)
- **Account Supabase** ([gratuito](https://supabase.com))

---

## 🚀 Installazione

### 1. Clona e Installa

```bash
git clone https://github.com/tuo-username/guess-the-length.git
cd guess-the-length
npm install
```

### 2. Configura Supabase

1. Crea un progetto su [supabase.com](https://supabase.com)
2. Nel **SQL Editor**, esegui gli script nell'ordine:
   - `supabase-setup.sql` - Tabelle base
   - `supabase-add-game-sessions.sql` - Tabella sessioni
   - `supabase-rls-security.sql` - RLS policies
3. Vai su **Settings → API** e copia:
   - **Project URL**
   - **anon public key**
   - **service_role key** (⚠️ PRIVATA)

### 3. Configura Variabili d'Ambiente

Crea `.env.local` nella root:

```env
# OBBLIGATORIE
NEXT_PUBLIC_SUPABASE_URL=https://tuo-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Opzionali (con default)
API_RATE_LIMIT_MAX_REQUESTS=10
API_RATE_LIMIT_WINDOW_MS=60000
```

### 4. Avvia il Server

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000)

### Test su Telefono in Locale

Per provare l'app dal telefono sulla stessa rete Wi-Fi:

```bash
npm run dev:host
```

Poi trova l'indirizzo IP locale del PC:

```powershell
ipconfig
```

Sul telefono apri `http://IP_DEL_PC:3000`, ad esempio `http://192.168.1.20:3000`.

Nota PWA: su rete locale HTTP puoi testare navigazione, login, gioco e layout mobile. La registrazione completa del service worker e l'installazione PWA richiedono un contesto sicuro: `localhost`, HTTPS, oppure un deploy/tunnel HTTPS.

---

## 🎮 Come Giocare

1. **Registrati** su `/register` e verifica l'email
2. **Calibra** il monitor (prima volta) - allinea il metro con il riferimento di 1 cm
3. **Gioca** - indovina 3 lunghezze casuali trascinando il metro giallo
4. Hai **2 tentativi** per ogni lunghezza - obiettivo: errore minimo!

**Nota**: Durante il gioco non puoi vedere la lunghezza attuale del metro - devi indovinare ad occhio!

---

## ⚙️ Configurazione

### Variabili d'Ambiente

| Variabile | Obbligatoria | Descrizione |
|-----------|--------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL progetto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Chiave pubblica Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Chiave privata (server-side) |
| `API_RATE_LIMIT_MAX_REQUESTS` | ❌ | Max richieste per finestra (default: 10) |
| `API_RATE_LIMIT_WINDOW_MS` | ❌ | Finestra temporale in ms (default: 60000) |

⚠️ **Importante**: `SUPABASE_SERVICE_ROLE_KEY` è PRIVATA - non condividerla! Non committare `.env.local`.

---

## 🛠️ Tecnologie

- **Frontend**: Next.js 14, React 18, TypeScript 5, Tailwind CSS 3.3
- **Backend**: Supabase (Auth + PostgreSQL con RLS)
- **PWA**: manifest installabile, service worker online-first, supporto home screen mobile
- **Sicurezza**: DOMPurify, CSRF Protection, Rate Limiting, Security Headers
- **Testing**: Jest 29 con suite test di sicurezza
- **Deploy**: Vercel (consigliato)

---

## 🧪 Testing

```bash
npm test                 # Tutti i test
npm run test:security    # Solo test di sicurezza
npm run test:watch       # Watch mode
```

**Nota**: I test API richiedono il server in esecuzione (`npm run dev`).

---

## 📦 Deploy su Vercel

1. **Verifica build**: `npm run build`
2. **Push su GitHub** (consigliato)
3. **Importa su Vercel**: [vercel.com](https://vercel.com)
4. **Configura Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. **Deploy** - Vercel farà il resto!

---

## 🗺️ Roadmap

### Funzionalità Future
- [ ] Modalità Multiplayer
- [ ] Statistiche dettagliate con grafici
- [ ] Achievement System
- [ ] Supporto multi-lingua

### Miglioramenti Tecnici
- [ ] Redis per Rate Limiting distribuito
- [ ] Analytics e Error Tracking
- [ ] PWA Support
- [ ] SEO Optimization

---

## 🤝 Contributi

I contributi sono benvenuti!

1. **Fork** il repository
2. **Crea** un branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** (`git commit -m 'Add AmazingFeature'`)
4. **Push** (`git push origin feature/AmazingFeature`)
5. **Apri** una Pull Request

**Linee Guida:**
- Segui lo stile di codice esistente
- Aggiungi test per nuove funzionalità
- Assicurati che i test passino (`npm test`)
- Aggiorna la documentazione se necessario

---

## 📄 Licenza

Progetto open source disponibile per uso personale e commerciale.

---

## 👤 Autore

**Christian Petrone** - christianpetrone03@gmail.com

---

## 📚 Documentazione

Per dettagli tecnici completi, consulta:
- **[DOCUMENTAZIONE_COMPLETA.md](./DOCUMENTAZIONE_COMPLETA.md)** - Guida tecnica completa
- **[__tests__/security/README.md](./__tests__/security/README.md)** - Documentazione test di sicurezza

---

<div align="center">

**Fatto con ❤️ usando Next.js, React e Supabase**

⭐ **Se ti piace il progetto, lascia una stella!** ⭐

</div>
