# Test di Sicurezza

Questa directory contiene una suite completa di test automatici per verificare la sicurezza dell'applicazione.

## Struttura

- `xss.test.ts` - Test per vulnerabilità XSS (Cross-Site Scripting)
- `sql-injection.test.ts` - Test per vulnerabilità SQL Injection
- `api-auth.test.ts` - Test per autenticazione API e CSRF protection
- `rate-limit.test.ts` - Test per rate limiting
- `payloads.ts` - Payload di attacco per i test
- `security.suite.test.ts` - Test suite completa e report

## Esecuzione

### Eseguire tutti i test di sicurezza

```bash
npm run test:security
```

### Eseguire un singolo file di test

```bash
npm test xss.test.ts
npm test sql-injection.test.ts
npm test api-auth.test.ts
npm test rate-limit.test.ts
```

### Eseguire tutti i test in modalità watch

```bash
npm run test:watch
```

## Requisiti

Prima di eseguire i test, assicurati di avere:

1. Le dipendenze installate: `npm install`
2. Il server di sviluppo in esecuzione (per i test delle API): `npm run dev`
3. Le variabili d'ambiente configurate in `.env.local`

## Tipi di Test

### 1. Test XSS

Verifica che:
- Gli input siano sanitizzati correttamente
- I payload XSS non vengano eseguiti
- DOMPurify funzioni correttamente
- SVG e altri contenuti dinamici siano sicuri

### 2. Test SQL Injection

Verifica che:
- Gli input siano validati prima delle query database
- I payload SQL injection vengano rifiutati
- Le query siano parametrizzate (Supabase lo fa automaticamente)
- Le RLS policies proteggano il database

### 3. Test API Authentication

Verifica che:
- Le API routes richiedano Content-Type valido
- Il rate limiting funzioni
- La protezione CSRF funzioni
- I limiti di dimensione body siano rispettati
- Gli errori non rivelino informazioni sensibili

### 4. Test Rate Limiting

Verifica che:
- Il rate limiting blocchi richieste eccessive
- I limiti siano rispettati per IP
- I reset window funzionino correttamente
- Gli header di rate limiting siano corretti

## Payload di Test

I payload in `payloads.ts` includono:

- **XSS Payloads**: 50+ varianti di attacchi XSS
- **SQL Injection Payloads**: 30+ varianti di attacchi SQL injection
- **NoSQL Injection Payloads**: Per testare database NoSQL (se applicabile)
- **Command Injection Payloads**: Per testare injection di comandi
- **Path Traversal Payloads**: Per testare directory traversal
- **CSRF Payloads**: Per testare protezione CSRF

## Note

- I test possono richiedere il server di sviluppo in esecuzione
- Alcuni test potrebbero fallire in ambiente di test se le configurazioni sono diverse
- I test di rate limiting potrebbero richiedere attesa per i reset window
- Assicurati che le variabili d'ambiente siano configurate correttamente

## Integrazione CI/CD

Questi test possono essere integrati in una pipeline CI/CD:

```yaml
# Esempio per GitHub Actions
- name: Run security tests
  run: npm run test:security
```

## Report dei Test

Dopo l'esecuzione, vedrai un report dettagliato di tutti i test:

- Test passati/falliti
- Coverage delle funzioni di sicurezza
- Tempo di esecuzione
- Dettagli degli errori

## Mantenimento

Aggiorna regolarmente:
- I payload di test con nuove tecniche di attacco
- Le funzioni di sicurezza quando vengono modificate
- I test quando vengono aggiunte nuove funzionalità


