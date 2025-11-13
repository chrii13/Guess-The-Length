'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Meter } from '@/components/Meter'
import { CalibrationMeter } from '@/components/CalibrationMeter'
import { CmReferenceBox } from '@/components/CmReferenceBox'
import { useAuth } from '@/components/AuthProvider'
import { generateRandomLength, calculateError, pixelsToCm, formatLength, cmToPixels } from '@/lib/game'
import { calibrate, setCalibration } from '@/lib/calibration'
import { saveGameSession, getUserBestScore, type RoundData } from '@/lib/scores'
import { NewBestScore } from '@/components/NewBestScore'

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
  const [isCalibrated, setIsCalibrated] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameFinished, setGameFinished] = useState(false)
  const [totalScore, setTotalScore] = useState(0)
  const [roundComplete, setRoundComplete] = useState(false)
  const [showRoundResult, setShowRoundResult] = useState(false)
  const [saving, setSaving] = useState(false)
  const [bestScore, setBestScore] = useState<number | null>(null)
  const [previousBest, setPreviousBest] = useState<number | null>(null)
  const [showNewBestScore, setShowNewBestScore] = useState(false)
  const [gameSaved, setGameSaved] = useState(false)

  const maxLength = cmToPixels(15) // Massimo 15 cm

  // Controlla se c'è già una calibrazione salvata
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('meter_game_pixels_per_cm')
      if (saved && parseFloat(saved) > 0) {
        setIsCalibrated(true)
        calibrate() // Carica la calibrazione salvata
      } else {
        // Non c'è calibrazione salvata, mostra la schermata di calibrazione
        setIsCalibrated(false)
      }
    }
  }, [])

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
    setRoundComplete(false)
    setShowRoundResult(false)
    setSaving(false)
    setGameSaved(false)
    setShowNewBestScore(false)
    setBestScore(null)
    setPreviousBest(null)
  }

  const handleConfirm = () => {
    if (!gameStarted || gameFinished || roundComplete) return

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
      // Fine di questo round - mostra il risultato
      setRoundComplete(true)
      setShowRoundResult(true)
    }
  }

  const handleNextRound = async () => {
    if (currentRound < 2) {
      // Passa al prossimo round
      setCurrentRound(currentRound + 1)
      setCurrentAttempt(0)
      setMeterLength(cmToPixels(5))
      setRoundComplete(false)
      setShowRoundResult(false)
    } else {
      // Fine del gioco - calcola il punteggio finale
      const finalScore = rounds.reduce((sum, round) => sum + round.bestError, 0)
      setTotalScore(finalScore)
      setGameFinished(true)
      setShowRoundResult(false)
      
      // Salva la partita
      if (user && !gameSaved) {
        await saveGameResult(finalScore)
      }
    }
  }

  const saveGameResult = async (score: number) => {
    if (!user || saving || gameSaved) return
    
    setSaving(true)
    try {
      // Carica il best score attuale prima di salvare
      const currentBest = await getUserBestScore(user.id)
      setPreviousBest(currentBest)
      setBestScore(currentBest)
      
      // Prepara i dati dei round
      const roundsData: RoundData[] = rounds.map(round => ({
        target: round.target,
        bestError: round.bestError,
      }))
      
      // Salva la partita
      await saveGameSession(user.id, score, roundsData)
      
      // Verifica se è un nuovo best score
      const newBest = await getUserBestScore(user.id)
      setBestScore(newBest)
      
      // Mostra la schermata nuovo best score se è un nuovo record
      if (currentBest === null || score < currentBest) {
        setShowNewBestScore(true)
      }
      
      setGameSaved(true)
    } catch (error) {
      console.error('Error saving game result:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleContinueFromBestScore = () => {
    setShowNewBestScore(false)
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

  // Schermata di calibrazione
  if (!isCalibrated) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-16">
          <CalibrationMeter 
            onCalibrated={(ratio) => {
              setCalibration(ratio)
              setIsCalibrated(true)
            }} 
          />
        </main>
      </>
    )
  }

  if (!gameStarted) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-indigo-900 mb-8">Inizia a Giocare</h1>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Allunga il metro per indovinare la lunghezza esatta. 
            <br />
            <span className="font-semibold text-indigo-700">Andarci vicino conta solo a bocce...o quasi!</span>
          </p>
          <button
            onClick={startGame}
            className="px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-lg transform hover:scale-105 transition"
          >
            🎮 Inizia a Giocare 🎮
          </button>
        </main>
      </>
    )
  }

  if (gameFinished) {
    const isNewRecord = bestScore !== null && totalScore < bestScore
    const isFirstGame = bestScore === null

    return (
      <>
        <Navbar />
        {showNewBestScore && isNewRecord && (
          <NewBestScore
            score={totalScore}
            previousBest={previousBest}
            onContinue={handleContinueFromBestScore}
          />
        )}
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-indigo-900 mb-8">Partita Terminata!</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            {/* Punteggio totale */}
            <div className="mb-6">
              <p className="text-lg text-gray-600 mb-2">Punteggio di questa partita</p>
              <p className="text-5xl font-bold text-indigo-700">{formatLength(totalScore)} cm</p>
            </div>

            {/* Miglior punteggio */}
            {bestScore !== null && (
              <div className="mb-6 pt-6 border-t">
                <p className="text-lg text-gray-600 mb-2">Il tuo miglior punteggio</p>
                <p className="text-4xl font-bold text-indigo-600">{formatLength(bestScore)} cm</p>
              </div>
            )}

            {/* Messaggio nuovo record */}
            {isNewRecord && bestScore !== null && !showNewBestScore && (
              <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 mb-4">
                <p className="text-xl font-bold text-yellow-800">🎉 Nuovo Record Personale! 🎉</p>
              </div>
            )}

            {/* Messaggio primo punteggio */}
            {isFirstGame && (
              <div className="bg-green-100 border-2 border-green-400 rounded-lg p-4 mb-4">
                <p className="text-xl font-bold text-green-800">✨ Primo punteggio salvato! ✨</p>
              </div>
            )}

            {/* Dettagli dei round */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm font-semibold text-gray-700 mb-3">Dettagli dei Round:</p>
              <div className="space-y-2 text-left max-w-md mx-auto">
                {rounds.map((round, idx) => (
                  <div key={idx} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Round {idx + 1}:</span>
                    <div className="text-right">
                      <span className="text-sm text-gray-600 block">Target: {formatLength(round.target)} cm</span>
                      <span className="text-sm font-semibold text-indigo-700">Errore: {formatLength(round.bestError)} cm</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Loading state */}
            {saving && (
              <div className="mt-4 text-sm text-gray-500">
                Salvataggio in corso...
              </div>
            )}
          </div>

          {/* Pulsanti azione */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                setGameFinished(false)
                setGameStarted(false)
                setRoundComplete(false)
                setShowRoundResult(false)
                setGameSaved(false)
                setShowNewBestScore(false)
                startGame()
              }}
              className="px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-lg transform hover:scale-105 transition"
            >
              🎮 Rigioca
            </button>
            <button
              onClick={() => router.push('/result')}
              className="px-8 py-4 text-lg font-semibold text-indigo-600 bg-white border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 shadow-lg transform hover:scale-105 transition"
            >
              📊 Vedi Resoconto
            </button>
            <button
              onClick={() => router.push('/leaderboard')}
              className="px-8 py-4 text-lg font-semibold text-indigo-600 bg-white border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 shadow-lg transform hover:scale-105 transition"
            >
              🏆 Classifica
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

  const currentTarget = rounds[currentRound]?.target || 0
  const attempts = rounds[currentRound]?.attempts || []
  const currentBestError = rounds[currentRound]?.bestError || Infinity

  // Schermata risultato round
  if (showRoundResult && roundComplete) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-16 relative">
          <CmReferenceBox />
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-indigo-900 mb-4">
                Round {currentRound + 1} di 3 - Completato!
              </h1>
              
              <div className="bg-indigo-100 rounded-lg p-6 mb-6">
                <p className="text-sm text-gray-600 mb-2">Lunghezza da indovinare</p>
                <p className="text-3xl font-bold text-indigo-700 mb-4">
                  {formatLength(currentTarget)} cm
                </p>
                
                <div className="mt-4 pt-4 border-t border-indigo-200">
                  <p className="text-sm text-gray-600 mb-2">Risultato migliore</p>
                  <p className="text-4xl font-bold text-green-600">
                    Errore: {formatLength(currentBestError)} cm
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">I tuoi tentativi:</p>
                <div className="space-y-2">
                  {attempts.map((attempt, idx) => {
                    const error = calculateError(attempt, currentTarget)
                    const isBest = error === currentBestError
                    return (
                      <div 
                        key={idx} 
                        className={`flex justify-between items-center p-2 rounded ${
                          isBest ? 'bg-green-100 border-2 border-green-400' : 'bg-white'
                        }`}
                      >
                        <span className="text-sm text-gray-700">
                          Tentativo {idx + 1}: {formatLength(attempt)} cm
                        </span>
                        <span className={`text-sm font-semibold ${
                          isBest ? 'text-green-700' : 'text-gray-600'
                        }`}>
                          Errore: {formatLength(error)} cm
                          {isBest && ' ⭐'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <button
                onClick={handleNextRound}
                className="px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-lg transform hover:scale-105 transition"
              >
                {currentRound < 2 ? 'Prossimo Round →' : 'Vedi Risultato Finale'}
              </button>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-16 relative">
        {/* Riferimento 1cm in alto a sinistra */}
        <CmReferenceBox />
        
        <div className="bg-white rounded-lg shadow-lg p-8 mt-32">
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
            <div className="flex items-center justify-center">
              {/* Metro giallo allungabile (centrato, senza riferimento a sinistra) */}
              <Meter
                length={meterLength}
                onLengthChange={setMeterLength}
                maxLength={maxLength}
              />
            </div>
            {/* Non mostriamo la lunghezza attuale - l'utente deve indovinare ad occhio */}
          </div>

          <div className="text-center">
            <button
              onClick={handleConfirm}
              disabled={roundComplete}
              className="px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-lg transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Conferma Tentativo
            </button>
          </div>
        </div>
      </main>
    </>
  )
}

