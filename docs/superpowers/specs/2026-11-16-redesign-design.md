# Redesign grafico di Guess the Length

Data: 2026-11-16. Branch: `redesign`.

## Intento

L'interfaccia attuale è un template generico (card gialle, gradienti, icone che pulsano) in cui il metro, cioè il gioco, è l'elemento meno curato. Il redesign rifà l'identità da zero: il metro diventa l'unico elemento disegnato, tutto il resto è tipografia e spazio. Richiesta esplicita dell'utente: grafica **dinamica e pulita, con animazioni belle da vedere**.

## Obiettivi

- Il metro è il protagonista in home, partita e risultato.
- Un solo sistema visivo (colori, carattere, bottoni, liste) su tutte le pagine.
- Animazioni che nascono dal metro e dai numeri, non effetti generici.
- Tema chiaro e scuro, mobile prima di tutto, focus da tastiera visibile, `prefers-reduced-motion` rispettato.

## Non obiettivi

- Nessuna modifica a logica di gioco, punteggi, calibrazione, Supabase, auth, validazione, rate limit.
- Nessun aggiornamento di Next o Tailwind, nessuna libreria UI o di animazione.
- Nessuna nuova pagina o voce di menu.

## Anti-obiettivi

- Lo sfondo dell'area di gioco non deve offrire riferimenti di misura (griglie, righe regolari): aiuterebbero a stimare.
- Le tacche del metro restano irregolari, come oggi.
- Niente animazioni in loop infinito e niente `hover:scale` su tutto.

## Approcci considerati

1. **Riscrivere markup e stili sull'attuale Tailwind 3** con nuovi token nel config. Scelto: nessuna dipendenza nuova, rischio basso, la logica resta dov'è.
2. Aggiungere una libreria di componenti (shadcn/Radix). Scartato: sette schermate semplici non la giustificano.
3. Aggiornare Next/Tailwind e rifare. Scartato: rischio senza beneficio visivo.

Per le animazioni: CSS (transizioni, keyframes) più un piccolo hook per i numeri che scorrono. Una libreria tipo framer-motion è stata scartata perché il set di animazioni è piccolo e definito.

## Token

Colori (nomi Tailwind):

| Nome | Chiaro | Scuro | Uso |
|---|---|---|---|
| `carta` | `#ECEEEA` | `#17191B` | sfondo pagina |
| `foglio` | `#F7F8F5` | `#202326` | superfici rialzate (menu, campi, overlay) |
| `inchiostro` | `#1B1D1F` | `#ECEEEA` | testo, bottone secondario |
| `grafite` | `#5B6167` | `#A3A9AE` | testo secondario |
| `riga` | `#C9CDC8` | `#34383C` | divisori, bordi |
| `nastro` | `#FFD21F` | uguale | metro, azione principale |
| `errore` | `#D9281E` | `#FF5A4F` | scarto dal target, errori form |
| `acciaio` | `#8D949B` | uguale | gancio del metro |

Implementati come variabili CSS su `:root` e `.dark`, esposte a Tailwind. I vecchi `primary-*` spariscono.

Carattere: **Archivo** variabile (assi peso e larghezza) via `next/font/google`. Numeri e titoli: larghezza 68%, peso 800, cifre tabulari (classe `.cifre`). Testi: larghezza normale, 400/600.

Forme: raggio 8px per bottoni e campi, nessuna ombra decorativa, divisori da 1px. Bottone primario giallo con testo inchiostro; secondario inchiostro pieno; terziario solo testo sottolineato.

## Schermate

