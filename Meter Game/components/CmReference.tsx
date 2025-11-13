'use client'

import { useRef } from 'react'

// Componente che mostra un riferimento di 1cm reale usando CSS cm
export function CmReference() {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div className="flex flex-col items-center justify-center mr-8 flex-shrink-0">
      {/* Riferimento 1cm reale usando CSS cm */}
      <div
        ref={ref}
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
            className="text-white font-bold text-xs" 
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
      <div className="text-center max-w-[120px]">
        <p className="text-xs font-bold text-blue-700 mb-1">RIFERIMENTO</p>
        <p className="text-xs font-semibold text-blue-900">1 centimetro</p>
        <p className="text-xs text-gray-600 mt-1 italic text-center leading-tight">
          Nota: questa porzione di schermo corrisponde ad un centimetro
        </p>
      </div>
    </div>
  )
}

