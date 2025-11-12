'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Meter } from '@/components/Meter'
import { useAuth } from '@/components/AuthProvider'
import { generateRandomLength, calculateError, pixelsToCm, formatLength, cmToPixels } from '@/lib/game'

interface Round {
  target: number
  attempts: number[]
  bestError: number
}

export default function PlayPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [rounds, setRounds] = useState<Round[]>([])
  const [currentRound, setCurrentRound] = useState(0)
  const [currentAttempt, setCurrentAttempt] = useState(0)
  const [meterLength, setMeterLength] = useState(cmToPixels(5)) // Inizia a 5 cm
  const [gameStarted, setGameStarted] = useState(false)
  const [gameFinished, setGameFinished] = useState(false)
  const [totalScore, setTotalScore] = useState(0)

  const maxLength = cmToPixels(15) // Massimo 15 cm

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const startGame = () => {
    const newRounds: Round[] = Array.from({ length: 3 }, () => ({
      target: generateRandomLength(),
      attempts: [],
      bestError: Infinity,
    }))
    setRounds(newRounds)
    setCurrentRound(0)
    setCurrentAttempt(0)
    setMeterLength(cmToPixels(5))
    setGameStarted(true)
    setGameFinished(false)
    setTotalScore(0)
  }

  const handleConfirm = () => {
    if (!gameStarted || gameFinished) return

    const currentLengthCm = pixelsToCm(meterLength)
    const error = calculateError(currentLengthCm, rounds[currentRound].target)

    const newRounds = [...rounds]
    newRounds[currentRound].attempts.push(currentLengthCm)
    
    if (error < newRounds[currentRound].bestError) {
      newRounds[currentRound].bestError = error
    }

    setRounds(newRounds)

    // Controlla se ci sono altri tentativi o round
    if (currentAttempt < 1) {
      // C'è ancora un tentativo per questo round
      setCurrentAttempt(currentAttempt + 1)
      setMeterLength(cmToPixels(5)) // Reset per il prossimo tentativo
    } else {
      // Fine di questo round
      if (currentRound < 2) {
        // Passa al prossimo round
        setCurrentRound(currentRound + 1)
        setCurrentAttempt(0)
        setMeterLength(cmToPixels(5))
      } else {
        // Fine del gioco
        const finalScore = newRounds.reduce((sum, round) => sum + round.bestError, 0)
        setTotalScore(finalScore)
        setGameFinished(true)
      }
    }
  }

  if (loading) {
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

  if (!gameStarted) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-indigo-900 mb-8">Inizia a Giocare</h1>
          <button
            onClick={startGame}
            className="px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-lg transform hover:scale-105 transition"
          >
            Inizia Partita
          </button>
        </main>
      </>
    )
  }

  if (gameFinished) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-indigo-900 mb-8">Partita Finita!</h1>
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <p className="text-2xl font-bold text-indigo-700 mb-4">
              Punteggio Totale: {formatLength(totalScore)} cm
            </p>
            <div className="space-y-2 text-left max-w-md mx-auto">
              {rounds.map((round, idx) => (
                <div key={idx} className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>Round {idx + 1}:</span>
                  <span className="font-semibold">
                    Target: {formatLength(round.target)} cm | 
                    Miglior errore: {formatLength(round.bestError)} cm
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/result?score=' + totalScore)}
              className="px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-lg"
            >
              Vedi Risultato
            </button>
            <button
              onClick={startGame}
              className="px-8 py-4 text-lg font-semibold text-indigo-600 bg-white border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 shadow-lg"
            >
              Rigioca
            </button>
          </div>
        </main>
      </>
    )
  }

  const currentTarget = rounds[currentRound]?.target || 0
  const attempts = rounds[currentRound]?.attempts || []

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-indigo-900 mb-4">
              Round {currentRound + 1} di 3
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              Tentativo {currentAttempt + 1} di 2
            </p>
            <div className="bg-indigo-100 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">Lunghezza da indovinare</p>
              <p className="text-4xl font-bold text-indigo-700">
                {formatLength(currentTarget)} cm
              </p>
            </div>
            {attempts.length > 0 && (
              <div className="mt-4 space-y-1">
                {attempts.map((attempt, idx) => {
                  const error = calculateError(attempt, currentTarget)
                  return (
                    <p key={idx} className="text-sm text-gray-600">
                      Tentativo {idx + 1}: {formatLength(attempt)} cm 
                      (errore: {formatLength(error)} cm)
                    </p>
                  )
                })}
              </div>
            )}
          </div>

          <div className="mb-8">
            <Meter
              length={meterLength}
              onLengthChange={setMeterLength}
              maxLength={maxLength}
            />
          </div>

          <div className="text-center">
            <button
              onClick={handleConfirm}
              className="px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-lg transform hover:scale-105 transition"
            >
              Conferma Tentativo
            </button>
          </div>
        </div>
      </main>
    </>
  )
}

