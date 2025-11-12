// Genera una lunghezza casuale tra 1 e 15 cm con 2 decimali
export function generateRandomLength(): number {
  const min = 100 // 1.00 cm in centesimi
  const max = 1500 // 15.00 cm in centesimi
  const random = Math.floor(Math.random() * (max - min + 1)) + min
  return random / 100 // Converti in cm con 2 decimali
}

// Calcola l'errore in cm (valore assoluto della differenza)
export function calculateError(actual: number, target: number): number {
  return Math.abs(actual - target)
}

// Converte pixel in cm (assumendo 1 cm = 37.8 pixel a 96 DPI)
export function pixelsToCm(pixels: number): number {
  return pixels / 37.8
}

// Converte cm in pixel
export function cmToPixels(cm: number): number {
  return cm * 37.8
}

// Formatta un numero con 2 decimali
export function formatLength(cm: number): string {
  return cm.toFixed(2).replace('.', ',')
}

