'use client'

import { useState, useEffect, useRef, useMemo } from 'react'

interface MeterProps {
  length: number // in pixel
  onLengthChange: (length: number) => void
  maxLength: number // in pixel (circa 15 cm)
}

export function Meter({ length, onLengthChange, maxLength }: MeterProps) {
  const [isDragging, setIsDragging] = useState(false)
  const meterRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)
  const startLengthRef = useRef(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !meterRef.current) return

      const deltaX = e.clientX - startXRef.current
      const newLength = Math.max(50, Math.min(maxLength, startLengthRef.current + deltaX))
      onLengthChange(newLength)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, maxLength, onLengthChange])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    startXRef.current = e.clientX
    startLengthRef.current = length
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    setIsDragging(true)
    startXRef.current = touch.clientX
    startLengthRef.current = length
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    if (!isDragging || !meterRef.current) return
    const touch = e.touches[0]
    const deltaX = touch.clientX - startXRef.current
    const newLength = Math.max(50, Math.min(maxLength, startLengthRef.current + deltaX))
    onLengthChange(newLength)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(false)
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
    const availableWidth = roundedLength - 80 // 80px per le maniglie (40px x 2)
    const startOffset = 40 // Offset per la maniglia sinistra
    const maxWidth = roundedLength - 40
    
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
    <div className="flex flex-col items-center gap-4">
      <div
        ref={meterRef}
        className="relative cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Metro giallo realistico senza linee di misurazione */}
        <div
          className="relative rounded-xl-large shadow-soft-lg overflow-hidden"
          style={{
            width: `${length}px`,
            height: '70px',
            transition: isDragging ? 'none' : 'width 0.15s ease-out',
            background: 'linear-gradient(to bottom, #F4D03F 0%, #F7D94C 25%, #D4AC0D 50%, #C49A0A 75%, #B7950B 100%)',
            boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.4), inset 0 -1px 3px rgba(0,0,0,0.15), 0 2px 10px rgba(0,0,0,0.1)',
          }}
        >
          {/* Texture metallica lucida principale - pattern verticale fine */}
          <div 
            className="absolute inset-0 opacity-8 rounded-xl-large"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.03) 1px, rgba(0,0,0,0.03) 2px)',
            }}
          />
          
          {/* Riflesso lucido superiore */}
          <div 
            className="absolute inset-0 opacity-25 rounded-xl-large"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 20%, transparent 50%, transparent 100%)',
            }}
          />
          
          {/* Texture sottile per lucentezza */}
          <div 
            className="absolute inset-0 opacity-6 rounded-xl-large"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 3px)',
            }}
          />

          {/* Bordo superiore metallico sottile */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-primary-yellow to-primary-yellow-dark opacity-60 rounded-t-xl-large"></div>
          
          {/* Bordo inferiore metallico sottile */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-b from-primary-yellow-dark to-primary-gray-medium opacity-60 rounded-b-xl-large"></div>

          {/* Linee di misurazione nere attaccate all'estremità superiore */}
          {markings.map((mark, index) => (
            <div
              key={index}
              className="absolute z-20"
              style={{
                left: `${mark.x}px`,
                top: '0',
                width: mark.isMajor ? '2.5px' : mark.isMedium ? '2px' : '1px',
                background: '#1C1C1C',
                height: mark.isMajor ? '100%' : mark.isMedium ? '70%' : '40%',
                borderRadius: '1px',
              }}
            />
          ))}

          {/* Maniglia sinistra fissa (corpo nero del metro) */}
          <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-primary-gray-dark via-primary-gray-medium to-primary-gray-dark rounded-l-xl-large flex items-center justify-center shadow-inner z-10 border-r-2 border-primary-yellow/30">
            {/* Bottone/Foro centrale giallo */}
            <div className="w-8 h-8 bg-gradient-to-br from-primary-yellow via-primary-yellow-dark to-primary-yellow rounded-full shadow-inner border-2 border-primary-yellow-dark/50 flex items-center justify-center">
              <div className="w-4 h-4 bg-gradient-to-br from-primary-yellow-dark to-primary-yellow rounded-full"></div>
            </div>
            {/* Riflesso */}
            <div className="absolute top-2 left-2 w-2 h-2 bg-white opacity-20 rounded-full"></div>
          </div>

          {/* Maniglia destra draggable (corpo nero del metro) */}
          <div
            className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-primary-gray-dark via-primary-gray-medium to-primary-gray-dark rounded-r-xl-large flex items-center justify-center shadow-soft-lg border-l-2 border-primary-yellow/30 z-10"
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            {/* Bottone/Foro centrale giallo */}
            <div className="w-8 h-8 bg-gradient-to-br from-primary-yellow via-primary-yellow-dark to-primary-yellow rounded-full shadow-inner border-2 border-primary-yellow-dark/50 flex items-center justify-center">
              <div className="w-4 h-4 bg-gradient-to-br from-primary-yellow-dark to-primary-yellow rounded-full"></div>
            </div>
            {/* Riflesso */}
            <div className="absolute top-2 right-2 w-2 h-2 bg-white opacity-20 rounded-full"></div>
            {/* Indicatore di trascinamento */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-0.5 bg-primary-yellow/60 opacity-80 rounded"></div>
            </div>
          </div>

          {/* Ombre laterali sottili per profondità */}
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-r from-primary-gray-dark opacity-15 rounded-l-xl-large"></div>
          <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gradient-to-l from-primary-gray-dark opacity-15 rounded-r-xl-large"></div>
        </div>
      </div>

      <p className="text-xs md:text-sm text-primary-gray-medium dark:text-primary-gray-light text-center max-w-md font-medium">
        Trascina la maniglia destra per allungare il metro. 
        <br />
        <span className="font-bold text-primary-gray-dark dark:text-primary-gray-light">Consiglio: Usare un righello non è la scelta migliore...</span>
      </p>
    </div>
  )
}
