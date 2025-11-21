// Utility per sanitizzazione input
import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitizza una stringa rimuovendo caratteri pericolosi
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }

  // Trim e rimuovi caratteri null
  let sanitized = input.trim().replace(/\0/g, '')

  // Rimuovi caratteri di controllo eccetto \t, \n, \r
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  // Rimuovi caratteri non stampabili
  sanitized = sanitized.replace(/[\x00-\x1F\x7F-\x9F]/g, '')

  return sanitized
}

/**
 * Sanitizza un oggetto rimuovendo caratteri pericolosi da tutte le stringhe
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj }

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key]) as any
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null && !Array.isArray(sanitized[key])) {
      sanitized[key] = sanitizeObject(sanitized[key])
    } else if (Array.isArray(sanitized[key])) {
      sanitized[key] = sanitized[key].map((item: any) => {
        if (typeof item === 'string') {
          return sanitizeString(item)
        } else if (typeof item === 'object' && item !== null) {
          return sanitizeObject(item)
        }
        return item
      }) as any
    }
  }

  return sanitized
}

/**
 * Sanitizza HTML usando DOMPurify
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') {
    return ''
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })
}

/**
 * Sanitizza un numero assicurandosi che sia un numero valido
 */
export function sanitizeNumber(input: any): number | null {
  if (typeof input === 'number') {
    if (isNaN(input) || !isFinite(input)) {
      return null
    }
    return input
  }

  if (typeof input === 'string') {
    const parsed = parseFloat(input.trim())
    if (isNaN(parsed) || !isFinite(parsed)) {
      return null
    }
    return parsed
  }

  return null
}

/**
 * Sanitizza un email rimuovendo caratteri pericolosi
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return ''
  }

  // Sanitizza e converte in lowercase
  const sanitized = sanitizeString(email.toLowerCase())

  // Rimuovi caratteri pericolosi ma mantieni @ e .
  return sanitized.replace(/[^a-zA-Z0-9@._+-]/g, '')
}

/**
 * Valida e sanitizza un JSON
 */
export function sanitizeJson(jsonString: string): any {
  if (typeof jsonString !== 'string') {
    return null
  }

  try {
    const parsed = JSON.parse(jsonString)
    return sanitizeObject(parsed)
  } catch {
    return null
  }
}

/**
 * Sanitizza input da una richiesta API
 */
export async function sanitizeRequestBody(request: NextRequest): Promise<any> {
  try {
    const body = await request.json()
    return sanitizeObject(body)
  } catch {
    return null
  }
}

// Import per NextRequest
import { NextRequest } from 'next/server'

