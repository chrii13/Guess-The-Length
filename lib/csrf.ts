// Utility per protezione CSRF
import { NextRequest } from 'next/server'
import crypto from 'node:crypto'

// Genera un token CSRF
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Verifica il token CSRF
export function verifyCsrfToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) {
    return false
  }
  
  // Verifica che i token corrispondano
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(sessionToken)
  )
}

// Verifica CSRF per una richiesta
export function verifyCsrfRequest(request: NextRequest): {
  valid: boolean
  error?: string
} {
  const method = request.method.toUpperCase()
  
  // GET, HEAD, OPTIONS non richiedono protezione CSRF
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return { valid: true }
  }

  // Verifica Origin header
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  const referer = request.headers.get('referer')

  // Verifica same-origin
  if (origin) {
    try {
      const originUrl = new URL(origin)
      if (originUrl.host !== host) {
        return {
          valid: false,
          error: 'Invalid origin - CSRF protection',
        }
      }
    } catch {
      return {
        valid: false,
        error: 'Invalid origin format',
      }
    }
  } else if (referer) {
    // Fallback: verifica Referer
    try {
      const refererUrl = new URL(referer)
      if (refererUrl.host !== host) {
        return {
          valid: false,
          error: 'Invalid referer - CSRF protection',
        }
      }
    } catch {
      return {
        valid: false,
        error: 'Invalid referer format',
      }
    }
  } else {
    // Se non c'è né Origin né Referer per una richiesta mutante, è sospetto
    // Permettiamo solo se è una richiesta same-origin (non c'è Origin header)
    // Questo può accadere per richieste da same-origin
    // Ma è meglio essere sicuri
    return {
      valid: false,
      error: 'Missing origin/referer - CSRF protection',
    }
  }

  return { valid: true }
}

// Verifica Content-Type per richieste con body
export function verifyContentType(request: NextRequest): {
  valid: boolean
  error?: string
} {
  const method = request.method.toUpperCase()
  
  if (!['POST', 'PUT', 'PATCH'].includes(method)) {
    return { valid: true }
  }

  const contentType = request.headers.get('content-type')
  
  if (!contentType) {
    return {
      valid: false,
      error: 'Missing content-type header',
    }
  }

  // Verifica che sia application/json
  if (!contentType.includes('application/json')) {
    return {
      valid: false,
      error: 'Invalid content-type. Expected application/json',
    }
  }

  return { valid: true }
}

