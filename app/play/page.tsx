'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Meter } from '@/components/Meter'
import { CmReferenceBox } from '@/components/CmReferenceBox'
import { useAuth } from '@/components/AuthProvider'
import { generateRandomLength, calculateError, pixelsToCm, formatLength, cmToPixels } from '@/lib/game'
import { calibrate } from '@/lib/calibration'
import { saveGameSession, getUserBestScore, type RoundData } from '@/lib/scores'
import { NewBestScore } from '@/components/NewBestScore'
import { Confronto } from '@/components/Confronto'
import { Cifra } from '@/components/Cifra'

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

  const pagina = 'mx-auto max-w-3xl px-5 pb-16 pt-8 md:pt-14'

  if (loading) {
    return (
      <>
        <Navbar />
        <main className={pagina}>
          <div className="caricamento" role="status" aria-label="Caricamento" />
        </main>
      </>
    )
  }

  // Senza accesso si gioca come ospite: la partita funziona uguale ma non viene salvata
  const ospite = !user

  if (!gameStarted) {
    return (
      <>
        <Navbar />
        <main className={`${pagina} entra`}>
          <h1 className="cifre text-[clamp(3.2rem,13vw,7rem)]">
            Tre lunghezze, due tentativi.
          </h1>
          <p className="mt-8 max-w-[44ch] text-lg leading-relaxed">
            Allunga il metro fino alla lunghezza richiesta, a occhio.{' '}
            <span className="font-semibold">Andarci vicino conta solo a bocce... o quasi.</span>
          </p>
          <button onClick={startGame} className="btn btn-nastro mt-8 w-full sm:w-auto sm:px-14">
            Inizia partita
          </button>
          {ospite && (
            <p className="mt-4 max-w-[44ch] text-sm text-grafite">
              Stai giocando come ospite: il punteggio non viene salvato.{' '}
              <Link href="/login" className="collegamento text-inchiostro">Accedi</Link> o{' '}
              <Link href="/register" className="collegamento text-inchiostro">registrati</Link> per salvarlo.
            </p>
          )}
        </main>
      </>
    )
  }

  if (gameFinished) {
    // Il confronto va fatto con il record precedente: bestScore dopo il salvataggio include già questa partita
    const isNewRecord = previousBest !== null && totalScore < previousBest
    const isFirstGame = gameSaved && previousBest === null

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
        <main className={`${pagina} entra`}>
          <h1 className="text-lg font-bold">Partita terminata</h1>

          <p className="mt-8 text-grafite">In tre round hai sbagliato in tutto di</p>
          <p className="cifre mt-2 text-[clamp(5rem,24vw,12rem)]">
            <Cifra valore={totalScore} durata={1000} />
            <span className="text-[0.32em]"> cm</span>
          </p>

          {bestScore !== null && (
            <p className="mt-6 text-lg">
              Il tuo miglior punteggio: <span className="font-bold">{formatLength(bestScore)} cm</span>
            </p>
          )}

          {isNewRecord && !showNewBestScore && (
            <p className="mt-4 inline-block rounded-xl bg-nastro px-3 py-1.5 font-bold text-pece">Nuovo record personale</p>
          )}

          {isFirstGame && (
            <p className="mt-4 inline-block rounded-xl bg-nastro px-3 py-1.5 font-bold text-pece">Primo punteggio salvato</p>
          )}

          {saving && (
            <p className="mt-4 text-sm text-grafite">Salvataggio in corso...</p>
          )}

          {ospite && (
            <p className="mt-6 max-w-[48ch] rounded-2xl border border-nastro bg-nastro-tinta px-5 py-4">
              Hai giocato come ospite, quindi questo punteggio non è stato salvato.{' '}
              <Link href="/register" className="collegamento">Registrati</Link> o{' '}
              <Link href="/login" className="collegamento">accedi</Link> per salvare i prossimi ed entrare in classifica.
            </p>
          )}

          <ul className="mt-10 border-t border-riga">
            {rounds.map((round, idx) => (
              <li
                key={idx}
                className="riga-entra flex items-baseline justify-between gap-4 border-b border-riga py-3.5"
                style={{ ['--i' as string]: idx + 4 }}
              >
                <span className="font-semibold">Round {idx + 1}</span>
                <span className="text-right text-sm text-grafite">
                  Da indovinare {formatLength(round.target)} cm,{' '}
                  <span className="font-bold text-errore">scarto {formatLength(round.bestError)} cm</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
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
              className="btn btn-nastro sm:px-10"
            >
              Rigioca
            </button>
            {!ospite && (
              <button onClick={() => router.push('/result')} className="btn btn-linea">
                Vedi resoconto
              </button>
            )}
            <button onClick={() => router.push('/leaderboard')} className="btn btn-linea">
              Classifica
            </button>
            <Link href="/" className="collegamento self-center sm:ml-3">
              Home
            </Link>
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
    const bestAttempt = attempts.find((attempt) => calculateError(attempt, currentTarget) === currentBestError) ?? attempts[0]

    return (
      <>
        <Navbar />
        <main className={`${pagina} entra`}>
          <div className="flex items-baseline justify-between gap-4">
            <h1 className="text-lg font-bold">Round {currentRound + 1} di 3</h1>
            <p className="text-sm text-grafite">Completato</p>
          </div>

          <div className="mt-8 rounded-2xl bg-errore-tinta px-5 pb-5 pt-4">
            <p className="font-bold text-errore">Hai sbagliato di</p>
            <p className="cifre mt-2 text-[clamp(4rem,20vw,10rem)] text-errore">
              <Cifra valore={currentBestError} durata={900} />
              <span className="text-[0.32em]"> cm</span>
            </p>
          </div>

          <div className="-mx-5 mt-10 md:mx-0">
            <Confronto tuoCm={bestAttempt} giustoCm={currentTarget} />
          </div>

          <ul className="mt-10 border-t border-riga">
            {attempts.map((attempt, idx) => {
              const error = calculateError(attempt, currentTarget)
              const isBest = error === currentBestError
              return (
                <li
                  key={idx}
                  className={`flex items-baseline justify-between gap-4 border-b border-riga py-3.5 ${isBest ? 'font-bold' : 'text-grafite'}`}
                >
                  <span className="whitespace-nowrap">
                    Tentativo {idx + 1}: {formatLength(attempt)} cm
                  </span>
                  <span className="whitespace-nowrap text-sm">
                    scarto {formatLength(error)} cm
                  </span>
                </li>
              )
            })}
          </ul>

          <button onClick={handleNextRound} className="btn btn-inchiostro mt-10 w-full sm:w-auto sm:px-10">
            {currentRound < 2 ? 'Prossimo round' : 'Vedi il risultato finale'}
          </button>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main key={currentRound} className={`${pagina} entra`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            {/* Avanzamento a blocchi, come nella segnaletica di cantiere */}
            <div className="mb-3 flex gap-1.5" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`h-2.5 w-11 ${i <= currentRound ? 'bg-nastro' : 'bg-riga'}`} />
              ))}
            </div>
            <h1 className="text-lg font-bold">Round {currentRound + 1} di 3</h1>
            <p className="text-sm text-grafite">Tentativo {currentAttempt + 1} di 2</p>
          </div>
        </div>

        <p className="mt-8 text-grafite">Allunga il metro fino a</p>
        <p className="cifre mt-2 text-[clamp(5rem,24vw,12rem)]">
          <Cifra valore={currentTarget} durata={500} />
          <span className="text-[0.32em]"> cm</span>
        </p>

        {/* Non mostriamo la lunghezza attuale - l'utente deve indovinare ad occhio */}
        <div className="-mx-5 mt-8 md:mx-0">
          <Meter
            length={meterLength}
            onLengthChange={setMeterLength}
            maxLength={maxLength}
          />
        </div>
        {/* Il riferimento da 1 cm sta subito sotto il metro, per confrontarli a colpo d'occhio */}
        <div className="mt-2 flex items-start justify-between gap-6">
          <p className="text-sm text-grafite">
            Trascina il gancio, o usa le frecce, per allungare il metro. Usare un righello non è la scelta migliore.
          </p>
          <CmReferenceBox />
        </div>

        {attempts.length > 0 && (
          <div className="dissolvi mt-6 rounded-xl bg-nastro-tinta px-4 py-3 text-sm font-semibold">
            {attempts.map((attempt, idx) => {
              const error = calculateError(attempt, currentTarget)
              return (
                <p key={idx}>
                  Tentativo {idx + 1}: {formatLength(attempt)} cm, scarto {formatLength(error)} cm
                </p>
              )
            })}
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={roundComplete}
          className="btn btn-nastro mt-8 w-full sm:w-auto sm:px-14"
        >
          Conferma
        </button>
      </main>
    </>
  )
}
