import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Privacy | Guess the Length',
  description: 'Quali dati raccoglie Guess the Length e come li usa.',
}

const SEGNALAZIONI = 'https://github.com/chrii13/Guess-The-Length/issues'

const sezioni = [
  {
    titolo: 'Da ospite',
    testo: [
      'Se giochi senza account non raccogliamo nessun dato personale: la partita resta nel tuo browser e il punteggio non viene salvato.',
    ],
  },
  {
    titolo: 'Con un account',
    testo: [
      'Salviamo solo quello che serve al gioco: la tua email, il nome utente, il miglior punteggio e il risultato delle partite (lunghezze da indovinare e scarti).',
      'Se accedi con Google, Google ci comunica la tua email e il nome del profilo. Non riceviamo la tua password e non leggiamo altri dati del tuo account Google.',
    ],
  },
  {
    titolo: 'A cosa servono',
    testo: [
      "L'email serve per accedere e per confermare la registrazione. Il nome utente e il miglior punteggio compaiono nella classifica pubblica. Le partite servono a mostrarti il resoconto.",
      'Non vendiamo i dati, non li usiamo per pubblicità e non li condividiamo con nessuno oltre ai servizi qui sotto.',
    ],
  },
  {
    titolo: 'Dove sono conservati',
    testo: [
      "Account e punteggi sono conservati su Supabase, il servizio che gestisce gli accessi e il database. Il sito è ospitato su Vercel. L'accesso con Google passa da Google.",
    ],
  },
  {
    titolo: 'Cookie e memoria del browser',
    testo: [
      "Non usiamo cookie di profilazione né strumenti di statistica. Il browser conserva solo la sessione di accesso, per non chiederti la password a ogni visita, e la calibrazione del metro.",
    ],
  },
  {
    titolo: 'I tuoi diritti',
    testo: [
      'Puoi cambiare il nome utente dal profilo. Per vedere, correggere o cancellare il tuo account e i tuoi punteggi, scrivici con una segnalazione su GitHub: rispondiamo e cancelliamo i dati il prima possibile.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 pb-16 pt-10 md:pt-16">
        <h1 className="cifre entra text-[clamp(3.4rem,14vw,7rem)]">Privacy</h1>
        <p className="entra mt-3 max-w-[60ch] text-lg text-grafite">
          Guess the Length raccoglie il minimo indispensabile per far funzionare account e classifica.
        </p>

        <div className="mt-10 grid gap-8 border-t border-riga pt-8">
          {sezioni.map((s) => (
            <section key={s.titolo}>
              <h2 className="text-2xl font-extrabold">{s.titolo}</h2>
              {s.testo.map((t) => (
                <p key={t} className="mt-2 max-w-[65ch] leading-relaxed text-grafite">
                  {t}
                </p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <a href={SEGNALAZIONI} target="_blank" rel="noopener noreferrer" className="btn btn-linea btn-piccolo">
            Scrivici su GitHub
          </a>
          <Link href="/" className="btn btn-linea btn-piccolo">
            Home
          </Link>
        </div>

        <p className="mt-8 text-sm text-sbiadito">Ultimo aggiornamento: 17 novembre 2026</p>
      </main>
    </>
  )
}
