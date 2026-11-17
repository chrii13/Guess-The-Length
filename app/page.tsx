'use client'

import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { useAuth } from '@/components/AuthProvider'

const passi = [
  {
    titolo: 'Ti viene data una lunghezza',
    testo: 'Per esempio 7,40 cm. In una partita sono tre, scelte a caso.',
  },
  {
    titolo: 'Allunghi il metro a occhio',
    testo: 'Trascini il gancio finché ti sembra giusto. Hai due tentativi per ogni lunghezza e conta il migliore.',
  },
  {
    titolo: 'Scopri di quanto hai sbagliato',
    testo: 'Il punteggio è la somma dei tre scarti, in centimetri. Meno è, meglio è.',
  },
]

export default function Home() {
  const { user, loading } = useAuth()
  const ospite = !loading && !user

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 pb-16 pt-10 md:pt-20">
        <div className="entra">
          <h1 className="cifre text-[clamp(3.6rem,15vw,8rem)]">Guess the Length</h1>

          {/* Il metro del gioco, qui solo come segno grafico */}
          <div className="-mx-5 mt-6 md:mx-0" aria-hidden="true">
            <div
              className="srotola h-10 w-[72%] max-w-md border-y border-pece bg-nastro md:border-l"
              style={{
                ['--ritardo' as string]: '200ms',
                backgroundImage:
                  'linear-gradient(90deg, rgb(var(--pece)) 0 1px, transparent 1px), linear-gradient(90deg, rgb(var(--pece)) 0 2px, transparent 2px)',
                backgroundSize: '13px 38%, 91px 70%',
                backgroundRepeat: 'repeat-x',
                backgroundPosition: '9px 0, 48px 0',
              }}
            />
          </div>

          <p className="mt-8 max-w-[40ch] text-xl leading-relaxed">
            Il gioco in cui misuri a occhio: allunga il metro fino alla lunghezza richiesta, senza righello.
            Vince chi sbaglia meno.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/play" className="btn btn-nastro sm:px-12">
              {ospite ? 'Gioca come ospite' : 'Gioca'}
            </Link>
            {ospite && (
              <Link href="/login" className="btn btn-linea">
                Accedi
              </Link>
            )}
          </div>
          {ospite && (
            <p className="mt-3 text-sm text-grafite">
              Da ospite il punteggio non viene salvato.{' '}
              <Link href="/register" className="collegamento text-inchiostro">
                Registrati
              </Link>{' '}
              per salvarlo ed entrare in classifica.
            </p>
          )}
        </div>

        <section className="mt-16">
          <h2 className="text-lg font-bold">Come si gioca</h2>
          <ol className="mt-4 border-t border-riga">
            {passi.map((passo, index) => (
              <li
                key={passo.titolo}
                className="riga-entra flex gap-5 border-b border-riga py-5"
                style={{ ['--i' as string]: index + 3 }}
              >
                <span className="cifre w-8 shrink-0 text-5xl">{index + 1}</span>
                <div>
                  <h3 className="font-bold">{passo.titolo}</h3>
                  <p className="mt-1 max-w-[52ch] text-grafite">{passo.testo}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-bold">Classifica</h2>
          <p className="mt-2 max-w-[52ch] text-grafite">
            Chi ha un account salva il proprio miglior punteggio e compare nella classifica di tutti i giocatori.
          </p>
          <Link href="/leaderboard" className="collegamento mt-3 inline-block">
            Guarda la classifica
          </Link>
        </section>
      </main>
    </>
  )
}
