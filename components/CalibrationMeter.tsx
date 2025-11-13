'use client'

import { useState, useRef, useEffect } from 'react'

interface CalibrationMeterProps {
  onCalibrated: (pixelsPerCm: number) => void
}

export function CalibrationMeter({ onCalibrated }: CalibrationMeterProps) {
  const [meterLength, setMeterLength] = useState(0) // Sarà impostato dopo il mount
  const [isDragging, setIsDragging] = useState(false)
  const meterRef = useRef<HTMLDivElement>(null)
  const cmReferenceRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef(0)
  const startLengthRef = useRef(0)

  // Calcola il rapporto pixel/cm basato sul riferimento CSS reale di 1cm
  useEffect(() => {
    // Usa un delay per assicurarsi che il DOM sia completamente renderizzato
    const timer = setTimeout(() => {
      if (cmReferenceRef.current) {
        // Il riferimento usa width: 1cm in CSS (reale), quindi otteniamo i pixel reali
        const rect = cmReferenceRef.current.getBoundingClientRect()
        const realCmInPixels = rect.width
        
        // Inizializza il metro alla stessa lunghezza del riferimento (circa 1cm)
        // Usa Math.round per evitare decimali
        const initialLength = Math.round(realCmInPixels)
        setMeterLength(initialLength)
        startLengthRef.current = initialLength
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !meterRef.current) return
      const deltaX = e.clientX - startXRef.current
      const newLength = Math.max(10, Math.min(150, startLengthRef.current + deltaX))
      setMeterLength(newLength)
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
  }, [isDragging])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    startXRef.current = e.clientX
    startLengthRef.current = meterLength
  }

  const handleConfirm = () => {
    // Il riferimento è esattamente 1cm in CSS (reale)
    // Misuriamo quanti pixel occupa realmente 1cm sul monitor
    if (cmReferenceRef.current) {
      const rect = cmReferenceRef.current.getBoundingClientRect()
      // Questo è il numero di pixel che corrispondono a 1cm REALE
      const pixelsFor1cm = rect.width
      
      // Salva questo rapporto per le conversioni future
      onCalibrated(pixelsFor1cm)
    }
  }

  // Calcola quante lettere mostrare in base alla lunghezza
  const text = "Meter Game"
  const minWidthPerChar = 8 // Pixel minimi per carattere
  const visibleChars = Math.floor((meterLength - 80) / minWidthPerChar) // 80px per le maniglie
  const displayText = text.substring(0, Math.max(0, Math.min(text.length, visibleChars)))

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-indigo-900 mb-4 text-center">
        Calibrazione Monitor
      </h2>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-4 text-center">
          Per garantire misurazioni accurate, calibra il sistema usando il riferimento di 1 centimetro qui sotto.
        </p>
        
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
          <p className="font-semibold text-blue-900 mb-2">📏 Istruzioni:</p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Guarda il riferimento di <strong>1 centimetro</strong> a sinistra (blu)</li>
            <li>Allinea il metro giallo con il riferimento: il metro deve essere esattamente della stessa lunghezza</li>
            <li>Trascina la maniglia destra del metro per allungarlo o rimpicciolirlo</li>
            <li>Quando il metro corrisponde esattamente al riferimento, clicca su "Conferma Calibrazione"</li>
          </ol>
        </div>

        {/* Area di calibrazione con riferimento 1cm reale */}
        <div className="flex items-center justify-center gap-8 mb-6 flex-wrap">
          {/* Riferimento 1cm reale usando CSS cm */}
          <div className="flex flex-col items-center">
            <div 
              ref={cmReferenceRef}
              className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg mb-2 relative"
              style={{
                width: '1cm',
                height: '70px',
                border: '3px solid #1E40AF',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                minWidth: '1cm',
                maxWidth: '1cm',
              }}
            >
              {/* Scritta "1cm" sul riferimento */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span 
                  className="text-white font-bold text-sm" 
                  style={{ 
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                  }}
                >
                  1cm
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-blue-700 mb-1">RIFERIMENTO</p>
              <p className="text-sm font-semibold text-blue-900">1 centimetro</p>
              <p className="text-xs text-gray-600 mt-1 max-w-[200px] italic">
                Nota: questa porzione di schermo corrisponde ad un centimetro
              </p>
            </div>
          </div>

          {/* Metro giallo calibrabile */}
          <div className="flex flex-col items-center">
            <div
              ref={meterRef}
              className="relative cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleMouseDown}
            >
              <div
                className="relative rounded-lg shadow-2xl"
                style={{
                  width: `${meterLength}px`,
                  height: '70px',
                  transition: isDragging ? 'none' : 'width 0.15s ease-out',
                  background: 'linear-gradient(to bottom, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
                  boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.3)',
                }}
              >
                {/* Texture metallica */}
                <div 
                  className="absolute inset-0 opacity-20 rounded-lg"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
                  }}
                />

                {/* Bordo superiore */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-yellow-200 to-yellow-600 opacity-80 rounded-t-lg"></div>
                
                {/* Bordo inferiore */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-b from-yellow-600 to-yellow-800 opacity-80 rounded-b-lg"></div>

                {/* Scritta "Meter Game" che si adatta alla lunghezza */}
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                  <span 
                    className="font-bold text-yellow-900 select-none"
                    style={{
                      fontSize: '24px',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                      letterSpacing: '2px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {displayText}
                    {displayText.length < text.length && (
                      <span className="text-yellow-700 opacity-50">...</span>
                    )}
                  </span>
                </div>

                {/* Maniglia sinistra */}
                <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-yellow-700 via-yellow-600 to-yellow-500 rounded-l-lg flex items-center justify-center shadow-inner z-10">
                  <div className="w-6 h-6 bg-gradient-to-br from-yellow-800 to-yellow-900 rounded-full shadow-inner border-2 border-yellow-950"></div>
                  <div className="absolute top-2 left-2 w-3 h-3 bg-white opacity-30 rounded-full"></div>
                </div>

                {/* Maniglia destra draggable */}
                <div
                  className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-yellow-700 via-yellow-600 to-yellow-500 rounded-r-lg flex items-center justify-center shadow-lg border-l-2 border-yellow-800 z-10"
                  style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-yellow-800 to-yellow-900 rounded-full shadow-inner border-2 border-yellow-950"></div>
                  <div className="absolute top-2 right-2 w-3 h-3 bg-white opacity-30 rounded-full"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-1 bg-yellow-300 opacity-50 rounded"></div>
                  </div>
                </div>

                {/* Ombre laterali */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-black opacity-20 rounded-l-lg"></div>
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-l from-black opacity-20 rounded-r-lg"></div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center max-w-[200px]">
              Trascina la maniglia destra per allineare con il riferimento
            </p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleConfirm}
            className="px-8 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-semibold shadow-lg transform hover:scale-105 transition"
          >
            ✓ Conferma Calibrazione
          </button>
        </div>
      </div>
    </div>
  )
}
