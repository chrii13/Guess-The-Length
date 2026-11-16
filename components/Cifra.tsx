'use client'

import { formatLength } from '@/lib/game'
import { useCountUp } from '@/hooks/useCountUp'

// Una lunghezza in cm che scorre fino al suo valore
export function Cifra({ valore, durata }: { valore: number; durata?: number }) {
  return <>{formatLength(useCountUp(valore, durata))}</>
}