- **Navbar**: barra sottile su `carta`, nome in testo a sinistra (con un piccolo segno a tacche), link Resoconto e Classifica da `sm` in su, menu a destra. Niente mascotte.
- **Menu**: pannello laterale su `foglio`, stesse voci di oggi (Tema, Classifica, Resoconto, Profilo, Logout).
- **Home**: titolo-domanda "Quanto sono lunghi 7,40 cm?", metro trascinabile che esce dal bordo sinistro, una riga di regole, bottone "Gioca". Il metro della home è dimostrativo: non rivela la misura.
- **Partita, inizio**: stesso impianto, bottone "Inizia partita".
- **Partita, round**: riga "Round n di 3" / "Tentativo n di 2", target enorme, metro dal bordo sinistro, bottone "Conferma". Il riferimento da 1 cm resta, in forma discreta, in alto a destra.
- **Risultato del round**: scarto in rosso, il metro del giocatore e sotto la lunghezza giusta in scala reale con la differenza evidenziata, elenco dei due tentativi, bottone per proseguire.
- **Fine partita**: punteggio grande, miglior punteggio, tre righe di round, azioni Rigioca / Resoconto / Classifica / Home come bottoni e link normali.
- **Nuovo record**: overlay a tutto schermo giallo con il numero grande e il miglioramento.
- **Classifica**: lista con posizione in cifre, nome, punteggio; primi tre con cifra più grande e segmento giallo proporzionale. Niente medaglie.
- **Resoconto**: miglior punteggio in grande, tre statistiche in riga, ultime 5 partite come lista.
- **Profilo, login, registrazione, verifica**: colonna stretta, campi con etichetta sopra, stessi testi e stessa logica.
- **Footer**: una riga discreta, stesso contenuto.

## Animazioni

Tutte disattivate con `prefers-reduced-motion: reduce`.

1. **Riavvolgimento**: quando il metro torna a 5 cm (nuovo tentativo, nuovo round) rientra a scatto con una curva che rimbalza appena, come un flessometro vero.
2. **Rilascio**: a fine trascinamento il gancio fa un micro-assestamento.
3. **Entrata in home**: al caricamento il metro si srotola una volta dal bordo. È l'unico momento orchestrato della home.
4. **Numeri che scorrono**: target, scarto, punteggio finale e record contano fino al valore.
5. **Confronto che si disegna**: nel risultato del round la barra della lunghezza giusta si estende, poi cresce il segmento rosso della differenza.
6. **Cambio schermata di gioco**: il contenuto entra con una breve dissolvenza verso l'alto (una volta per schermata, non per elemento).
7. **Liste**: le righe di classifica e resoconto entrano in sequenza una sola volta; i segmenti gialli dei primi tre si estendono.
8. **Nuovo record**: la fascia gialla entra da sinistra come un nastro, poi il numero conta.
9. **Menu**: il pannello scorre da destra.
10. **Bottoni**: solo pressione (`scale 0.97`) e cambio colore.

La transizione globale su `*` viene rimossa.

## Pulizia

- Eliminati: `Mascot`, `SvgIcon`, `SvgLoader`, `ThemeImage`, `Icon`, `CmReference`, `CalibrationScreen`, `CalibrationMeter` se non più usati dopo la riscrittura; tutti gli SVG in `public/assets` e `public/background-pattern.svg`.
- Nuovo marchio `public/assets/icon.svg` (quadrato giallo con tacche), usato da metadata, manifest e service worker. `__tests__/pwa.test.ts` aggiornato al nuovo percorso; versione della cache del service worker incrementata.
- `useTheme` perde `imageVersion` e l'evento `themechange`, che servivano solo a ricaricare le immagini.
- `globals.css` perde gli hack `!important` sugli `object`.

## Scelte mie, da correggere se non vanno

- Nomi dei token in italiano.
- Token aggiuntivo `pece` (`#1B1D1F` fisso): testo e tacche sul giallo, uguale nei due temi.
- Il testo di aiuto sotto il metro sta nelle pagine, non dentro `Meter`.
- Testi dei titoli riscritti in forma più asciutta (frase normale, senza maiuscole a ogni parola).
- Colori dei coriandoli: rimossi, sostituiti dall'overlay giallo.
- Le modifiche PWA non committate restano non committate; il redesign non viene committato finché non viene chiesto.

## Verifica

- `npm run lint`, `npm test`, `npm run build` passano.
- Controllo visivo nel browser di home, login e registrazione in chiaro e scuro, a 375px e desktop. Le schermate dietro login (partita, classifica, resoconto, profilo) richiedono un account Supabase: verificate solo se è disponibile un accesso di test.
