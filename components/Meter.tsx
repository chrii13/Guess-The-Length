'use client'

import { useState, useEffect, useRef } from 'react'

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

  // Calcola quante lettere mostrare in base alla lunghezza
  const text = "Meter Game"
  const minWidthPerChar = 10 // Pixel minimi per carattere (considerando le maniglie)
  const availableWidth = length - 80 // 80px per le maniglie (40px x 2)
  const visibleChars = Math.floor(availableWidth / minWidthPerChar)
  const displayText = text.substring(0, Math.max(0, Math.min(text.length, visibleChars)))

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
          className="relative rounded-lg shadow-2xl"
          style={{
            width: `${length}px`,
            height: '70px',
            transition: isDragging ? 'none' : 'width 0.15s ease-out',
            background: 'linear-gradient(to bottom, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.3)',
          }}
        >
          {/* Texture metallica con pattern sottile */}
          <div 
            className="absolute inset-0 opacity-20 rounded-lg"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 6px)',
            }}
          />

          {/* Bordo superiore metallico */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-yellow-200 to-yellow-600 opacity-80 rounded-t-lg"></div>
          
          {/* Bordo inferiore metallico */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-b from-yellow-600 to-yellow-800 opacity-80 rounded-b-lg"></div>

          {/* Scritta "Meter Game" che si adatta alla lunghezza */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <span 
              className="font-bold text-yellow-900 select-none"
              style={{
                fontSize: '28px',
                textShadow: '2px 2px 3px rgba(0,0,0,0.4), -1px -1px 1px rgba(255,255,255,0.2)',
                letterSpacing: '3px',
                whiteSpace: 'nowrap',
                textAlign: 'center',
              }}
            >
              {displayText}
              {displayText.length < text.length && (
                <span className="text-yellow-800 opacity-60">...</span>
              )}
            </span>
          </div>

          {/* Maniglia sinistra fissa con dettagli realistici */}
          <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-yellow-700 via-yellow-600 to-yellow-500 rounded-l-lg flex items-center justify-center shadow-inner z-10">
            {/* Foro centrale */}
            <div className="w-6 h-6 bg-gradient-to-br from-yellow-800 to-yellow-900 rounded-full shadow-inner border-2 border-yellow-950"></div>
            {/* Riflesso */}
            <div className="absolute top-2 left-2 w-3 h-3 bg-white opacity-30 rounded-full"></div>
          </div>

          {/* Maniglia destra draggable con dettagli realistici */}
          <div
            className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-yellow-700 via-yellow-600 to-yellow-500 rounded-r-lg flex items-center justify-center shadow-lg border-l-2 border-yellow-800 z-10"
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            {/* Foro centrale */}
            <div className="w-6 h-6 bg-gradient-to-br from-yellow-800 to-yellow-900 rounded-full shadow-inner border-2 border-yellow-950"></div>
            {/* Riflesso */}
            <div className="absolute top-2 right-2 w-3 h-3 bg-white opacity-30 rounded-full"></div>
            {/* Indicatore di trascinamento */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-1 bg-yellow-300 opacity-50 rounded"></div>
            </div>
          </div>

          {/* Ombre laterali per profondità */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-black opacity-20 rounded-l-lg"></div>
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-l from-black opacity-20 rounded-r-lg"></div>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center max-w-md">
        Trascina la maniglia destra per allungare il metro. 
        <br />
        <span className="font-semibold">Consiglio: Usare un righello non è la scelta migliore...</span>
      </p>
    </div>
  )
}
