'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { useAuth } from '@/components/AuthProvider'
import { saveBestScore, getUserBestScore } from '@/lib/scores'
import { formatLength } from '@/lib/game'

export default function ResultPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const score = parseFloat(searchParams.get('score') || '0')
  const [bestScore, setBestScore] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user && score > 0) {
      loadBestScore()
      saveScore()
    }
  }, [user, loading, score, router])

  const loadBestScore = async () => {
    if (!user) return
    const best = await getUserBestScore(user.id)
    setBestScore(best)
  }

  const saveScore = async () => {
    if (!user || saving) return
    setSaving(true)
    await saveBestScore(user.id, score)
    await loadBestScore()
    setSaving(false)
  }

  if (loading || saving) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-xl text-gray-600">Caricamento...</p>
        </main>
      </>
    )
  }

  if (!user) {
    return null
  }

  const isNewRecord = bestScore === null || score < bestScore

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-indigo-900 mb-8">Risultato Partita</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="mb-6">
            <p className="text-lg text-gray-600 mb-2">Punteggio di questa partita</p>
            <p className="text-5xl font-bold text-indigo-700">{formatLength(score)} cm</p>
          </div>

          {bestScore !== null && (
            <div className="mb-6 pt-6 border-t">
              <p className="text-lg text-gray-600 mb-2">Il tuo miglior punteggio</p>
              <p className="text-4xl font-bold text-indigo-600">{formatLength(bestScore)} cm</p>
            </div>
          )}

          {isNewRecord && bestScore !== null && (
            <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 mb-4">
              <p className="text-xl font-bold text-yellow-800">🎉 Nuovo Record Personale!</p>
            </div>
          )}

          {bestScore === null && (
            <div className="bg-green-100 border-2 border-green-400 rounded-lg p-4 mb-4">
              <p className="text-xl font-bold text-green-800">✨ Primo punteggio salvato!</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/play')}
            className="px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-lg transform hover:scale-105 transition"
          >
            🎮 Rigioca
          </button>
          <button
            onClick={() => router.push('/leaderboard')}
            className="px-8 py-4 text-lg font-semibold text-indigo-600 bg-white border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 shadow-lg transform hover:scale-105 transition"
          >
            🏆 Vedi Classifica
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-4 text-lg font-semibold text-gray-600 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 shadow-lg transform hover:scale-105 transition"
          >
            🏠 Home
          </button>
        </div>
      </main>
    </>
  )
}

