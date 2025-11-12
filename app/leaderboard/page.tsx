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
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-indigo-900 mb-8 text-center">🏆 Classifica</h1>
        
        {loading ? (
          <div className="text-center">
            <p className="text-xl text-gray-600">Caricamento classifica...</p>
          </div>
        ) : scores.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-xl text-gray-600">Nessun punteggio ancora. Sii il primo!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Posizione</th>
                  <th className="px-6 py-4 text-left">Username</th>
                  <th className="px-6 py-4 text-right">Miglior Punteggio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {scores.map((score, index) => (
                  <tr
                    key={score.id}
                    className={index < 3 ? 'bg-yellow-50' : 'hover:bg-gray-50'}
                  >
                    <td className="px-6 py-4">
                      <span className="text-2xl font-bold">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {score.username}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-indigo-700">
                      {formatLength(score.best_score)} cm
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={loadLeaderboard}
            className="px-6 py-3 text-indigo-600 bg-white border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 font-semibold"
          >
            🔄 Aggiorna
          </button>
        </div>
      </main>
    </>
  )
}

