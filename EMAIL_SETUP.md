# 📧 Personalizzazione Email di Verifica Supabase

Questa guida spiega come personalizzare l'email di verifica che viene inviata agli utenti quando si registrano.

## 🎯 Personalizzazione Email

### Passo 1: Accedi a Supabase

1. Vai sul tuo progetto Supabase
2. Vai su **Settings** (icona ingranaggio) → **Auth** → **Email Templates**

### Passo 2: Modifica il Template "Confirm signup"

1. Trova il template **"Confirm signup"** nella lista
2. Clicca su **"Edit template"**

### Passo 3: Personalizza il Contenuto

Sostituisci il contenuto con questo:

**Subject (Oggetto):**
```
Benvenuto in Meter Game! Verifica la tua email
```

**Body (Corpo):**
```html
<h2>Benvenuto in Meter Game! 🎮📏</h2>

<p>Ciao!</p>

<p>Grazie per esserti registrato a Meter Game. Per completare la registrazione, verifica la tua email cliccando sul pulsante qui sotto:</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
    Verifica Email
  </a>
</p>

<p>Oppure copia e incolla questo link nel browser:</p>
<p><a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>

<p><strong>Goditi il gioco, e allungalo bene! 📏</strong></p>

<p>Saluti,<br>
Christian</p>

<hr>
<p style="color: #666; font-size: 12px;">
  Se non hai richiesto questa email, puoi ignorarla in sicurezza.
</p>
```

### Passo 4: Variabili Disponibili

Nel template puoi usare queste variabili:
- `{{ .ConfirmationURL }}` - Link di conferma
- `{{ .Email }}` - Email dell'utente
- `{{ .Token }}` - Token di conferma (se necessario)
- `{{ .TokenHash }}` - Hash del token

### Passo 5: Salva le Modifiche

1. Clicca su **"Save"** per salvare il template
2. Le nuove email useranno questo template personalizzato

## 🎨 Personalizzazione Avanzata

### Aggiungere Logo o Immagini

Puoi aggiungere immagini usando tag HTML standard:

```html
<img src="https://tuo-dominio.com/logo.png" alt="Meter Game Logo" style="max-width: 200px;">
```

### Stili CSS Inline

Usa stili CSS inline per personalizzare l'aspetto:

```html
<div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px;">
  <p style="color: #1F2937; font-family: Arial, sans-serif;">
    Il tuo contenuto qui
  </p>
</div>
```

## ✅ Test

Per testare l'email personalizzata:

1. Registra un nuovo utente con un'email valida
2. Controlla la casella di posta
3. Verifica che l'email contenga il contenuto personalizzato

## 📝 Note

- Le modifiche al template si applicano solo alle nuove registrazioni
- Assicurati di mantenere `{{ .ConfirmationURL }}` nel template, altrimenti gli utenti non potranno verificare l'email
- Puoi anche personalizzare altri template (password reset, magic link, ecc.)

## 🔗 Link Utili

- [Documentazione Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase Auth Settings](https://supabase.com/dashboard/project/_/auth/settings)

---

**Nota:** Se hai già utenti registrati prima della personalizzazione, le loro email di verifica useranno il vecchio template. Solo i nuovi utenti vedranno il template personalizzato.

