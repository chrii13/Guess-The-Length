import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Headers di sicurezza (helmet-like per Next.js)
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'off',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Powered-By': '', // Rimuove X-Powered-By
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Aggiungi header di sicurezza a tutte le richieste
  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value)
    } else {
      response.headers.delete(key)
    }
  })

  // Verifica CSRF per le richieste POST, PUT, DELETE, PATCH alle API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const method = request.method.toUpperCase()
    
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      // Verifica Origin header per CSRF protection
      const origin = request.headers.get('origin')
      const host = request.headers.get('host')
      const referer = request.headers.get('referer')
      
      // Se c'è un Origin, deve corrispondere all'host (same-origin)
      if (origin) {
        const originHost = new URL(origin).host
        if (originHost !== host) {
          return new NextResponse(
            JSON.stringify({ error: 'Invalid origin' }),
            {
              status: 403,
              headers: {
                'Content-Type': 'application/json',
                ...securityHeaders,
              },
            }
          )
        }
      } else if (referer) {
        // Fallback: verifica Referer se Origin non è presente
        const refererHost = new URL(referer).host
        if (refererHost !== host) {
          return new NextResponse(
            JSON.stringify({ error: 'Invalid referer' }),
            {
              status: 403,
              headers: {
                'Content-Type': 'application/json',
                ...securityHeaders,
              },
            }
          )
        }
      }
      
      // Verifica Content-Type per POST/PUT/PATCH
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        const contentType = request.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          return new NextResponse(
            JSON.stringify({ error: 'Invalid content type' }),
            {
              status: 415,
              headers: {
                'Content-Type': 'application/json',
                ...securityHeaders,
              },
            }
          )
        }
      }
    }
  }

  return response
}

// Applica il middleware solo alle route specificate
export const config = {
  matcher: [
    /*
     * Match tutte le richieste eccetto:
     * - _next/static (file statici)
     * - _next/image (ottimizzazione immagini)
     * - favicon.ico, robots.txt, sitemap.xml (file statici)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}

