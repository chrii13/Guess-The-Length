'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { getLeaderboard, type Score } from '@/lib/scores'
import { formatLength } from '@/lib/game'

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

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-indigo-900 mb-4">
            🏆 Classifica 🏆
          </h1>
          <p className="text-lg text-gray-600">
          Qui potrai vedere i migliori giocatori di Meter Game
          </p>
        </div>
        
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-xl text-gray-600 mt-4">Caricamento classifica...</p>
          </div>
        ) : scores.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📏</div>
            <p className="text-2xl font-semibold text-gray-700 mb-2">
              La classiffica è vuota...per ora!
            </p>
            <p className="text-lg text-gray-600">
              Sii il primo a giocare e ad apparire in classifica!
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Header della tabella con sfondo gradient */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6 px-8">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-2 text-center">
                  <p className="text-sm font-semibold uppercase tracking-wider">Posizione</p>
                </div>
                <div className="col-span-6 text-center">
                  <p className="text-sm font-semibold uppercase tracking-wider">Username</p>
                </div>
                <div className="col-span-4 text-center">
                  <p className="text-sm font-semibold uppercase tracking-wider">Punteggio</p>
                </div>
              </div>
            </div>

            {/* Body della tabella */}
            <div className="divide-y divide-gray-200">
              {scores.map((score, index) => {
                const isTopThree = index < 3
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null
                
                return (
                  <div
                    key={score.id}
                    className={`px-8 py-6 transition-all duration-200 ${
                      isTopThree 
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Posizione */}
                      <div className="col-span-2 text-center">
                        <div className="flex flex-col items-center justify-center">
                          {medal ? (
                            <span className="text-4xl mb-1">{medal}</span>
                          ) : (
                            <span className="text-2xl font-bold text-gray-400">
                              #{index + 1}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Username */}
                      <div className="col-span-6 text-center">
                        <p className={`text-lg font-semibold ${
                          isTopThree ? 'text-indigo-900' : 'text-gray-900'
                        }`}>
                          {score.username}
                        </p>
                      </div>

                      {/* Punteggio */}
                      <div className="col-span-4 text-center">
                        <div className="inline-flex items-center justify-center">
                          <span className={`text-2xl font-bold ${
                            isTopThree ? 'text-yellow-600' : 'text-indigo-700'
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
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>
                  Totale giocatori: <span className="font-semibold">{scores.length}</span>
                </span>
                <span>
                  Ultimo aggiornamento: {new Date().toLocaleTimeString('it-IT')}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={loadLeaderboard}
            className="px-6 py-3 text-indigo-600 bg-white border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            🔄 Aggiorna Classifica
          </button>
        </div>
      </main>
    </>
  )
}
