'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { formatLength } from '@/lib/game'
import { useTheme } from '@/hooks/useTheme'

interface NewBestScoreProps {
  score: number
  previousBest: number | null
  onContinue: () => void
}

export function NewBestScore({ score, previousBest, onContinue }: NewBestScoreProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [pulsing, setPulsing] = useState(true)
  const { theme, mounted: themeMounted, imageVersion } = useTheme()

  useEffect(() => {
    // Attiva i coriandoli dopo un breve delay
    const timer = setTimeout(() => {
      setShowConfetti(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Animazione pulsante
    const interval = setInterval(() => {
      setPulsing(prev => !prev)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 bg-primary-gray-dark/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 dark:bg-primary-gray-dark/95 backdrop-blur-sm rounded-2xl-large shadow-soft-lg-lg p-6 md:p-8 max-w-md mx-4 relative overflow-hidden border border-primary-gray-light dark:border-primary-gray-medium">
        {/* Coriandoli animati */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => {
              const delay = Math.random() * 2
              const duration = 2 + Math.random() * 2
              const left = Math.random() * 100
              const colors = ['#F4D03F', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#3498DB']
              const color = colors[Math.floor(Math.random() * colors.length)]
              
              return (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: color,
                    left: `${left}%`,
                    top: '-10px',
                    animation: `confetti-fall ${duration}s ease-in ${delay}s forwards`,
                  }}
                />
              )
            })}
          </div>
        )}

        <div className="relative z-10 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 animate-bounce bg-transparent dark:bg-transparent flex items-center justify-center">
              <Image
                key={`star-${theme}-${imageVersion}`}
                src={`${themeMounted && theme === 'dark' ? "/assets/icons/star-dark.svg" : "/assets/icons/star.svg"}?v=${theme}-${imageVersion}`}
                alt="Stella"
                width={80}
                height={80}
                className="w-full h-full pointer-events-none object-contain"
                style={{ backgroundColor: 'transparent', background: 'transparent', display: 'block', objectPosition: 'center' }}
                unoptimized
              />
            </div>
            <h1 
              className={`text-3xl md:text-4xl font-bold text-primary-yellow-dark mb-2 transition-all duration-1000 ${
                pulsing ? 'scale-110' : 'scale-100'
              }`}
              style={{
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              Nuovo Best Score!
            </h1>
            <p className="text-base md:text-lg text-primary-gray-medium dark:text-primary-gray-light mb-4 font-medium">
              Complimenti! Hai battuto il tuo record!
            </p>
          </div>

          <div className="bg-gradient-to-br from-primary-yellow/20 to-primary-yellow-dark/10 dark:from-primary-yellow-dark/20 dark:to-primary-yellow/10 rounded-xl-large p-5 md:p-6 mb-6 border-2 border-primary-yellow dark:border-primary-yellow-dark">
            <div className="mb-4">
              <p className="text-xs md:text-sm text-primary-gray-medium dark:text-primary-gray-light mb-1 font-medium">Punteggio attuale</p>
              <p className="text-3xl md:text-4xl font-bold text-primary-gray-dark dark:text-primary-gray-light">{formatLength(score)} cm</p>
            </div>
            
            {previousBest !== null && (
              <div className="pt-4 border-t border-primary-yellow/30 dark:border-primary-yellow-dark/30">
                <p className="text-xs md:text-sm text-primary-gray-medium dark:text-primary-gray-light mb-1 font-medium">Punteggio precedente</p>
                <p className="text-xl md:text-2xl font-bold text-primary-gray-medium dark:text-primary-gray-light line-through">{formatLength(previousBest)} cm</p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-primary-yellow/30 dark:border-primary-yellow-dark/30">
              <p className="text-xs md:text-sm font-bold text-primary-yellow-dark dark:text-primary-yellow">
                Miglioramento: {previousBest !== null ? formatLength(previousBest - score) : 'N/A'} cm
              </p>
            </div>
          </div>

          <button
            onClick={onContinue}
            className="w-full px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-bold text-white bg-gradient-to-r from-primary-yellow to-primary-yellow-dark rounded-xl-large hover:shadow-yellow-glow transition-all shadow-soft-lg transform hover:scale-105 active:scale-95"
          >
              Continua
          </button>
        </div>
      </div>
    </div>
  )
}

