'use client'

import { useState, useEffect, useRef } from 'react'
import { pixelsToCm, formatLength } from '@/lib/game'

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

  const currentLengthCm = pixelsToCm(length)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-1">Lunghezza attuale</p>
        <p className="text-3xl font-bold text-indigo-700">{formatLength(currentLengthCm)} cm</p>
      </div>

      <div
        ref={meterRef}
        className="relative cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Metro giallo realistico */}
        <div
          className="relative bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-600 rounded-lg shadow-lg"
          style={{
            width: `${length}px`,
            height: '60px',
            transition: isDragging ? 'none' : 'width 0.1s ease-out',
          }}
        >
          {/* Bordo superiore e inferiore */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-700 opacity-50"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-700 opacity-50"></div>

          {/* Linee di misurazione */}
          {Array.from({ length: Math.floor(length / 20) }).map((_, i) => {
            const pos = i * 20
            const isMajor = i % 5 === 0
            return (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-black opacity-30"
                style={{ left: `${pos}px` }}
              >
                {isMajor && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-xs font-bold text-black opacity-60">
                    {Math.floor(pixelsToCm(pos))}
                  </div>
                )}
              </div>
            )
          })}

          {/* Maniglia sinistra */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-l-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-yellow-700 rounded-full"></div>
          </div>

          {/* Maniglia destra (draggable) */}
          <div
            className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-yellow-600 to-yellow-500 rounded-r-lg flex items-center justify-center shadow-lg"
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <div className="w-4 h-4 bg-yellow-700 rounded-full"></div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500">Trascina la maniglia destra per allungare il metro</p>
    </div>
  )
}

