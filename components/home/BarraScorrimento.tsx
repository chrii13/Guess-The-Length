'use client'

import { useEffect, useRef } from 'react'
import { TACCHE } from './MetroDemo'

// Un metro sottile sotto la barra in alto che si allunga mentre scorri la pagina
export function BarraScorrimento() {
  const nastro = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    const aggiorna = () => {
      frame = 0
      const corsa = document.documentElement.scrollHeight - window.innerHeight
      const avanzamento = corsa > 0 ? Math.min(1, window.scrollY / corsa) : 0
      if (nastro.current) nastro.current.style.width = `${avanzamento * 100}%`
    }
    const programma = () => {
      if (!frame) frame = requestAnimationFrame(aggiorna)
    }
    aggiorna()
    window.addEventListener('scroll', programma, { passive: true })
    window.addEventListener('resize', programma)
    return () => {
      window.removeEventListener('scroll', programma)
      window.removeEventListener('resize', programma)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-14 z-40 h-2">
      <div ref={nastro} className="h-full border-b border-pece bg-nastro" style={{ ...TACCHE, width: 0 }} />
    </div>
  )
}
