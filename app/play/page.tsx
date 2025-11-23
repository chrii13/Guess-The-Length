'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Navbar } from '@/components/Navbar'
import { Meter } from '@/components/Meter'
import { CmReferenceBox } from '@/components/CmReferenceBox'
import { useAuth } from '@/components/AuthProvider'
import { generateRandomLength, calculateError, pixelsToCm, formatLength, cmToPixels } from '@/lib/game'
import { calibrate } from '@/lib/calibration'
import { saveGameSession, getUserBestScore, type RoundData } from '@/lib/scores'
import { NewBestScore } from '@/components/NewBestScore'
import { SvgIcon } from '@/components/SvgIcon'
import { useTheme } from '@/hooks/useTheme'

interface Round {
  target: number
  attempts: number[]
  bestError: number
}

export default function PlayPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { theme, mounted: themeMounted, imageVersion } = useTheme()
  const [rounds, setRounds] = useState<Round[]>([])
  const [currentRound, setCurrentRound] = useState(0)
  const [currentAttempt, setCurrentAttempt] = useState(0)
  const [meterLength, setMeterLength] = useState(cmToPixels(5)) // Inizia a 5 cm
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

  // Inizializza la calibrazione con valore di default
  useEffect(() => {
    if (typeof window !== 'undefined') {
      calibrate() // Inizializza la calibrazione (usa valore salvato o default)
    }
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const startGame = () => {
    // Su mobile, limitare le lunghezze target a 8cm per evitare che il metro esca dallo schermo
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const maxTargetCm = isMobile ? 8 : 15
    
    const newRounds: Round[] = Array.from({ length: 3 }, () => ({
      target: generateRandomLength(maxTargetCm),
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
        <main className="max-w-4xl mx-auto px-4 py-8 md:py-16 text-center">
          <p className="text-lg md:text-xl text-primary-gray-medium dark:text-primary-gray-light">Caricamento...</p>
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
        <main className="max-w-4xl mx-auto px-4 py-8 md:py-16 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-[175px] h-[175px] md:w-[200px] md:h-[200px] flex mb-2 bg-transparent dark:bg-transparent">
            <Image
              key={`play-${theme}-${imageVersion}`}
              src={`${themeMounted && theme === 'dark' ? "/assets/icons/play-dark.svg" : "/assets/icons/play.svg"}?v=${theme}-${imageVersion}`}
              alt="Play Icon"
              width={200}
              height={200}
              className="w-full h-full pointer-events-none object-contain pulse-scale"
              style={{ backgroundColor: 'transparent', background: 'transparent', display: 'block', objectPosition: 'center', transformOrigin: 'center' }}
              unoptimized
            />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-gray-dark dark:text-primary-gray-light mb-4 md:mb-6 bg-gradient-to-r from-primary-gray-dark via-primary-gray-medium to-primary-gray-dark dark:from-primary-gray-light dark:via-primary-yellow dark:to-primary-gray-light bg-clip-text text-transparent">
            Inizia a Giocare
          </h1>
          <p className="text-base md:text-lg text-primary-gray-medium dark:text-primary-gray-light mb-6 md:mb-8 max-w-2xl mx-auto">
            Allunga il metro per indovinare la lunghezza esatta. 
            <br />
            <span className="font-bold text-primary-gray-dark dark:text-primary-gray-light">Andarci vicino conta solo a bocce...o quasi!</span>
          </p>
          <button
            onClick={startGame}
            className="px-8 md:px-12 py-4 md:py-5 text-base md:text-lg font-bold bg-gradient-to-r from-primary-yellow to-primary-yellow-dark rounded-2xl-large hover:shadow-yellow-glow transition-all shadow-soft-lg transform hover:scale-105 active:scale-95"
            style={{ color: '#1C1C1C' }}
          >
             Inizia Partita 
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
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 text-center relative z-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-gray-dark dark:text-primary-gray-light mb-6 md:mb-8 bg-gradient-to-r from-primary-gray-dark via-primary-gray-medium to-primary-gray-dark dark:from-primary-gray-light dark:via-primary-yellow dark:to-primary-gray-light bg-clip-text text-transparent">
            Partita Terminata!
          </h1>
          
          <div className="bg-white/90 dark:bg-primary-gray-medium backdrop-blur-sm rounded-2xl-large shadow-soft-lg p-6 md:p-8 mb-6 md:mb-8 border border-primary-gray-light dark:border-primary-gray-medium">
            {/* Punteggio totale */}
            <div className="mb-6">
              <p className="text-base md:text-lg text-primary-gray-medium dark:text-primary-gray-light mb-2 font-medium">Punteggio di questa partita</p>
              <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-gray-dark dark:text-primary-gray-light">{formatLength(totalScore)} cm</p>
            </div>

            {/* Miglior punteggio */}
            {bestScore !== null && (
              <div className="mb-6 pt-6 border-t border-primary-gray-light dark:border-primary-gray-medium">
                <p className="text-base md:text-lg text-primary-gray-medium dark:text-primary-gray-light mb-2 font-medium">Il tuo miglior punteggio</p>
                <p className="text-3xl md:text-4xl font-bold text-primary-yellow-dark dark:text-primary-yellow">{formatLength(bestScore)} cm</p>
              </div>
            )}

            {/* Messaggio nuovo record */}
            {isNewRecord && bestScore !== null && !showNewBestScore && (
              <div className="bg-primary-yellow/20 border-2 border-primary-yellow rounded-xl-large p-4 mb-4">
                <p className="text-lg md:text-xl font-bold text-primary-yellow-dark">Nuovo Record Personale!</p>
              </div>
            )}

            {/* Messaggio primo punteggio */}
            {isFirstGame && (
              <div className="bg-primary-blue/20 border-2 border-primary-blue rounded-xl-large p-4 mb-4">
                <p className="text-lg md:text-xl font-bold text-primary-blue">Primo punteggio salvato!</p>
              </div>
            )}

            {/* Dettagli dei round */}
            <div className="mt-6 pt-6 border-t border-primary-gray-light dark:border-primary-gray-medium">
              <p className="text-sm md:text-base font-bold text-primary-gray-dark dark:text-primary-gray-light mb-3">Dettagli dei Round:</p>
              <div className="space-y-2 text-left max-w-md mx-auto">
                {rounds.map((round, idx) => (
                  <div key={idx} className="flex justify-between p-3 md:p-4 bg-primary-gray-light dark:bg-primary-gray-dark rounded-xl-large border border-primary-gray-light dark:border-primary-gray-medium">
                    <span className="font-semibold text-primary-gray-dark dark:text-primary-gray-light">Round {idx + 1}:</span>
                    <div className="text-right">
                      <span className="text-xs md:text-sm text-primary-gray-medium dark:text-primary-gray-light block">Target: {formatLength(round.target)} cm</span>
                      <span className="text-xs md:text-sm font-bold text-primary-yellow-dark dark:text-primary-yellow">Errore: {formatLength(round.bestError)} cm</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Loading state */}
            {saving && (
              <div className="mt-4 text-sm md:text-base text-primary-gray-medium dark:text-primary-gray-light font-medium">
                Salvataggio in corso...
              </div>
            )}
          </div>

          {/* Pulsanti azione */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
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
              className="px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-bold bg-gradient-to-r from-primary-yellow to-primary-yellow-dark rounded-xl-large hover:shadow-yellow-glow transition-all shadow-soft-lg transform hover:scale-105 active:scale-95"
              style={{ color: '#1C1C1C' }}
            >
              Rigioca
            </button>
            <button
              onClick={() => router.push('/result')}
              className="px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-bold text-primary-gray-dark dark:text-primary-gray-light bg-white dark:bg-primary-gray-medium border-2 border-primary-yellow dark:border-primary-yellow-dark rounded-xl-large hover:bg-primary-yellow/10 dark:hover:bg-primary-yellow-dark/20 transition-all shadow-soft-lg transform hover:scale-105 active:scale-95"
            >
              Vedi Resoconto
            </button>
            <button
              onClick={() => router.push('/leaderboard')}
              className="px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-bold text-primary-gray-dark dark:text-primary-gray-light bg-white dark:bg-primary-gray-medium border-2 border-primary-yellow dark:border-primary-yellow-dark rounded-xl-large hover:bg-primary-yellow/10 dark:hover:bg-primary-yellow-dark/20 transition-all shadow-soft-lg transform hover:scale-105 active:scale-95"
            >
              Classifica
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
              <Image
                key={`home-${theme}-${imageVersion}`}
                src={`${themeMounted && theme === 'dark' ? "/assets/icons/home-dark.svg" : "/assets/icons/home.svg"}?v=${theme}-${imageVersion}`}
                alt="Home"
                width={64}
                height={64}
                className="w-14 h-14 md:w-16 md:h-16 pointer-events-none"
                style={{ backgroundColor: 'transparent', background: 'transparent', display: 'block', transform: 'scale(2.5)', transformOrigin: 'center', margin: '0 auto', marginTop: '8px' }}
                unoptimized
              />
            </div>
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
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 relative z-10">
          <div className="bg-white/90 dark:bg-primary-gray-medium backdrop-blur-sm rounded-2xl-large shadow-soft-lg p-6 md:p-8 border border-primary-gray-light dark:border-primary-gray-medium">
            <div className="text-center mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary-gray-dark dark:text-primary-gray-light mb-4">
                Round {currentRound + 1} di 3 - Completato!
              </h1>
              
              <div className="bg-primary-yellow/10 dark:bg-primary-yellow-dark/10 rounded-xl-large p-5 md:p-6 mb-6 border-2 border-primary-yellow/30 dark:border-primary-yellow-dark/30">
                <p className="text-xs md:text-sm text-primary-gray-medium dark:text-primary-gray-light mb-2 font-medium">Lunghezza da indovinare</p>
                <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary-gray-dark dark:text-primary-gray-light mb-4">
                  {formatLength(currentTarget)} cm
                </p>
                
                <div className="mt-4 pt-4 border-t border-primary-yellow/30 dark:border-primary-yellow-dark/30">
                  <p className="text-xs md:text-sm text-primary-gray-medium dark:text-primary-gray-light mb-2 font-medium">Risultato migliore</p>
                  <p className="text-3xl md:text-4xl font-bold text-primary-yellow-dark dark:text-primary-yellow">
                    Errore: {formatLength(currentBestError)} cm
                  </p>
                </div>
              </div>

              <div className="bg-primary-gray-light dark:bg-primary-gray-dark rounded-xl-large p-4 md:p-5 mb-6 border border-primary-gray-light dark:border-primary-gray-medium">
                <p className="text-xs md:text-sm font-bold text-primary-gray-dark dark:text-primary-gray-light mb-3">I tuoi tentativi:</p>
                <div className="space-y-2">
                  {attempts.map((attempt, idx) => {
                    const error = calculateError(attempt, currentTarget)
                    const isBest = error === currentBestError
                    return (
                      <div 
                        key={idx} 
                        className={`flex justify-between items-center p-3 md:p-4 rounded-xl-large ${
                          isBest ? 'bg-primary-yellow/20 dark:bg-primary-yellow-dark/20 border-2 border-primary-yellow dark:border-primary-yellow-dark' : 'bg-white dark:bg-primary-gray-medium border border-primary-gray-light dark:border-primary-gray-medium'
                        }`}
                      >
                        <span className="text-xs md:text-sm text-primary-gray-dark dark:text-primary-gray-light font-medium">
                          Tentativo {idx + 1}: {formatLength(attempt)} cm
                        </span>
                        <span className={`text-xs md:text-sm font-bold ${
                          isBest ? 'text-primary-yellow-dark dark:text-primary-yellow' : 'text-primary-gray-medium dark:text-primary-gray-light'
                        }`}>
                          Errore: {formatLength(error)} cm
                          {isBest && ' • Migliore'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <button
                onClick={handleNextRound}
                className="px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-bold bg-gradient-to-r from-primary-yellow to-primary-yellow-dark rounded-xl-large hover:shadow-yellow-glow transition-all shadow-soft-lg transform hover:scale-105 active:scale-95"
                style={{ color: '#1C1C1C' }}
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
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 relative z-10">
          <div className="bg-white/90 dark:bg-primary-gray-medium backdrop-blur-sm rounded-2xl-large shadow-soft-lg p-6 md:p-8 border border-primary-gray-light dark:border-primary-gray-medium relative">
            <CmReferenceBox />
            <div className="text-center mb-6 md:mb-8 pt-20 md:pt-0">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary-gray-dark dark:text-primary-gray-light mb-3 md:mb-4">
              Round {currentRound + 1} di 3
            </h1>
            <p className="text-base md:text-lg text-primary-gray-medium dark:text-primary-gray-light mb-3 md:mb-4 font-medium">
              Tentativo {currentAttempt + 1} di 2
            </p>
            <div className="bg-primary-yellow/10 dark:bg-primary-yellow-dark/10 rounded-xl-large p-4 md:p-6 mb-4 md:mb-6 border-2 border-primary-yellow/30 dark:border-primary-yellow-dark/30">
              <p className="text-xs md:text-sm text-primary-gray-medium dark:text-primary-gray-light mb-1 md:mb-2 font-medium">Lunghezza da indovinare</p>
              <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-gray-dark dark:text-primary-gray-light">
                {formatLength(currentTarget)} cm
              </p>
            </div>
            {attempts.length > 0 && (
              <div className="mt-4 space-y-2">
                {attempts.map((attempt, idx) => {
                  const error = calculateError(attempt, currentTarget)
                  return (
                    <p key={idx} className="text-xs md:text-sm text-primary-gray-medium dark:text-primary-gray-light font-medium">
                      Tentativo {idx + 1}: {formatLength(attempt)} cm 
                      (errore: {formatLength(error)} cm)
                    </p>
                  )
                })}
              </div>
            )}
          </div>

          <div className="mb-6 md:mb-8 overflow-hidden">
            <div className="flex items-center justify-center w-full">
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
              className="px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-bold text-primary-gray-dark dark:text-primary-gray-dark bg-gradient-to-r from-primary-yellow to-primary-yellow-dark rounded-xl-large hover:shadow-yellow-glow transition-all shadow-soft-lg transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Conferma Tentativo
            </button>
          </div>
        </div>
      </main>
    </>
  )
}

