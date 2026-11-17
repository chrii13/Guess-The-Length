'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { useAuth } from '@/components/AuthProvider'
import { getUserBestScore, getUserRecentSessions, type GameSession } from '@/lib/scores'
import { formatLength } from '@/lib/game'
import { Cifra } from '@/components/Cifra'

export default function ResultPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [bestScore, setBestScore] = useState<number | null>(null)
  const [recentSessions, setRecentSessions] = useState<GameSession[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const loadUserData = useCallback(async () => {
    if (!user) return
    
    setLoadingData(true)
    try {
      const [best, sessions] = await Promise.all([
        getUserBestScore(user.id),
        getUserRecentSessions(user.id, 5)
      ])
      
      setBestScore(best)
      setRecentSessions(sessions)
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoadingData(false)
    }
  }, [user])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      loadUserData()
    }
  }, [user, loading, router, loadUserData])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  if (loading || loadingData) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-3xl px-5 pb-16 pt-10 md:pt-16">
          <div className="caricamento" role="status" aria-label="Caricamento resoconto" />
        </main>
      </>
    )
  }

  if (!user) {
    return null
  }

  const media = recentSessions.length > 0
    ? recentSessions.reduce((sum, s) => sum + s.score, 0) / recentSessions.length
    : null

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 pb-16 pt-10 md:pt-16">
        <div className="entra">
          <h1 className="text-lg font-bold">Il tuo resoconto</h1>

          {bestScore !== null ? (
            <>
              <p className="mt-8 text-grafite">Il tuo miglior punteggio</p>
              <p className="cifre mt-2 text-[clamp(5rem,24vw,12rem)]">
                <Cifra valore={bestScore} durata={900} />
                <span className="text-[0.32em]"> cm</span>
              </p>
              <div className="srotola mt-4 h-2 w-40 border-y border-pece bg-nastro" style={{ ['--ritardo' as string]: '300ms' }} />
            </>
          ) : (
            <>
              <p className="cifre mt-8 text-[clamp(3.2rem,13vw,6rem)]">Nessuna partita, per ora.</p>
              <p className="mt-4 text-grafite">Gioca la prima e qui trovi punteggi e statistiche.</p>
            </>
          )}
        </div>

        {recentSessions.length > 0 && (
          <dl className="entra mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-riga py-5">
            <div>
              <dt className="text-sm text-grafite">Partite recenti</dt>
              <dd className="cifre mt-1 text-4xl">{recentSessions.length}</dd>
            </div>
            <div>
              <dt className="text-sm text-grafite">Media delle ultime {recentSessions.length}</dt>
              <dd className="cifre mt-1 text-4xl">
                {media !== null ? formatLength(media) : '--'}
                <span className="text-[0.5em]"> cm</span>
              </dd>
            </div>
          </dl>
        )}

        {recentSessions.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-bold">Ultime 5 partite</h2>
            <ol className="mt-4 border-t border-riga">
              {recentSessions.map((session, index) => {
                const isBest = bestScore !== null && session.score === bestScore
                const round = [
                  [session.round_1_target, session.round_1_best_error],
                  [session.round_2_target, session.round_2_best_error],
                  [session.round_3_target, session.round_3_best_error],
                ]

                return (
                  <li
                    key={session.id}
                    className="riga-entra border-b border-riga py-4"
                    style={{ ['--i' as string]: index }}
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="cifre text-3xl">
                        {formatLength(session.score)}
                        <span className="text-[0.55em]"> cm</span>
                        {isBest && (
                          <span className="ml-3 rounded-lg bg-nastro px-2 py-0.5 align-middle font-sans text-xs font-bold tracking-normal text-pece">
                            La migliore
                          </span>
                        )}
                      </p>
                      <p className="text-right text-sm text-grafite">{formatDate(session.created_at)}</p>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
                      {round.map(([target, errore], i) => (
                        <p key={i}>
                          <span className="text-grafite">Round {i + 1}</span>
                          <br />
                          {formatLength(target)} cm
                          <br />
                          <span className="font-semibold text-errore">±{formatLength(errore)} cm</span>
                        </p>
                      ))}
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>
        )}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button onClick={() => router.push('/play')} className="btn btn-nastro sm:px-10">
            Gioca
          </button>
          <button onClick={() => router.push('/leaderboard')} className="btn btn-linea">
            Vedi classifica
          </button>
          <Link href="/" className="collegamento self-center sm:ml-3">
            Home
          </Link>
        </div>
      </main>
    </>
  )
}
