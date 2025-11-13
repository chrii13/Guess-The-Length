// Sistema di calibrazione universale per convertire pixel in cm reali
// Usa una calibrazione manuale con oggetto fisico di riferimento

let pixelsPerCm: number | null = null

// Imposta il rapporto pixel/cm dalla calibrazione manuale
export function setCalibration(ratio: number): void {
  pixelsPerCm = ratio
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('meter_game_pixels_per_cm', ratio.toString())
  }
}

// Calibra il sistema usando un elemento di riferimento (fallback automatico)
export function calibrate(): number {
  if (typeof window === 'undefined') {
    return 37.8 // Default fallback
  }

  // Prova prima a recuperare dal localStorage
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('meter_game_pixels_per_cm')
    if (saved) {
      pixelsPerCm = parseFloat(saved)
      return pixelsPerCm
    }
  }

  // Se non c'è calibrazione salvata, usa un valore di default
  // L'utente dovrà calibrare manualmente
  pixelsPerCm = 37.8 // Default a 96 DPI

  return pixelsPerCm
}

// Ottieni il rapporto pixel/cm (calibra se necessario)
export function getPixelsPerCm(): number {
  if (typeof window === 'undefined') {
    return 37.8 // Default fallback per SSR
  }

  // Prova a recuperare dal localStorage
  if (pixelsPerCm === null) {
    const saved = localStorage.getItem('meter_game_pixels_per_cm')
    if (saved) {
      pixelsPerCm = parseFloat(saved)
    } else {
      // Calibra se non c'è un valore salvato
      pixelsPerCm = calibrate()
    }
  }

  return pixelsPerCm
}

// Converte pixel in cm usando la calibrazione
export function pixelsToCm(pixels: number): number {
  const ratio = getPixelsPerCm()
  return pixels / ratio
}

// Converte cm in pixel usando la calibrazione
export function cmToPixels(cm: number): number {
  const ratio = getPixelsPerCm()
  return cm * ratio
}

// Forza una nuova calibrazione
export function forceCalibration(): number {
  pixelsPerCm = null
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('meter_game_pixels_per_cm')
  }
  return calibrate()
}

