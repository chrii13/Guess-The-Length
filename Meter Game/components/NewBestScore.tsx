'use client'

import { useEffect, useState } from 'react'
import { formatLength } from '@/lib/game'

interface NewBestScoreProps {
  score: number
  previousBest: number | null
  onContinue: () => void
}

export function NewBestScore({ score, previousBest, onContinue }: NewBestScoreProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [pulsing, setPulsing] = useState(true)

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 relative overflow-hidden">
        {/* Coriandoli animati */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => {
              const delay = Math.random() * 2
              const duration = 2 + Math.random() * 2
              const left = Math.random() * 100
              const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA']
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
            <div className="text-6xl mb-4 animate-bounce">🏆</div>
            <h1 
              className={`text-4xl font-bold text-yellow-600 mb-2 transition-all duration-1000 ${
                pulsing ? 'scale-110' : 'scale-100'
              }`}
              style={{
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              Nuovo Best Score!
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Complimenti! Hai battuto il tuo record!
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 mb-6 border-2 border-yellow-300">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Punteggio attuale</p>
              <p className="text-4xl font-bold text-indigo-700">{formatLength(score)} cm</p>
            </div>
            
            {previousBest !== null && (
              <div className="pt-4 border-t border-yellow-200">
                <p className="text-sm text-gray-600 mb-1">Punteggio precedente</p>
                <p className="text-2xl font-bold text-gray-500 line-through">{formatLength(previousBest)} cm</p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-yellow-200">
              <p className="text-sm font-semibold text-yellow-800">
                Miglioramento: {previousBest !== null ? formatLength(previousBest - score) : 'N/A'} cm
              </p>
            </div>
          </div>

          <button
            onClick={onContinue}
            className="px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg hover:from-yellow-600 hover:to-orange-600 shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Continua 🎉
          </button>
        </div>
      </div>
    </div>
  )
}

