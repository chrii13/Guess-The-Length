'use client'

import { useEffect, useState } from 'react'
import { calibrate, getPixelsPerCm } from '@/lib/calibration'

interface CalibrationScreenProps {
  onCalibrated: () => void
}

export function CalibrationScreen({ onCalibrated }: CalibrationScreenProps) {
  const [calibrating, setCalibrating] = useState(false)
  const [ratio, setRatio] = useState<number | null>(null)

  useEffect(() => {
    // Calibra automaticamente al mount
    const ratio = calibrate()
    setRatio(ratio)
  }, [])

  const handleContinue = () => {
    onCalibrated()
  }

  const handleRecalibrate = () => {
    setCalibrating(true)
    const newRatio = calibrate()
    setRatio(newRatio)
    setCalibrating(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-indigo-900 mb-4 text-center">
          Calibrazione Monitor
        </h2>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Per garantire misurazioni accurate su qualsiasi monitor, il sistema si calibra automaticamente.
          </p>
          
          <div className="bg-indigo-50 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2 font-semibold">Rapporto di calibrazione:</p>
            {ratio ? (
              <p className="text-2xl font-bold text-indigo-700">
                {ratio.toFixed(2)} pixel/cm
              </p>
            ) : (
              <p className="text-gray-500">Calibrazione in corso...</p>
            )}
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleContinue}
              className="px-6 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-semibold"
            >
              Continua
            </button>
            <button
              onClick={handleRecalibrate}
              disabled={calibrating}
              className="px-6 py-3 text-indigo-600 bg-white border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 font-semibold disabled:opacity-50"
            >
              {calibrating ? 'Ricalibrazione...' : 'Ricalibra'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

