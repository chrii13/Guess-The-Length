// Sistema di calibrazione universale per convertire pixel in cm reali
// Usa una calibrazione manuale con oggetto fisico di riferimento

let pixelsPerCm: number | null = null

// Range valido per calibrazione (10-100 pixel/cm è ragionevole per monitor comuni)
const MIN_RATIO = 10
const MAX_RATIO = 100
const DEFAULT_RATIO = 37.8 // Default a ~96 DPI

// Valida un valore di calibrazione
function validateCalibration(ratio: number): boolean {
  return (
    typeof ratio === 'number' &&
    !isNaN(ratio) &&
    isFinite(ratio) &&
    ratio > MIN_RATIO &&
    ratio < MAX_RATIO
  )
}

// Imposta il rapporto pixel/cm dalla calibrazione manuale
export function setCalibration(ratio: number): void {
  // Validazione
  if (!validateCalibration(ratio)) {
    console.error('Invalid calibration ratio:', ratio)
    return
  }

  // Sanitizzazione: arrotonda a 2 decimali
  const sanitized = Math.round(ratio * 100) / 100

  pixelsPerCm = sanitized
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('meter_game_pixels_per_cm', sanitized.toString())
    } catch (error) {
      console.error('Error saving calibration to localStorage:', error)
    }
  }
}

// Calibra il sistema usando un elemento di riferimento (fallback automatico)
export function calibrate(): number {
  if (typeof window === 'undefined') {
    return DEFAULT_RATIO // Default fallback per SSR
  }

  // Prova prima a recuperare dal localStorage
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('meter_game_pixels_per_cm')
      if (saved) {
        const parsed = parseFloat(saved)
        
        // Valida il valore letto
        if (validateCalibration(parsed)) {
          pixelsPerCm = parsed
          return pixelsPerCm
        } else {
          // Valore invalido, rimuovi dal localStorage
          console.warn('Invalid calibration value in localStorage, removing it:', parsed)
          localStorage.removeItem('meter_game_pixels_per_cm')
        }
      }
    } catch (error) {
      console.error('Error reading calibration from localStorage:', error)
      // Se c'è un errore, rimuovi il valore corroto
      try {
        localStorage.removeItem('meter_game_pixels_per_cm')
      } catch (e) {
        // Ignora errori di rimozione
      }
    }
  }

  // Se non c'è calibrazione salvata o valida, usa un valore di default
  // L'utente dovrà calibrare manualmente
  pixelsPerCm = DEFAULT_RATIO // Default a ~96 DPI

  return pixelsPerCm
}

// Ottieni il rapporto pixel/cm (calibra se necessario)
export function getPixelsPerCm(): number {
  if (typeof window === 'undefined') {
    return DEFAULT_RATIO // Default fallback per SSR
  }

  // Prova a recuperare dal localStorage
  if (pixelsPerCm === null) {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('meter_game_pixels_per_cm')
        if (saved) {
          const parsed = parseFloat(saved)
          
          // Valida il valore letto
          if (validateCalibration(parsed)) {
            pixelsPerCm = parsed
          } else {
            // Valore invalido, rimuovi e calibra
            console.warn('Invalid calibration value, using default:', parsed)
            localStorage.removeItem('meter_game_pixels_per_cm')
            pixelsPerCm = calibrate()
          }
        } else {
          // Calibra se non c'è un valore salvato
          pixelsPerCm = calibrate()
        }
      } catch (error) {
        console.error('Error reading calibration from localStorage:', error)
        // In caso di errore, usa il default
        pixelsPerCm = DEFAULT_RATIO
      }
    } else {
      // Nessun localStorage disponibile, usa default
      pixelsPerCm = DEFAULT_RATIO
    }
  }

  // Validazione finale di sicurezza
  if (!validateCalibration(pixelsPerCm)) {
    console.error('Invalid pixelsPerCm, resetting to default:', pixelsPerCm)
    pixelsPerCm = DEFAULT_RATIO
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

