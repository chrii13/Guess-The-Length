'use client'

import { useEffect, useRef, useState } from 'react'
import { calibrate } from '@/lib/calibration'
import { cmToPixels, formatLength } from '@/lib/game'

const LUNGHEZZE = [7.4, 3.45, 9.8, 5.15, 12.6, 2.3]

// Diametro della cassa tonda del metro, come nel logo
const CASSA = 64

// Tacche irregolari del nastro, come nel gioco
export const TACCHE = {
  backgroundImage:
    'linear-gradient(90deg, rgb(var(--pece)) 0 1px, transparent 1px), linear-gradient(90deg, rgb(var(--pece)) 0 2px, transparent 2px)',
  backgroundSize: '13px 36%, 91px 68%',
  backgroundRepeat: 'repeat-x',
  backgroundPosition: '9px 0, 48px 0',
}

// La domanda del gioco con un metro che si allunga da solo fino alla lunghezza, poi si riavvolge e passa alla successiva
export function MetroDemo() {
  const contenitore = useRef<HTMLDivElement>(null)
  const [indice, setIndice] = useState(0)
  const [aperto, setAperto] = useState(false)
  const [massimo, setMassimo] = useState(0)

  useEffect(() => {
    calibrate()
    // Spazio per il nastro: tolti la cassa del metro e il gancio
    const misura = () => setMassimo((contenitore.current?.clientWidth ?? 0) - CASSA - 18)
    misura()
    window.addEventListener('resize', misura)
    return () => window.removeEventListener('resize', misura)
  }, [])

  useEffect(() => {
    const avvio = setTimeout(() => setAperto(true), 500)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => clearTimeout(avvio)

    let chiudi: ReturnType<typeof setTimeout>
    let riapri: ReturnType<typeof setTimeout>
    const giro = () => {
      chiudi = setTimeout(() => {
        setAperto(false)
        riapri = setTimeout(() => {
          setIndice((i) => (i + 1) % LUNGHEZZE.length)
          setAperto(true)
          giro()
        }, 600)
      }, 2800)
    }
    giro()

    return () => {
      clearTimeout(avvio)
      clearTimeout(chiudi)
      clearTimeout(riapri)
    }
  }, [])

  // Solo misure che il metro può mostrare per intero: su telefono restano quelle corte
  const disponibili = massimo > 0 ? LUNGHEZZE.filter((l) => cmToPixels(l) <= massimo) : LUNGHEZZE
  const elenco = disponibili.length > 0 ? disponibili : [Math.min(...LUNGHEZZE)]
  const cm = elenco[indice % elenco.length]
  const larghezza = aperto && massimo > 0 ? cmToPixels(cm) : 26

  return (
    <div>
      <p className="font-display text-[clamp(1.8rem,7vw,3rem)] uppercase leading-tight tracking-[0.02em]" aria-live="off">
        Quanto sono lunghi{' '}
        <span className="whitespace-nowrap">
          <span key={indice} className="numero-cambia inline-block text-nastro">
            {formatLength(cm)} cm
          </span>
          ?
        </span>
      </p>

      {/* Il metro esce dalla cassa tonda del logo Flessometro */}
      <div ref={contenitore} className="mt-6 flex h-20 items-end" aria-hidden="true">
        <div
          className="relative z-10 flex shrink-0 items-center justify-center rounded-full border-[5px] border-pece bg-nastro"
          style={{ width: CASSA, height: CASSA }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pece">
            <div className="h-3 w-3 rounded-full bg-nastro" />
          </div>
        </div>
        <div
          className="relative -ml-1 mb-0 h-8 border-y border-r border-pece bg-nastro"
          style={{
            ...TACCHE,
            width: `${larghezza}px`,
            transition: aperto
              ? 'width 1000ms cubic-bezier(0.34, 1.35, 0.5, 1)'
              : 'width 420ms cubic-bezier(0.6, 0, 0.9, 0.4)',
          }}
        >
          <div className="absolute -bottom-2 -right-2 -top-2 w-4 rounded-md border border-pece bg-acciaio" />
        </div>
      </div>
    </div>
  )
}
