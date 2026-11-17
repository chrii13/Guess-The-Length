'use client'

import { createContext, Fragment, useContext, useEffect, useRef, useState, type AriaAttributes, type CSSProperties, type ElementType, type ReactNode } from 'react'
import { formatLength } from '@/lib/game'
import { useCountUp } from '@/hooks/useCountUp'

const InVista = createContext(true)

// Vero quando il blocco <Rivela> che contiene il componente è entrato nello schermo
export const useInVista = () => useContext(InVista)

// Un blocco che si anima la prima volta che entra nello schermo.
// Gli elementi con classe `vista` al suo interno restano fermi al primo fotogramma finché non è visibile.
export function Rivela({
  as = 'div',
  className = '',
  style,
  children,
  subito = false,
  ...attributi
}: {
  as?: ElementType
  // In cima alla pagina: anima da subito, senza aspettare che il codice sia caricato
  subito?: boolean
  className?: string
  style?: CSSProperties
  children: ReactNode
} & AriaAttributes) {
  const Tag = as
  const ref = useRef<HTMLElement>(null)
  const [visibile, setVisibile] = useState(subito)

  useEffect(() => {
    if (subito) return
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisibile(true)
      return
    }
    const osservatore = new IntersectionObserver(
      ([voce]) => {
        if (voce.isIntersecting) {
          setVisibile(true)
          osservatore.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    )
    osservatore.observe(el)
    return () => osservatore.disconnect()
  }, [subito])

  return (
    <InVista.Provider value={visibile}>
      <Tag ref={ref} data-in-vista={visibile} className={className} style={style} {...attributi}>
        {children}
      </Tag>
    </InVista.Provider>
  )
}

// Una frase che compare una parola alla volta
export function Parole({ testo, ritardo = 0, passo = 70 }: { testo: string; ritardo?: number; passo?: number }) {
  return (
    <>
      {testo.split(' ').map((parola, i) => (
        <Fragment key={i}>
          <span className="parola vista" style={{ ['--ritardo' as string]: `${ritardo + i * passo}ms` }}>
            {parola}
          </span>{' '}
        </Fragment>
      ))}
    </>
  )
}

// Un numero che conta fino al valore quando il blocco entra nello schermo
export function Conta({ valore, cm = false, durata = 900 }: { valore: number; cm?: boolean; durata?: number }) {
  const n = useCountUp(useInVista() ? valore : 0, durata)
  return <>{cm ? formatLength(n) : Math.round(n)}</>
}
