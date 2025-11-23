// Importa le funzioni di calibrazione
import { pixelsToCm as calibratedPixelsToCm, cmToPixels as calibratedCmToPixels } from './calibration'

// Genera una lunghezza casuale tra 1 e maxCm (default 15) cm con 2 decimali
export function generateRandomLength(maxCm: number = 15): number {
  const min = 100 // 1.00 cm in centesimi
  const max = Math.round(maxCm * 100) // maxCm in centesimi (es. 800 per 8cm, 1500 per 15cm)
  const random = Math.floor(Math.random() * (max - min + 1)) + min
  return random / 100 // Converti in cm con 2 decimali
}

// Calcola l'errore in cm (valore assoluto della differenza)
export function calculateError(actual: number, target: number): number {
  return Math.abs(actual - target)
}

// Converte pixel in cm usando la calibrazione universale
export function pixelsToCm(pixels: number): number {
  return calibratedPixelsToCm(pixels)
}

// Converte cm in pixel usando la calibrazione universale
export function cmToPixels(cm: number): number {
  return calibratedCmToPixels(cm)
}

// Formatta un numero con 2 decimali
export function formatLength(cm: number): string {
  return cm.toFixed(2).replace('.', ',')
}

