'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { useAuth } from '@/components/AuthProvider'
import { getUserBestScore, getUserRecentSessions, type GameSession } from '@/lib/scores'
import { formatLength } from '@/lib/game'

export default function ResultPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [bestScore, setBestScore] = useState<number | null>(null)
  const [recentSessions, setRecentSessions] = useState<GameSession[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      loadUserData()
    }
  }, [user, loading, router])

  const loadUserData = async () => {
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
  }

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
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-xl text-gray-600 mt-4">Caricamento resoconto...</p>
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
      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-indigo-900 mb-4">
            📊 Il Tuo Resoconto
          </h1>
          <p className="text-lg text-gray-600">
            Visualizza le tue statistiche e le tueultime partite
          </p>
        </div>

        {/* Miglior Punteggio */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-2xl p-8 mb-8 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">🏆 Il Tuo Miglior Punteggio 🏆</h2>
            {bestScore !== null ? (
              <>
                <p className="text-6xl font-bold mb-2">{formatLength(bestScore)} cm</p>
                <p className="text-lg opacity-90 ">
                🎉 Ottimo Lavoro! 🎉
                </p>
              </>
            ) : (
              <>
                <p className="text-4xl font-bold mb-2">--</p>
                <p className="text-lg opacity-90">
                  Non hai ancora giocato nessuna partita. Inizia ora!
                </p>
              </>
            )}
          </div>
        </div>

        {/* Ultime 5 Partite */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6 px-8">
            <h2 className="text-2xl font-bold">📈 Ultime 5 Partite 📈</h2>
            <p className="text-sm opacity-90 mt-1">
              Visualizza i risultati delle tue ultime partite giocate
            </p>
          </div>

          {recentSessions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📏</div>
              <p className="text-xl font-semibold text-gray-700 mb-2">
                Non hai giocato nessuna partita...per ora!
              </p>
              <p className="text-gray-600 mb-6">
                Inizia a giocare per vedere le tue partite qui!
              </p>
              <button
                onClick={() => router.push('/play')}
                className="px-6 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-semibold shadow-md transform hover:scale-105 transition"
              >
                🎮 Inizia a Giocare 🎮
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentSessions.map((session, index) => {
                const isBest = bestScore !== null && session.score === bestScore
                
                return (
                  <div
                    key={session.id}
                    className={`p-6 hover:bg-gray-50 transition-colors ${
                      isBest ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl font-bold text-gray-400">
                            #{index + 1}
                          </span>
                          {isBest && (
                            <span className="px-3 py-1 text-xs font-bold text-yellow-700 bg-yellow-200 rounded-full">
                              ⭐ MIGLIORE ⭐
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-1">
                          {formatDate(session.created_at)}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-3xl font-bold text-indigo-700">
                            {formatLength(session.score)} cm
                          </p>
                        </div>
                      </div>

                      {/* Dettagli Round */}
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                        <div className="text-center sm:text-right">
                          <p className="text-xs text-gray-500 mb-1">Round 1</p>
                          <p className="text-sm font-semibold text-gray-700">
                            {formatLength(session.round_1_target)} cm
                          </p>
                          <p className="text-xs text-indigo-600">
                            ±{formatLength(session.round_1_best_error)} cm
                          </p>
                        </div>
                        <div className="text-center sm:text-right">
                          <p className="text-xs text-gray-500 mb-1">Round 2</p>
                          <p className="text-sm font-semibold text-gray-700">
                            {formatLength(session.round_2_target)} cm
                          </p>
                          <p className="text-xs text-indigo-600">
                            ±{formatLength(session.round_2_best_error)} cm
                          </p>
                        </div>
                        <div className="text-center sm:text-right">
                          <p className="text-xs text-gray-500 mb-1">Round 3</p>
                          <p className="text-sm font-semibold text-gray-700">
                            {formatLength(session.round_3_target)} cm
                          </p>
                          <p className="text-xs text-indigo-600">
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
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6">📊 Statistiche 📊</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <p className="text-3xl font-bold text-indigo-700 mb-1">
                  {recentSessions.length}
                </p>
                <p className="text-sm text-gray-600">Partite Giocate</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-700 mb-1">
                  {bestScore !== null ? formatLength(bestScore) : '--'} cm
                </p>
                <p className="text-sm text-gray-600">Miglior Punteggio</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-3xl font-bold text-purple-700 mb-1">
                  {recentSessions.length > 0
                    ? formatLength(
                        recentSessions.reduce((sum, s) => sum + s.score, 0) /
                          recentSessions.length
                      )
                    : '--'}{' '}
                  cm
                </p>
                <p className="text-sm text-gray-600">Media Ultime {recentSessions.length} Partite</p>
              </div>
            </div>
          </div>
        )}

        {/* Pulsanti azione */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/play')}
            className="px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-lg transform hover:scale-105 transition"
          >
            🎮 Gioca Ora 🎮
          </button>
          <button
            onClick={() => router.push('/leaderboard')}
            className="px-8 py-4 text-lg font-semibold text-indigo-600 bg-white border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 shadow-lg transform hover:scale-105 transition"
          >
            🏆 Vedi Classifica 🏆
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-4 text-lg font-semibold text-gray-600 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 shadow-lg transform hover:scale-105 transition"
          >
            🏠 Home 🏠  
          </button>
        </div>
      </main>
    </>
  )
}
