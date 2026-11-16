'use client'

import { useEffect, useState } from 'react'

// Fa scorrere un numero da 0 al valore. Con "riduci movimento" mostra subito il valore.
export function useCountUp(valore: number, durataMs: number = 700): number {
  const [corrente, setCorrente] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCorrente(valore)
      return
    }

    let frame: number
    const inizio = performance.now()
    const passo = (ora: number) => {
      const t = Math.min(1, (ora - inizio) / durataMs)
      setCorrente(valore * (1 - Math.pow(1 - t, 3)))
      if (t < 1) frame = requestAnimationFrame(passo)
    }
    frame = requestAnimationFrame(passo)

    return () => cancelAnimationFrame(frame)
  }, [valore, durataMs])

  return corrente
}
