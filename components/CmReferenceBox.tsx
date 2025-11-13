'use client'

import { useRef, useEffect, useState } from 'react'

// Componente che mostra un riquadro con riferimento 1cm in alto a sinistra
export function CmReferenceBox() {
  const cmRefRef = useRef<HTMLDivElement>(null)
  const [referencePixels, setReferencePixels] = useState(40) // Default iniziale

  // Calcola i pixel per 1cm basandosi sul riferimento CSS 1cm
  useEffect(() => {
    const updatePixels = () => {
      if (cmRefRef.current) {
        const rect = cmRefRef.current.getBoundingClientRect()
        setReferencePixels(rect.width)
      }
    }

    // Delay per assicurarsi che il DOM sia renderizzato
    const timer = setTimeout(updatePixels, 100)
    
    // Aggiorna anche quando la finestra viene ridimensionata
    window.addEventListener('resize', updatePixels)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updatePixels)
    }
  }, [])

  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="bg-white rounded-lg shadow-xl border-2 border-blue-300 p-4 max-w-[200px]">
        <div className="text-center mb-3">
          <h3 className="text-sm font-bold text-blue-900 mb-1">📏 RIFERIMENTO</h3>
          <p className="text-xs text-gray-600">
            Questo è il centimetro da utilizzare come unità di misura
          </p>
        </div>
        
        {/* Riferimento 1cm reale usando CSS cm */}
        <div className="mb-3 flex justify-center">
          <div
            ref={cmRefRef}
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg relative"
            style={{
              width: '1cm',
              height: '50px',
              border: '2px solid #1E40AF',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              minWidth: '1cm',
              maxWidth: '1cm',
            }}
          >
            {/* Scritta "1cm" sul riferimento */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span 
                className="text-white font-bold text-xs" 
                style={{ 
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                }}
              >
                1cm
              </span>
            </div>
          </div>
        </div>

        {/* Metro giallo sotto il riferimento che mostra "1 cm" */}
        <div className="flex justify-center">
          <div
            className="relative rounded-lg shadow-lg"
            style={{
              width: `${referencePixels}px`,
              height: '50px',
              background: 'linear-gradient(to bottom, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.3)',
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
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-yellow-200 to-yellow-600 opacity-80 rounded-t-lg"></div>
            
            {/* Bordo inferiore */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-b from-yellow-600 to-yellow-800 opacity-80 rounded-b-lg"></div>

            {/* Scritta "1 cm" sul metro */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span 
                className="font-bold text-yellow-900 select-none text-xs"
                style={{
                  textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
                  letterSpacing: '1px',
                }}
              >
                1 cm
              </span>
            </div>

            {/* Maniglia sinistra */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-yellow-700 via-yellow-600 to-yellow-500 rounded-l-lg flex items-center justify-center shadow-inner z-10">
              <div className="w-4 h-4 bg-gradient-to-br from-yellow-800 to-yellow-900 rounded-full shadow-inner border border-yellow-950"></div>
            </div>

            {/* Maniglia destra */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-yellow-700 via-yellow-600 to-yellow-500 rounded-r-lg flex items-center justify-center shadow-lg border-l border-yellow-800 z-10">
              <div className="w-4 h-4 bg-gradient-to-br from-yellow-800 to-yellow-900 rounded-full shadow-inner border border-yellow-950"></div>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center mt-2 italic">
          Usa questo centimetro come riferimento per misurare
        </p>
      </div>
    </div>
  )
}

