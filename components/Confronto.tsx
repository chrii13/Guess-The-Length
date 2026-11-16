'use client'

import { cmToPixels, formatLength } from '@/lib/game'

// Il metro del giocatore e la lunghezza giusta, uno sotto l'altro in scala reale.
// Il tratto rosso è lo scarto tra i due.
export function Confronto({ tuoCm, giustoCm }: { tuoCm: number; giustoCm: number }) {
  const tuo = cmToPixels(tuoCm)
  const giusto = cmToPixels(giustoCm)
  const corto = Math.min(tuo, giusto)
  const scarto = Math.abs(tuo - giusto)

  return (
    <div className="overflow-x-auto">
      <div style={{ width: `${Math.max(tuo, giusto)}px` }}>
        <p className="mb-1.5 whitespace-nowrap pl-5 text-sm text-grafite md:pl-0">Il tuo metro, {formatLength(tuoCm)} cm</p>
        <div
          className="srotola h-11 border-y border-pece bg-nastro"
          style={{ width: `${tuo}px` }}
        />

        <p className="mb-1.5 mt-5 whitespace-nowrap pl-5 text-sm text-grafite md:pl-0">Lunghezza giusta, {formatLength(giustoCm)} cm</p>
        <div className="flex h-4">
          <div
            className="srotola border-y border-r border-inchiostro"
            style={{ width: `${corto}px`, ['--ritardo' as string]: '350ms' }}
          />
          <div
            className="srotola bg-errore"
            style={{ width: `${scarto}px`, ['--ritardo' as string]: '950ms' }}
          />
        </div>
      </div>
    </div>
  )
}
