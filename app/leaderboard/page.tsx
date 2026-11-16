'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { getLeaderboard, type Score } from '@/lib/scores'
import { formatLength } from '@/lib/game'
import { sanitizeString } from '@/lib/sanitize'

export default function LeaderboardPage() {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    setLoading(true)
    const data = await getLeaderboard(20)
    setScores(data)
    setLoading(false)
  }

  // Il segmento giallo dei primi tre è proporzionale: chi sbaglia meno ha il nastro più lungo
  const migliore = scores[0]?.best_score ?? 0

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 pb-16 pt-10 md:pt-16">
        <h1 className="cifre entra text-[clamp(3.4rem,14vw,7rem)]">Classifica</h1>
        <p className="entra mt-3 text-grafite">Vince chi sbaglia meno centimetri in una partita.</p>

        {loading ? (
          <div className="caricamento mt-10" role="status" aria-label="Caricamento classifica" />
        ) : scores.length === 0 ? (
          <div className="entra mt-10 border-t border-riga pt-8">
            <p className="text-xl font-bold">Qui non c&apos;è ancora nessuno</p>
            <p className="mt-2 text-grafite">Gioca una partita e il primo posto è tuo.</p>
            <Link href="/play" className="btn btn-nastro mt-6">
              Gioca
            </Link>
          </div>
        ) : (
          <>
            <ol className="mt-10 border-t border-riga">
              {scores.map((score, index) => {
                const isTopThree = index < 3

                return (
                  <li
                    key={score.id}
                    className="riga-entra border-b border-riga py-3.5"
                    style={{ ['--i' as string]: index }}
                  >
                    <div className="flex items-baseline gap-4">
                      <span className={`cifre w-10 shrink-0 ${isTopThree ? 'text-4xl' : 'text-2xl text-grafite'}`}>
                        {index + 1}
                      </span>
                      <span className={`min-w-0 flex-1 truncate ${isTopThree ? 'text-lg font-bold' : 'font-semibold'}`}>
                        {sanitizeString(score.username || 'Utente')}
                      </span>
                      <span className={`cifre shrink-0 ${isTopThree ? 'text-3xl' : 'text-xl'}`}>
                        {formatLength(score.best_score)}
                        <span className="text-[0.55em]"> cm</span>
                      </span>
                    </div>
                    {isTopThree && (
                      <div
                        className="srotola ml-14 mt-2 h-2 border-y border-pece bg-nastro"
                        style={{
                          width: `calc((100% - 3.5rem) * ${score.best_score > 0 ? Math.min(1, migliore / score.best_score) : 1})`,
                          minWidth: '1.5rem',
                          ['--ritardo' as string]: `${200 + index * 120}ms`,
                        }}
                      />
                    )}
                  </li>
                )
              })}
            </ol>

            <p className="mt-4 text-sm text-grafite">
              {scores.length} giocatori, aggiornata alle {new Date().toLocaleTimeString('it-IT')}
            </p>
          </>
        )}

        <button onClick={loadLeaderboard} className="btn btn-linea mt-8">
          Aggiorna classifica
        </button>
      </main>
    </>
  )
}
