'use client'

import { formatLength } from '@/lib/game'
import { Cifra } from './Cifra'

interface NewBestScoreProps {
  score: number
  previousBest: number | null
  onContinue: () => void
}

export function NewBestScore({ score, previousBest, onContinue }: NewBestScoreProps) {
  return (
    <div
      className="da-sinistra fixed inset-0 z-[60] flex flex-col justify-center bg-nastro px-5 text-pece"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nuovo-record"
    >
      <div className="mx-auto w-full max-w-3xl">
        <div className="dissolvi" style={{ ['--ritardo' as string]: '380ms' }}>
          <h1 id="nuovo-record" className="text-xl font-bold">Nuovo record personale</h1>
          <p className="cifre mt-4 text-[clamp(5rem,26vw,13rem)]">
            <Cifra valore={score} durata={1100} />
            <span className="text-[0.32em]"> cm</span>
          </p>
          {previousBest !== null && (
            <p className="mt-6 text-lg">
              Prima era <span className="font-bold line-through">{formatLength(previousBest)} cm</span>. Hai migliorato di{' '}
              <span className="font-bold">{formatLength(previousBest - score)} cm</span>.
            </p>
          )}
          <button onClick={onContinue} className="btn mt-10 bg-pece text-nastro">
            Continua
          </button>
        </div>
      </div>
    </div>
  )
}
