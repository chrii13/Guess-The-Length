'use client'

import { cmToPixels } from '@/lib/game'

// Un pezzo di metro lungo 1 cm, alla stessa scala e con lo stesso inizio del metro di gioco:
// sta subito sotto, così il confronto è diretto
export function Campione() {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-6 border-y border-r border-pece bg-nastro md:rounded-l-md md:border-l"
        style={{ width: `${cmToPixels(1)}px` }}
        aria-hidden="true"
      />
      <p className="cifre text-xl text-nastro">1 cm</p>
    </div>
  )
}
