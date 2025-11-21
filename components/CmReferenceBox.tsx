'use client'

import { useRef } from 'react'

// Componente che mostra un riquadro con riferimento 1cm in alto a sinistra
export function CmReferenceBox() {
  const cmRefRef = useRef<HTMLDivElement>(null)

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="bg-gradient-to-br from-white to-primary-gray-light/30 dark:from-primary-gray-medium dark:to-primary-gray-dark/80 backdrop-blur-md rounded-2xl-large shadow-soft-lg-lg border-2 border-primary-yellow/50 dark:border-primary-yellow-dark/50 p-4 md:p-5 max-w-[200px] md:max-w-[220px]">
        <div className="text-center mb-4">
          <h3 className="text-sm md:text-base font-bold text-primary-gray-dark dark:text-primary-gray-light mb-2 bg-gradient-to-r from-primary-yellow-dark to-primary-yellow bg-clip-text text-transparent">
            RIFERIMENTO
          </h3>
          <p className="text-xs text-primary-gray-medium dark:text-primary-gray-light leading-relaxed">
            Questo è il centimetro da utilizzare come unità di misura
          </p>
        </div>
        
        {/* Riferimento 1cm reale usando CSS cm */}
        <div className="flex justify-center">
          <div
            ref={cmRefRef}
            className="bg-gradient-to-r from-primary-yellow via-primary-yellow-dark to-primary-yellow rounded-xl-large shadow-soft-lg relative"
            style={{
              width: '1cm',
              height: '50px',
              border: '3px solid #B7950B',
              boxShadow: '0 4px 12px rgba(183, 149, 11, 0.4), inset 0 1px 2px rgba(255,255,255,0.3)',
              minWidth: '1cm',
              maxWidth: '1cm',
            }}
          >
            {/* Scritta "1cm" sul riferimento */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span 
                className="text-primary-gray-dark dark:text-primary-gray-dark font-bold text-sm" 
                style={{ 
                  textShadow: '1px 1px 2px rgba(255,255,255,0.8), 0 0 4px rgba(0,0,0,0.2)',
                  letterSpacing: '0.5px',
                }}
              >
                1cm
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

