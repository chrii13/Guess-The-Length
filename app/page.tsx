'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { useAuth } from '@/components/AuthProvider'
import { Rivela, Parole, Conta } from '@/components/home/Rivela'
import { MetroDemo, TACCHE } from '@/components/home/MetroDemo'
import { BarraScorrimento } from '@/components/home/BarraScorrimento'
import { getLeaderboard, type Score } from '@/lib/scores'
import { formatLength } from '@/lib/game'
import { sanitizeString } from '@/lib/sanitize'

const numeri = [
  { valore: 3, testo: 'lunghezze per partita' },
  { valore: 2, testo: 'tentativi per ognuna' },
  { valore: 0, testo: 'righelli ammessi' },
]

const misureNastro = ['7,40', '3,45', '12,60', '0,38', '9,80', '5,15', '2,30', '14,05', '6,62', '1,27']

const v = (ms: number) => ({ ['--ritardo' as string]: `${ms}ms` })

export default function Home() {
  const { user, loading } = useAuth()
  const ospite = !loading && !user
  const [podio, setPodio] = useState<Score[] | null>(null)

  useEffect(() => {
    getLeaderboard(3)
      .then(setPodio)
      .catch(() => setPodio([]))
  }, [])

  const giocaTesto = ospite ? 'Gioca come ospite' : 'Gioca'

  return (
    <>
      <Navbar />
      <BarraScorrimento />

      <main className="overflow-x-clip">
        {/* Apertura */}
        <Rivela subito className="mx-auto max-w-4xl px-5 pb-20 pt-12 md:pt-20">
          <h1 className="cifre text-[clamp(4.6rem,23vw,10rem)]">
            <Parole testo="Misura a occhio." passo={110} />
          </h1>
          {/* La domanda è visibile da subito: si anima solo il metro */}
          <div className="mt-8">
            <MetroDemo />
          </div>
          <p className="vista vista-su mt-4 max-w-[42ch] text-xl leading-relaxed text-grafite" style={v(400)}>
            Guess the Length è il gioco del metro: ti diamo una lunghezza, tu tiri fuori il metro.
            Niente righello, vince chi sbaglia meno.
          </p>
          <div className="vista vista-su mt-8 flex flex-col gap-3 sm:flex-row sm:items-center" style={v(500)}>
            <Link href="/play" className="btn btn-nastro sm:px-12">
              {giocaTesto}
            </Link>
            {ospite && (
              <Link href="/login" className="btn btn-linea">
                Accedi
              </Link>
            )}
          </div>
          {ospite && (
            <p className="vista vista-su mt-3 text-sm text-grafite" style={v(600)}>
              Da ospite il punteggio non viene salvato.{' '}
              <Link href="/register" className="collegamento text-inchiostro">
                Registrati
              </Link>{' '}
              per salvarlo ed entrare in classifica.
            </p>
          )}
        </Rivela>

        {/* Il gioco in tre numeri */}
        <Rivela as="section" className="mx-auto grid max-w-4xl grid-cols-3 gap-2 px-5 pb-24 sm:gap-4" aria-label="Il gioco in numeri">
          {numeri.map((n, i) => (
            <div
              key={n.testo}
              className="vista vista-scala rounded-2xl border border-riga bg-foglio p-3 sm:p-6"
              style={v(i * 140)}
            >
              <p className="cifre text-5xl text-nastro sm:text-7xl">
                <Conta valore={n.valore} durata={800 + i * 200} />
              </p>
              <p className="mt-2 text-sm font-semibold leading-snug text-grafite sm:mt-3 sm:text-base">{n.testo}</p>
            </div>
          ))}
        </Rivela>

        {/* Come si gioca */}
        <section className="mx-auto max-w-4xl px-5 pb-24" aria-labelledby="come-si-gioca">
          <Rivela>
            <h2 id="come-si-gioca" className="cifre text-[clamp(2.6rem,9vw,4.5rem)]">
              <Parole testo="Come si gioca" />
            </h2>
          </Rivela>

          <div className="mt-12 grid gap-20">
            <Rivela className="grid items-center gap-8 md:grid-cols-2">
              <div className="vista vista-sinistra">
                <p className="cifre text-2xl text-nastro">1</p>
                <h3 className="mt-2 text-2xl font-extrabold">Ti viene data una lunghezza</h3>
                <p className="mt-2 max-w-[40ch] text-lg text-grafite">
                  Un numero in centimetri, scelto a caso. In una partita sono tre.
                </p>
              </div>
              <div className="vista vista-destra rounded-3xl bg-nastro-tinta px-8 py-10" style={v(150)}>
                <p className="text-sm font-bold text-grafite">Allunga il metro fino a</p>
                <p className="cifre mt-2 text-7xl text-nastro">
                  <Conta valore={7.4} cm durata={1100} />
                  <span className="text-3xl"> cm</span>
                </p>
              </div>
            </Rivela>

            <Rivela className="grid items-center gap-8 md:grid-cols-2">
              <div className="vista vista-destra md:order-2">
                <p className="cifre text-2xl text-nastro">2</p>
                <h3 className="mt-2 text-2xl font-extrabold">Allunghi il metro a occhio</h3>
                <p className="mt-2 max-w-[40ch] text-lg text-grafite">
                  Trascini il gancio finché ti sembra giusto. Due tentativi, e conta il migliore.
                </p>
              </div>
              <div className="vista vista-sinistra rounded-3xl border border-riga bg-foglio px-6 py-12 md:order-1" style={v(150)}>
                <div className="relative h-12">
                  <div className="vista vista-allunga absolute inset-y-0 left-0 w-[82%] origin-left border-y border-r border-pece bg-nastro" style={{ ...TACCHE, ...v(400) }}>
                    <div className="absolute -bottom-2 -right-2 -top-2 w-4 rounded-md border border-pece bg-acciaio" />
                  </div>
                </div>
              </div>
            </Rivela>

            <Rivela className="grid items-center gap-8 md:grid-cols-2">
              <div className="vista vista-sinistra">
                <p className="cifre text-2xl text-nastro">3</p>
                <h3 className="mt-2 text-2xl font-extrabold">Scopri di quanto hai sbagliato</h3>
                <p className="mt-2 max-w-[40ch] text-lg text-grafite">
                  Il punteggio è la somma dei tre scarti. Meno centimetri, più in alto in classifica.
                </p>
              </div>
              <div className="vista vista-destra rounded-3xl border border-riga bg-foglio px-6 py-8" style={v(150)}>
                <p className="text-sm text-grafite">Il tuo metro</p>
                <div className="vista vista-srotola mt-1.5 h-9 w-[78%] border-y border-pece bg-nastro" style={{ ...TACCHE, ...v(350) }} />
                <p className="mt-4 text-sm text-grafite">Lunghezza giusta</p>
                <div className="mt-1.5 flex h-4">
                  <div className="vista vista-srotola w-[70%] border-y border-r border-inchiostro" style={v(800)} />
                  <div className="vista vista-srotola w-[8%] bg-errore" style={v(1350)} />
                </div>
                <p className="vista vista-scala mt-5 inline-block rounded-xl bg-errore-tinta px-3 py-1.5 font-bold text-errore" style={v(1650)}>
                  Scarto 0,38 cm
                </p>
              </div>
            </Rivela>
          </div>
        </section>

        {/* Banda gialla */}
        <Rivela as="section" className="bg-nastro pb-16 text-pece" aria-label="Niente righello">
          <div className="strisce mb-14 h-4" aria-hidden="true" />
          <div className="mx-auto max-w-4xl px-5">
            <p className="cifre text-[clamp(3rem,12vw,7rem)]">
              <Parole testo="Niente righello." passo={120} />
              <br />
              <Parole testo="Solo il tuo occhio." ritardo={350} passo={120} />
            </p>
          </div>
          <div className="mt-10 overflow-hidden border-y border-pece py-3" aria-hidden="true">
            <div className="nastro-scorre flex w-max gap-10 font-display text-3xl tracking-[0.03em]">
              {[...misureNastro, ...misureNastro].map((m, i) => (
                <span key={i} className="whitespace-nowrap">
                  {m} cm
                </span>
              ))}
            </div>
          </div>
          <div className="strisce mt-14 -mb-16 h-4" aria-hidden="true" />
        </Rivela>

        {/* Classifica */}
        <section className="mx-auto max-w-4xl px-5 py-24" aria-labelledby="podio">
          <Rivela>
            <h2 id="podio" className="cifre text-[clamp(2.6rem,9vw,4.5rem)]">
              <Parole testo="Chi misura meglio" />
            </h2>
            <p className="vista vista-su mt-3 max-w-[48ch] text-lg text-grafite" style={v(300)}>
              I tre punteggi più bassi di sempre. Chi ha un account entra in classifica con il suo record.
            </p>
          </Rivela>

          <Rivela className="mt-10">
            {podio === null ? (
              <div className="caricamento" role="status" aria-label="Caricamento classifica" />
            ) : podio.length === 0 ? (
              <p className="vista vista-su text-lg">Il podio è ancora vuoto: il primo posto può essere tuo.</p>
            ) : (
              <ol className="grid gap-4">
                {podio.map((s, i) => (
                  <li
                    key={s.id}
                    className="vista vista-sinistra flex items-center gap-4 rounded-2xl border border-riga bg-foglio p-4 sm:p-5"
                    style={v(i * 160)}
                  >
                    <span className="cifre flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-nastro text-3xl text-pece">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-extrabold">{sanitizeString(s.username || 'Utente')}</p>
                      <div
                        className="vista vista-srotola mt-2 h-2 rounded-full bg-nastro"
                        style={{ width: `${Math.max(8, Math.min(100, (podio[0].best_score / Math.max(s.best_score, 0.01)) * 100))}%`, ...v(400 + i * 160) }}
                      />
                    </div>
                    <p className="cifre shrink-0 text-3xl">
                      {formatLength(s.best_score)}
                      <span className="text-base"> cm</span>
                    </p>
                  </li>
                ))}
              </ol>
            )}
            <Link href="/leaderboard" className="vista vista-su collegamento mt-6 inline-block" style={v(600)}>
              Guarda la classifica completa
            </Link>
          </Rivela>
        </section>

        {/* Chiusura */}
        <Rivela as="section" className="mx-auto max-w-4xl px-5 pb-28 text-center" aria-label="Inizia a giocare">
          <p className="cifre text-[clamp(3rem,12vw,6.5rem)]">
            <Parole testo="Pronto a misurare?" passo={110} />
          </p>
          <div className="vista vista-scala mt-8" style={v(500)}>
            <Link href="/play" className="btn btn-nastro px-14">
              {giocaTesto}
            </Link>
          </div>
        </Rivela>
      </main>
    </>
  )
}
