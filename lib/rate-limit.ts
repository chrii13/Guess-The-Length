// Rate limiting semplice lato server usando Map in-memory
// Per produzione, considerare Redis o un servizio dedicato
import { apiRateLimitConfig } from './config'

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Pulisce le entry scadute ogni 5 minuti
setInterval(() => {
  const now = Date.now()
  rateLimitStore.forEach((entry, key) => {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  })
}, 5 * 60 * 1000)

export function checkRateLimit(
  identifier: string,
  maxRequests: number = apiRateLimitConfig.maxRequests,
  windowMs: number = apiRateLimitConfig.windowMs
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const key = identifier

  // Ottieni o crea entry
  let entry = rateLimitStore.get(key)

  if (!entry || entry.resetTime < now) {
    // Crea nuova entry o resetta se scaduta
    entry = {
      count: 0,
      resetTime: now + windowMs,
    }
  }

  // Incrementa conteggio
  entry.count++

  // Salva entry aggiornata
  rateLimitStore.set(key, entry)

  // Verifica limite
  const allowed = entry.count <= maxRequests
  const remaining = Math.max(0, maxRequests - entry.count)
  const resetTime = entry.resetTime

  return { allowed, remaining, resetTime }
}

/**
 * Ottiene un identificatore unico per il rate limiting basato su IP o email
 */
export function getRateLimitIdentifier(request: Request): string {
  // Prova a ottenere l'IP dalla request
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'

  return `rate-limit:${ip}`
}

