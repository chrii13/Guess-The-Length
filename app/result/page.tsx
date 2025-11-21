'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Navbar } from '@/components/Navbar'
import { useAuth } from '@/components/AuthProvider'
import { getUserBestScore, getUserRecentSessions, type GameSession } from '@/lib/scores'
import { formatLength } from '@/lib/game'
import { useTheme } from '@/hooks/useTheme'
import { ThemeImage } from '@/components/ThemeImage'

export default function ResultPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { theme, mounted: themeMounted, imageVersion } = useTheme()
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
        <main className="max-w-4xl mx-auto px-4 py-8 md:py-16 text-center relative z-10">
          <div className="inline-block animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-b-2 border-primary-yellow"></div>
          <p className="text-lg md:text-xl text-primary-gray-medium dark:text-primary-gray-light mt-4">Caricamento resoconto...</p>
        </main>
      </>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 relative z-10">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-[137px] h-[137px] md:w-[156px] md:h-[156px] flex mb-4 bg-transparent dark:bg-transparent">
            <Image
              key={`chart-${theme}-${imageVersion}`}
              src={`${themeMounted && theme === 'dark' ? "/assets/icons/chart-dark.svg" : "/assets/icons/chart.svg"}?v=${theme}-${imageVersion}`}
              alt="Resoconto"
              width={156}
              height={156}
              className="w-full h-full pointer-events-none object-contain pulse-scale"
              style={{ backgroundColor: 'transparent', background: 'transparent', display: 'block', objectPosition: 'center', transformOrigin: 'center' }}
              unoptimized
            />
          </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-primary-gray-dark via-primary-gray-medium to-primary-gray-dark dark:from-primary-gray-light dark:via-primary-yellow dark:to-primary-gray-light bg-clip-text text-transparent">
              Il Tuo Resoconto
            </h1>
            <p className="text-base md:text-lg text-primary-gray-medium dark:text-primary-gray-light">
              Visualizza le tue statistiche e le tue ultime partite
            </p>
        </div>

        {/* Miglior Punteggio */}
        <div className="bg-gradient-to-br from-primary-yellow to-primary-yellow-dark dark:from-primary-gray-medium dark:to-primary-gray-dark rounded-2xl-large shadow-soft-lg p-6 md:p-10 mb-6 md:mb-8 text-primary-gray-dark dark:text-primary-gray-light border border-primary-gray-light/20 dark:border-primary-gray-medium">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 flex mb-4 bg-transparent dark:bg-transparent">
              <Image
                key={`star-${theme}-${imageVersion}`}
                src={`${themeMounted && theme === 'dark' ? "/assets/icons/star-dark.svg" : "/assets/icons/star.svg"}?v=${theme}-${imageVersion}`}
                alt="Stella"
                width={64}
                height={64}
                className="w-8 h-8 md:w-10 md:h-10 pointer-events-none object-contain pulse-scale"
                style={{ backgroundColor: 'transparent', background: 'transparent', display: 'block', objectPosition: 'center', transformOrigin: 'center' }}
                unoptimized
              />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-primary-gray-dark dark:text-primary-gray-light">Il Tuo Miglior Punteggio</h2>
            {bestScore !== null ? (
              <>
                <p className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2 dark:text-primary-gray-light">{formatLength(bestScore)} cm</p>
                <p className="text-base md:text-lg font-medium opacity-90 dark:text-primary-gray-light">
                  Ottimo Lavoro!
                </p>
              </>
            ) : (
              <>
                <p className="text-3xl md:text-4xl font-bold mb-2 dark:text-primary-gray-light">--</p>
                <p className="text-base md:text-lg font-medium opacity-90 dark:text-primary-gray-light">
                  Non hai ancora giocato nessuna partita. Inizia ora!
                </p>
              </>
            )}
          </div>
        </div>

        {/* Ultime 5 Partite */}
        <div className="bg-white/90 dark:bg-primary-gray-medium backdrop-blur-sm rounded-2xl-large shadow-soft-lg overflow-hidden mb-6 md:mb-8 border border-primary-gray-light dark:border-primary-gray-medium">
          <div className="bg-gradient-to-r from-primary-yellow to-primary-yellow-dark text-primary-gray-dark dark:text-primary-gray-dark py-4 md:py-6 px-4 md:px-8">
            <h2 className="text-xl md:text-2xl font-bold text-primary-gray-dark dark:text-primary-gray-dark">
              Ultime 5 Partite
            </h2>
            <p className="text-xs md:text-sm font-medium mt-1 opacity-90 text-primary-gray-dark dark:text-primary-gray-dark">
              Visualizza i risultati delle tue ultime partite giocate
            </p>
          </div>

          {recentSessions.length === 0 ? (
            <div className="p-8 md:p-12 text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 bg-transparent dark:bg-transparent">
                <Image
                  key={`logo-${theme}-${imageVersion}`}
                  src={`${themeMounted && theme === 'dark' ? "/assets/logo-small-dark.svg" : "/assets/logo-small.svg"}?v=${theme}-${imageVersion}`}
                  alt="Metro"
                  width={80}
                  height={80}
                  className="w-full h-full pointer-events-none opacity-60"
                  style={{ backgroundColor: 'transparent', background: 'transparent', display: 'block' }}
                  unoptimized
                />
              </div>
              <p className="text-lg md:text-xl font-bold text-primary-gray-dark dark:text-primary-gray-light mb-2">
                Non hai giocato nessuna partita...per ora!
              </p>
              <p className="text-base md:text-lg text-primary-gray-medium dark:text-primary-gray-light mb-6">
                Inizia a giocare per vedere le tue partite qui!
              </p>
              <button
                onClick={() => router.push('/play')}
                className="px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-bold text-white bg-gradient-to-r from-primary-yellow to-primary-yellow-dark rounded-xl-large hover:shadow-yellow-glow transition-all shadow-soft-lg transform hover:scale-105 active:scale-95"
              >
                <Image
                  src={`${themeMounted && theme === 'dark' ? "/assets/icons/play-dark.svg" : "/assets/icons/play.svg"}?v=${theme}-${imageVersion}`}
                  alt="Gioca"
                  width={28}
                  height={28}
                  className="w-6 h-6 md:w-7 md:h-7 inline-block mr-2 pointer-events-none filter brightness-0 invert"
                  style={{ backgroundColor: 'transparent', background: 'transparent', display: 'inline-block' }}
                  unoptimized
                />
                Inizia a Giocare
              </button>
            </div>
          ) : (
            <div className="divide-y divide-primary-gray-light">
              {recentSessions.map((session, index) => {
                const isBest = bestScore !== null && session.score === bestScore
                
                return (
                  <div
                    key={session.id}
                    className={`p-4 md:p-6 hover:bg-primary-gray-light/30 transition-colors ${
                      isBest ? 'bg-primary-yellow/10 border-l-4 border-primary-yellow' : ''
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 md:gap-3 mb-2">
                          <span className="text-xl md:text-2xl font-bold text-primary-gray-medium dark:text-primary-gray-light">
                            #{index + 1}
                          </span>
                          {isBest && (
                            <span className="px-2 md:px-3 py-1 text-xs font-bold text-primary-yellow-dark bg-primary-yellow/30 rounded-full">
                              <Image
                                key={`star-badge-${theme}-${imageVersion}`}
                                src={`${themeMounted && theme === 'dark' ? "/assets/icons/star-dark.svg" : "/assets/icons/star.svg"}?v=${theme}-${imageVersion}`}
                                alt="Migliore"
                                width={16}
                                height={16}
                                className="w-3 h-3 inline-block mr-1 pointer-events-none"
                                style={{ backgroundColor: 'transparent', background: 'transparent', display: 'inline-block' }}
                                unoptimized
                              />
                              MIGLIORE
                            </span>
                          )}
                        </div>
                        <p className="text-xs md:text-sm text-primary-gray-medium dark:text-primary-gray-light mb-1">
                          {formatDate(session.created_at)}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl md:text-3xl font-bold text-primary-gray-dark dark:text-primary-gray-light">
                            {formatLength(session.score)} cm
                          </p>
                        </div>
                      </div>

                      {/* Dettagli Round */}
                      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 lg:gap-6">
                        <div className="text-center sm:text-right">
                          <p className="text-xs text-primary-gray-medium dark:text-primary-gray-light mb-1">Round 1</p>
                          <p className="text-sm font-semibold text-primary-gray-dark dark:text-primary-gray-light">
                            {formatLength(session.round_1_target)} cm
                          </p>
                          <p className="text-xs text-primary-yellow-dark dark:text-primary-yellow font-medium">
                            ±{formatLength(session.round_1_best_error)} cm
                          </p>
                        </div>
                        <div className="text-center sm:text-right">
                          <p className="text-xs text-primary-gray-medium dark:text-primary-gray-light mb-1">Round 2</p>
                          <p className="text-sm font-semibold text-primary-gray-dark dark:text-primary-gray-light">
                            {formatLength(session.round_2_target)} cm
                          </p>
                          <p className="text-xs text-primary-yellow-dark dark:text-primary-yellow font-medium">
                            ±{formatLength(session.round_2_best_error)} cm
                          </p>
                        </div>
                        <div className="text-center sm:text-right">
                          <p className="text-xs text-primary-gray-medium dark:text-primary-gray-light mb-1">Round 3</p>
                          <p className="text-sm font-semibold text-primary-gray-dark dark:text-primary-gray-light">
                            {formatLength(session.round_3_target)} cm
                          </p>
                          <p className="text-xs text-primary-yellow-dark dark:text-primary-yellow font-medium">
                            ±{formatLength(session.round_3_best_error)} cm
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Statistiche */}
        {recentSessions.length > 0 && (
          <div className="bg-white/90 dark:bg-primary-gray-medium backdrop-blur-sm rounded-2xl-large shadow-soft-lg p-6 md:p-8 mb-6 md:mb-8 border border-primary-gray-light dark:border-primary-gray-medium">
            <h2 className="text-xl md:text-2xl font-bold text-primary-gray-dark dark:text-primary-gray-light mb-4 md:mb-6 text-center">
              Statistiche
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="text-center p-4 md:p-6 bg-primary-yellow/20 dark:bg-primary-yellow-dark/10 rounded-xl-large border border-primary-yellow/30 dark:border-primary-yellow-dark/20">
                <p className="text-2xl md:text-3xl font-bold text-primary-gray-dark dark:text-primary-gray-light mb-1">
                  {recentSessions.length}
                </p>
                <p className="text-xs md:text-sm text-primary-gray-medium dark:text-primary-gray-light font-medium">Partite Giocate</p>
              </div>
              <div className="text-center p-4 md:p-6 bg-primary-yellow/20 dark:bg-primary-yellow-dark/10 rounded-xl-large border border-primary-yellow/30 dark:border-primary-yellow-dark/20">
                <p className="text-2xl md:text-3xl font-bold text-primary-gray-dark dark:text-primary-gray-light mb-1">
                  {bestScore !== null ? formatLength(bestScore) : '--'} cm
                </p>
                <p className="text-xs md:text-sm text-primary-gray-medium dark:text-primary-gray-light font-medium">Miglior Punteggio</p>
              </div>
              <div className="text-center p-4 md:p-6 bg-primary-yellow/20 dark:bg-primary-yellow-dark/10 rounded-xl-large border border-primary-yellow/30 dark:border-primary-yellow-dark/20">
                <p className="text-2xl md:text-3xl font-bold text-primary-gray-dark dark:text-primary-gray-light mb-1">
                  {recentSessions.length > 0
                    ? formatLength(
                        recentSessions.reduce((sum, s) => sum + s.score, 0) /
                          recentSessions.length
                      )
                    : '--'}{' '}
                  cm
                </p>
                <p className="text-xs md:text-sm text-primary-gray-medium dark:text-primary-gray-light font-medium">Media Ultime {recentSessions.length} Partite</p>
              </div>
            </div>
          </div>
        )}

        {/* Pulsanti azione */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
          <button
            onClick={() => router.push('/play')}
            className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 text-lg md:text-xl lg:text-2xl font-bold text-primary-gray-dark dark:text-primary-gray-dark bg-gradient-to-r from-primary-yellow to-primary-yellow-dark rounded-xl-large hover:shadow-yellow-glow transition-all shadow-soft-lg transform hover:scale-105 active:scale-95 flex items-center justify-center"
          >
            Gioca Ora
          </button>
          <button
            onClick={() => router.push('/leaderboard')}
            className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 text-lg md:text-xl lg:text-2xl font-bold text-primary-gray-dark dark:text-primary-gray-light bg-white dark:bg-primary-gray-medium border-2 border-primary-yellow dark:border-primary-yellow-dark rounded-xl-large hover:bg-primary-yellow/10 dark:hover:bg-primary-yellow-dark/20 transition-all shadow-soft-lg transform hover:scale-105 active:scale-95 flex items-center justify-center"
          >
            Vedi Classifica
          </button>
          <div 
            onClick={() => router.push('/')}
            className="bg-primary-yellow border-2 border-primary-yellow rounded-xl-large shadow-soft-lg p-2 md:p-3 flex items-center justify-center hover:bg-primary-yellow-dark transition-all transform hover:scale-105 active:scale-95 cursor-pointer overflow-hidden"
            role="button"
            tabIndex={0}
            aria-label="Home"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                router.push('/')
              }
            }}
          >
            <ThemeImage
              srcLight="/assets/icons/home.svg"
              srcDark="/assets/icons/home-dark.svg"
              alt="Home"
              className="w-14 h-14 md:w-16 md:h-16 pointer-events-none"
              style={{ backgroundColor: 'transparent', background: 'transparent', display: 'block', transform: 'scale(2.5)', transformOrigin: 'center', margin: '0 auto', marginTop: '8px' }}
            />
          </div>
        </div>
      </main>
    </>
  )
}
