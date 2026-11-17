'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { cmToPixels } from '@/lib/game'

interface MeterProps {
  length: number // in pixel
  onLengthChange: (length: number) => void
  maxLength: number // in pixel (circa 15 cm)
}

export function Meter({ length, onLengthChange, maxLength }: MeterProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [availableWidth, setAvailableWidth] = useState<number>(maxLength)
  const meterRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)
  const startLengthRef = useRef(0)
  
  // Assicurati che la lunghezza corrente non superi mai availableWidth quando availableWidth cambia
  // Questo è importante quando lo schermo viene ridimensionato o ruotato
  useEffect(() => {
    // Solo aggiorna se la lunghezza supera effettivamente availableWidth
    // e availableWidth è stato calcolato (non è il valore iniziale)
    if (length > availableWidth && availableWidth > 0) {
      const newLength = Math.min(length, availableWidth)
      // Solo se la differenza è significativa (>2px) per evitare micro-aggiustamenti
      if (Math.abs(newLength - length) > 2) {
        onLengthChange(newLength)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableWidth]) // Solo quando availableWidth cambia
  
  // Calcola la larghezza disponibile in base allo schermo
  useEffect(() => {
    const calculateAvailableWidth = () => {
      if (typeof window === 'undefined') {
        setAvailableWidth(maxLength)
        return
      }
      
      const isMobile = window.innerWidth < 768
      
      // Su mobile, permettere estensione fino a 8cm
      if (isMobile) {
        // Calcola 8cm in pixel usando la funzione di calibrazione
        const mobileMaxCm = 8
        const mobileMaxPixels = cmToPixels(mobileMaxCm)
        
        // Permetti sempre l'estensione fino a 8cm su mobile
        // Non limitare in base alla larghezza dello schermo
        // (le lunghezze target sono già limitate a 8cm, quindi va bene)
        setAvailableWidth(mobileMaxPixels)
        return
      }
      
      // Su desktop, calcola la larghezza disponibile con padding e margini
      // Usa il container se disponibile, altrimenti window.innerWidth
      let containerWidth = window.innerWidth
      
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        containerWidth = rect.width
      }
      
      // Padding pagina: px-8 (32px) su desktop
      const pagePadding = 64
      // Padding contenitore: p-8 (32px) su desktop  
      const containerPadding = 64
      
      // Larghezza disponibile = larghezza container - padding - margini di sicurezza
      // Margine di sicurezza di 80px per assicurarsi che il metro non esca mai dallo schermo
      // Include spazio per le maniglie (40px x 2) e margine extra
      const available = Math.max(0, containerWidth - pagePadding - containerPadding - 80)
      
      // Il maxLength effettivo è il minimo tra maxLength teorico e larghezza disponibile
      const effectiveMaxLength = Math.min(maxLength, Math.max(available, 150))
      
      setAvailableWidth(effectiveMaxLength)
    }
    
    // Calcola immediatamente
    calculateAvailableWidth()
    
    // Ricalcola su resize e orientation change con debounce
    let timeoutId: NodeJS.Timeout
    const debouncedCalculate = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(calculateAvailableWidth, 100)
    }
    
    window.addEventListener('resize', debouncedCalculate)
    window.addEventListener('orientationchange', debouncedCalculate)
    
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', debouncedCalculate)
      window.removeEventListener('orientationchange', debouncedCalculate)
    }
  }, [maxLength])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !meterRef.current) return

      const deltaX = e.clientX - startXRef.current
      // Usa availableWidth invece di maxLength per limitare in base allo schermo
      const newLength = Math.max(50, Math.min(availableWidth, startLengthRef.current + deltaX))
      onLengthChange(newLength)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !meterRef.current) return
      e.preventDefault()
      
      const touch = e.touches[0]
      if (!touch) return
      
      const deltaX = touch.clientX - startXRef.current
      // Usa availableWidth invece di maxLength per limitare in base allo schermo
      const newLength = Math.max(50, Math.min(availableWidth, startLengthRef.current + deltaX))
      onLengthChange(newLength)
    }

    const handleTouchEnd = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('touchend', handleTouchEnd)
      window.addEventListener('touchcancel', handleTouchEnd)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [isDragging, availableWidth, onLengthChange])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    startXRef.current = e.clientX
    startLengthRef.current = length
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const touch = e.touches[0]
    if (!touch) return
    setIsDragging(true)
    startXRef.current = touch.clientX
    startLengthRef.current = length
  }

  // Gestione touch locale (backup, il principale è nel useEffect globale)
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !meterRef.current) return
    e.preventDefault()
    e.stopPropagation()
    const touch = e.touches[0]
    if (!touch) return
    
    const deltaX = touch.clientX - startXRef.current
    // Usa availableWidth invece di maxLength per limitare in base allo schermo
    const newLength = Math.max(50, Math.min(availableWidth, startLengthRef.current + deltaX))
    onLengthChange(newLength)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  // Tastiera: le frecce allungano o accorciano il metro, con Maiusc a passi più lunghi
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const passo = e.shiftKey ? 20 : 3
    const verso = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0
    if (!verso) return
    e.preventDefault()
    onLengthChange(Math.max(50, Math.min(availableWidth, length + verso * passo)))
  }

  // Funzione per generare un numero pseudo-casuale ma consistente basato su un seed
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }

  // Genera marcature irregolari per non aiutare il giocatore
  // Usa useMemo con lunghezza arrotondata per evitare che le marcature cambino continuamente
  // Arrotonda a multipli di 20px per maggiore stabilità (evita rigenerazione durante il drag)
  // Estrae l'espressione complessa in una variabile per le dipendenze
  const roundedLength = Math.round(length / 20) * 20
  
  const markings = useMemo(() => {
    const availableWidth = roundedLength - 30 // spazio per il gancio a destra
    const startOffset = 10 // Margine dal bordo sinistro
    const maxWidth = roundedLength - 20
    
    // Genera le linee di misurazione con spaziatura irregolare
    // Basato sulla posizione relativa (percentuale) così si scalano con la lunghezza
    const marks = []
    let relativePos = 0 // Posizione relativa 0-1
    let markIndex = 0
    
    while (relativePos < 1 && markIndex < 200) {
      // Calcola la posizione assoluta in pixel
      const currentX = startOffset + (relativePos * availableWidth)
      
      // Usa un seed basato sulla posizione RELATIVA per consistenza
      // Non dipende dalla lunghezza assoluta, solo dalla posizione relativa
      const seed = relativePos * 1000 + markIndex * 0.5
      const randomVariation = (seededRandom(seed) - 0.5) * 0.03 // Variazione relativa
      
      // Spaziatura base irregolare come percentuale (0.05-0.15 = 5%-15% della lunghezza)
      const baseSpacingPercent = 0.08 + (seededRandom(seed * 1.3) * 0.07)
      const spacingPercent = baseSpacingPercent + randomVariation
      
      // Determina il tipo di linea in modo irregolare
      const typeRandom = seededRandom(seed * 2.5)
      const isMajor = typeRandom < 0.1 && markIndex > 5 // ~10% linee principali, ma non all'inizio
      const isMedium = !isMajor && typeRandom < 0.35 // ~25% linee medie
      const isMinor = !isMajor && !isMedium // ~65% linee piccole
      
      if (currentX <= maxWidth) {
        marks.push({
          x: currentX,
          isMajor,
          isMedium,
          isMinor
        })
      }
      
      // Incrementa la posizione relativa
      relativePos += spacingPercent
      markIndex++
    }
    
    return marks
  }, [roundedLength]) // Dipende dalla lunghezza arrotondata a multipli di 20px

  return (
    // Container: su mobile permette scroll orizzontale quando metro > schermo (fino a 8cm)
    <div
      ref={containerRef}
      className="w-full overflow-x-auto overflow-y-hidden"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div
        ref={meterRef}
        className="relative inline-block cursor-grab select-none py-3 pr-2 active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }} // Previene scroll durante il drag su mobile
      >
        <div
          className="metro-nastro relative h-14"
          data-trascina={isDragging}
          style={{ width: `${length}px` }}
        >
          {/* Nastro giallo con tacche irregolari */}
          <div className="absolute inset-0 overflow-hidden border-y border-pece bg-nastro md:rounded-l-md md:border-l">
            {markings.map((mark, index) => (
              <div
                key={index}
                className="absolute top-0 bg-pece"
                style={{
                  left: `${mark.x}px`,
                  width: mark.isMajor ? '2.5px' : mark.isMedium ? '2px' : '1px',
                  height: mark.isMajor ? '100%' : mark.isMedium ? '62%' : '36%',
                }}
              />
            ))}
          </div>

          {/* Gancio in acciaio: la maniglia da trascinare, o da muovere con le frecce.
              Non annuncia la lunghezza: il gioco è indovinarla a occhio */}
          <button
            type="button"
            className="metro-gancio absolute -bottom-2 -right-px -top-2 w-4 cursor-grab rounded-md border border-pece bg-acciaio"
            data-trascina={isDragging}
            aria-label="Gancio del metro. Freccia destra per allungarlo, freccia sinistra per accorciarlo, con Maiusc per passi più lunghi"
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </div>
  )
}
