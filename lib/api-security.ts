// Utility per applicare protezioni di sicurezza alle API routes
import { NextRequest, NextResponse } from 'next/server'
import { verifyCsrfRequest, verifyContentType } from './csrf'
import { checkRateLimit, getRateLimitIdentifier } from './rate-limit'
import { sanitizeObject } from './sanitize'
import { apiRateLimitConfig, apiMaxBodySize } from './config'

interface ApiSecurityOptions {
  rateLimit?: {
    maxRequests: number
    windowMs: number
  }
  requireCsrf?: boolean
  requireContentType?: boolean
  maxBodySize?: number // in bytes
}

interface SecurityCheckResult {
  valid: boolean
  error?: string
  response?: NextResponse
  sanitizedBody?: any
}

/**
 * Applica tutte le protezioni di sicurezza a una richiesta API
 */
export async function applyApiSecurity(
  request: NextRequest,
  options: ApiSecurityOptions = {}
): Promise<SecurityCheckResult> {
  const {
    rateLimit = apiRateLimitConfig, // Usa configurazione da variabili d'ambiente
    requireCsrf = true,
    requireContentType = true,
    maxBodySize = apiMaxBodySize, // Usa configurazione da variabili d'ambiente
  } = options

  // 1. Verifica CSRF se richiesto
  if (requireCsrf) {
    const csrfCheck = verifyCsrfRequest(request)
    if (!csrfCheck.valid) {
      return {
        valid: false,
        error: csrfCheck.error || 'CSRF verification failed',
        response: NextResponse.json(
          { error: csrfCheck.error || 'CSRF verification failed' },
          { status: 403 }
        ),
      }
    }
  }

  // 2. Verifica Content-Type se richiesto
  if (requireContentType) {
    const contentTypeCheck = verifyContentType(request)
    if (!contentTypeCheck.valid) {
      return {
        valid: false,
        error: contentTypeCheck.error || 'Invalid content type',
        response: NextResponse.json(
          { error: contentTypeCheck.error || 'Invalid content type' },
          { status: 415 }
        ),
      }
    }
  }

  // 3. Rate limiting
  const identifier = getRateLimitIdentifier(request)
  const rateLimitResult = checkRateLimit(identifier, rateLimit.maxRequests, rateLimit.windowMs)

  if (!rateLimitResult.allowed) {
    const resetTime = new Date(rateLimitResult.resetTime).toISOString()
    return {
      valid: false,
      error: 'Too many requests',
      response: NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          resetTime,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetTime,
            'Retry-After': Math.ceil(
              (rateLimitResult.resetTime - Date.now()) / 1000
            ).toString(),
          },
        }
      ),
    }
  }

  // 4. Verifica dimensione body
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > maxBodySize) {
    return {
      valid: false,
      error: 'Request body too large',
      response: NextResponse.json(
        { error: 'Request body too large' },
        { status: 413 }
      ),
    }
  }

  // 5. Parse e sanitizza body (se presente)
  let sanitizedBody: any = null
  const method = request.method.toUpperCase()
  
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      const body = await request.json()
      sanitizedBody = sanitizeObject(body)
    } catch (error) {
      // Se non c'è body, va bene
      if (error instanceof SyntaxError) {
        return {
          valid: false,
          error: 'Invalid JSON body',
          response: NextResponse.json(
            { error: 'Invalid JSON body' },
            { status: 400 }
          ),
        }
      }
    }
  }

  return {
    valid: true,
    sanitizedBody,
  }
}

/**
 * Helper per creare una risposta con header di sicurezza
 */
export function secureResponse(
  data: any,
  status: number = 200,
  rateLimitInfo?: {
    maxRequests: number
    remaining: number
    resetTime: number
  }
): NextResponse {
  const headers: Record<string, string> = {}

  if (rateLimitInfo) {
    headers['X-RateLimit-Limit'] = rateLimitInfo.maxRequests.toString()
    headers['X-RateLimit-Remaining'] = rateLimitInfo.remaining.toString()
    headers['X-RateLimit-Reset'] = new Date(rateLimitInfo.resetTime).toISOString()
  }

  return NextResponse.json(data, { status, headers })
}

/**
 * Helper per creare una risposta di errore sicura
 */
export function secureErrorResponse(
  error: string,
  status: number = 400
): NextResponse {
  return NextResponse.json({ error }, { status })
}

