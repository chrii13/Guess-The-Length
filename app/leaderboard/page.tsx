'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Navbar } from '@/components/Navbar'
import { getLeaderboard, type Score } from '@/lib/scores'
import { formatLength } from '@/lib/game'
import { useTheme } from '@/hooks/useTheme'
import { sanitizeString } from '@/lib/sanitize'

export default function LeaderboardPage() {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const { theme, mounted: themeMounted, imageVersion } = useTheme()

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    setLoading(true)
    const data = await getLeaderboard(20)
    setScores(data)
    setLoading(false)
  }

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 relative z-10">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-[70px] h-[70px] md:w-[80px] md:h-[80px] flex mt-5 mb-[56px] bg-transparent dark:bg-transparent">
            <Image
              key={`trophy-${theme}-${imageVersion}`}
              src={`${themeMounted && theme === 'dark' ? "/assets/icons/trophy-dark.svg" : "/assets/icons/trophy.svg"}?v=${theme}-${imageVersion}`}
              alt="Trofeo"
              width={80}
              height={80}
              className="w-full h-full pointer-events-none object-contain pulse-scale"
              style={{ backgroundColor: 'transparent', background: 'transparent', display: 'block', objectPosition: 'center', transformOrigin: 'center' }}
              unoptimized
            />
          </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-primary-gray-dark via-primary-gray-medium to-primary-gray-dark dark:from-primary-gray-light dark:via-primary-yellow dark:to-primary-gray-light bg-clip-text text-transparent">
              Classifica
            </h1>
            <p className="text-base md:text-lg text-primary-gray-medium dark:text-primary-gray-light">
              I migliori giocatori di Guess the Length
            </p>
        </div>
        
        {loading ? (
          <div className="text-center py-12 md:py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-b-2 border-primary-yellow"></div>
            <p className="text-lg md:text-xl text-primary-gray-medium dark:text-primary-gray-light mt-4">Caricamento classifica...</p>
          </div>
        ) : scores.length === 0 ? (
          <div className="bg-white dark:bg-primary-gray-medium backdrop-blur-sm rounded-2xl-large shadow-soft-lg p-8 md:p-12 text-center border border-primary-gray-light dark:border-primary-gray-medium">
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
            <p className="text-xl md:text-2xl font-bold text-primary-gray-dark dark:text-primary-gray-light mb-2">
              La classifica è vuota...per ora!
            </p>
            <p className="text-base md:text-lg text-primary-gray-medium dark:text-primary-gray-light">
              Sii il primo a giocare e ad apparire in classifica!
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-primary-gray-medium backdrop-blur-sm rounded-2xl-large shadow-soft-lg overflow-hidden border border-primary-gray-light dark:border-primary-gray-medium">
            {/* Header della tabella */}
            <div className="bg-gradient-to-r from-primary-yellow to-primary-yellow-dark text-primary-gray-dark dark:text-primary-gray-dark py-4 md:py-6 px-4 md:px-8">
              <div className="grid grid-cols-12 gap-2 md:gap-4 items-center">
                <div className="col-span-3 md:col-span-2 text-center">
                  <p className="text-xs md:text-sm font-bold uppercase tracking-wider">Posizione</p>
                </div>
                <div className="col-span-5 md:col-span-6 text-center">
                  <p className="text-xs md:text-sm font-bold uppercase tracking-wider">Username</p>
                </div>
                <div className="col-span-4 text-center">
                  <p className="text-xs md:text-sm font-bold uppercase tracking-wider">Punteggio</p>
                </div>
              </div>
            </div>

            {/* Body della tabella */}
            <div className="divide-y divide-primary-gray-light">
              {scores.map((score, index) => {
                const isTopThree = index < 3
                
                return (
                  <div
                    key={score.id}
                    className={`px-4 md:px-8 py-4 md:py-6 transition-all duration-200 ${
                      isTopThree 
                        ? 'bg-gradient-to-r from-primary-yellow/20 to-primary-yellow-dark/10 hover:from-primary-yellow/30 hover:to-primary-yellow-dark/20 border-l-4 border-primary-yellow dark:from-primary-yellow-dark/20 dark:to-primary-yellow/10' 
                        : 'hover:bg-primary-gray-light/30 dark:hover:bg-primary-gray-medium/50'
                    }`}
                  >
                    <div className="grid grid-cols-12 gap-2 md:gap-4 items-center">
                      {/* Posizione */}
                      <div className="col-span-3 md:col-span-2 text-center">
                        <div className="flex flex-col items-center justify-center">
                          {isTopThree ? (
                            <div className="w-10 h-10 md:w-12 md:h-12 mb-1">
                              <Image
                                src={index === 0 ? "/assets/icons/medal-1.svg" : index === 1 ? "/assets/icons/medal-2.svg" : "/assets/icons/medal-3.svg"}
                                alt={`${index === 0 ? '1°' : index === 1 ? '2°' : '3°'} posto`}
                                width={48}
                                height={48}
                                className="w-full h-full pointer-events-none"
                                style={{ backgroundColor: 'transparent', background: 'transparent', display: 'block' }}
                                unoptimized
                              />
                            </div>
                          ) : (
                            <span className="text-lg md:text-2xl font-bold text-primary-gray-medium dark:text-primary-gray-light">
                              #{index + 1}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Username */}
                      <div className="col-span-5 md:col-span-6 text-center">
                        <p className={`text-base md:text-lg font-bold ${
                          isTopThree ? 'text-primary-gray-dark dark:text-primary-gray-light' : 'text-primary-gray-medium dark:text-primary-gray-light'
                        }`}>
                          {sanitizeString(score.username || 'Utente')}
                        </p>
                      </div>

                      {/* Punteggio */}
                      <div className="col-span-4 text-center">
                        <div className="inline-flex items-center justify-center">
                          <span className={`text-xl md:text-2xl font-bold ${
                            isTopThree ? 'text-primary-yellow-dark dark:text-primary-yellow' : 'text-primary-gray-dark dark:text-primary-gray-light'
                          }`}>
                            {formatLength(score.best_score)} cm
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer con statistiche */}
            <div className="bg-primary-gray-light/50 dark:bg-primary-gray-medium/50 px-4 md:px-8 py-3 md:py-4 border-t border-primary-gray-light dark:border-primary-gray-medium">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs md:text-sm text-primary-gray-medium dark:text-primary-gray-light">
                <span>
                  Totale giocatori: <span className="font-bold text-primary-gray-dark dark:text-primary-gray-light">{scores.length}</span>
                </span>
                <span>
                  Ultimo aggiornamento: {new Date().toLocaleTimeString('it-IT')}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 md:mt-8 text-center">
          <button
            onClick={loadLeaderboard}
            className="px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-bold text-primary-gray-dark dark:text-primary-gray-dark bg-gradient-to-r from-primary-yellow to-primary-yellow-dark rounded-xl-large hover:shadow-yellow-glow transition-all shadow-soft-lg transform hover:scale-105 active:scale-95 flex items-center justify-center mx-auto"
          >
            <Image
              key={`refresh-${theme}-${imageVersion}`}
              src={`${themeMounted && theme === 'dark' ? "/assets/icons/refresh-dark.svg" : "/assets/icons/refresh.svg"}?v=${theme}-${imageVersion}`}
              alt="Aggiorna"
              width={28}
              height={28}
              className="w-6 h-6 md:w-7 md:h-7 inline-block mr-2 pointer-events-none"
              style={{ backgroundColor: 'transparent', background: 'transparent', display: 'inline-block' }}
              unoptimized
            />
            Aggiorna Classifica
          </button>
        </div>
      </main>
    </>
  )
}
