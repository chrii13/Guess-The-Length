/**
 * Test per Rate Limiting
 * Verifica che il rate limiting funzioni correttamente per prevenire spam e DoS
 */

import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'
import { apiRateLimitConfig } from '@/lib/config'

describe('Rate Limiting Tests', () => {
  // Usa identificatori unici per ogni test per evitare conflitti
  let testIdCounter = 0
  function getUniqueTestId() {
    return `test-ip-${Date.now()}-${++testIdCounter}`
  }
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rate Limit Function', () => {
    it('should allow requests within limit', () => {
      const identifier = getUniqueTestId()
      
      for (let i = 0; i < apiRateLimitConfig.maxRequests; i++) {
        const result = checkRateLimit(identifier)
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBeGreaterThanOrEqual(0)
      }
    })

    it('should block requests exceeding limit', () => {
      const identifier = getUniqueTestId()
      
      // Fai richieste fino al limite
      for (let i = 0; i < apiRateLimitConfig.maxRequests; i++) {
        checkRateLimit(identifier)
      }
      
      // La prossima richiesta dovrebbe essere bloccata
      const result = checkRateLimit(identifier)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should reset after window expires', (done) => {
      const identifier = getUniqueTestId()
      const shortWindow = 100 // 100ms per test veloci
      
      // Fai richieste fino al limite
      for (let i = 0; i < apiRateLimitConfig.maxRequests; i++) {
        checkRateLimit(identifier, apiRateLimitConfig.maxRequests, shortWindow)
      }
      
      // Dovrebbe essere bloccato
      let result = checkRateLimit(identifier, apiRateLimitConfig.maxRequests, shortWindow)
      expect(result.allowed).toBe(false)
      
      // Aspetta che il window scada
      setTimeout(() => {
        result = checkRateLimit(identifier, apiRateLimitConfig.maxRequests, shortWindow)
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBeGreaterThan(0)
        done()
      }, shortWindow + 10) // +10ms per sicurezza
    })

    it('should track different identifiers separately', () => {
      const identifier1 = getUniqueTestId()
      const identifier2 = getUniqueTestId()
      
      // Raggiungi il limite per identifier1
      for (let i = 0; i < apiRateLimitConfig.maxRequests; i++) {
        checkRateLimit(identifier1)
      }
      
      // identifier2 dovrebbe ancora essere permesso
      const result2 = checkRateLimit(identifier2)
      expect(result2.allowed).toBe(true)
      expect(result2.remaining).toBe(apiRateLimitConfig.maxRequests - 1)
      
      // identifier1 dovrebbe essere bloccato
      const result1 = checkRateLimit(identifier1)
      expect(result1.allowed).toBe(false)
    })

    it('should return correct remaining count', () => {
      const identifier = getUniqueTestId()
      const maxRequests = 10
      
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(identifier, maxRequests)
        expect(result.remaining).toBe(maxRequests - (i + 1))
      }
    })

    it('should return correct reset time', () => {
      const identifier = getUniqueTestId()
      const windowMs = 60000
      
      const result = checkRateLimit(identifier, apiRateLimitConfig.maxRequests, windowMs)
      
      expect(result.resetTime).toBeGreaterThan(Date.now())
      expect(result.resetTime).toBeLessThanOrEqual(Date.now() + windowMs + 1000) // +1s di tolleranza
    })
  })

  describe('IP Identifier Extraction', () => {
    it('should extract IP from x-forwarded-for header', () => {
      // Mock di Request standard (non NextRequest)
      const mockRequest = {
        headers: {
          get: (name: string) => {
            if (name === 'x-forwarded-for') return '192.168.1.1, 10.0.0.1'
            if (name === 'x-real-ip') return null
            return null
          }
        }
      } as any as Request
      
      const identifier = getRateLimitIdentifier(mockRequest)
      expect(identifier).toBe('rate-limit:192.168.1.1')
    })

    it('should extract IP from x-real-ip header when x-forwarded-for is missing', () => {
      const mockRequest = {
        headers: {
          get: (name: string) => {
            if (name === 'x-forwarded-for') return null
            if (name === 'x-real-ip') return '192.168.1.2'
            return null
          }
        }
      } as any as Request
      
      const identifier = getRateLimitIdentifier(mockRequest)
      expect(identifier).toBe('rate-limit:192.168.1.2')
    })

    it('should use "unknown" when no IP headers are present', () => {
      const mockRequest = {
        headers: {
          get: (name: string) => null
        }
      } as any as Request
      
      const identifier = getRateLimitIdentifier(mockRequest)
      expect(identifier).toBe('rate-limit:unknown')
    })
  })

  describe('Rate Limit in API Routes', () => {
    it.skip('should apply rate limiting to check-email endpoint', async () => {
      // Skip se il server non è disponibile
      const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
      if (!BASE_URL) {
        console.warn('Skipping API test: server not available. Set NEXT_PUBLIC_BASE_URL to enable.')
        return
      }
      const email = 'test@example.com'
      
      // Fai molte richieste rapidamente
      const requests = Array(15).fill(null).map(() =>
        fetch(`${BASE_URL}/api/check-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': BASE_URL, // Origin valido
          },
          body: JSON.stringify({ email }),
        })
      )
      
      const responses = await Promise.all(requests)
      
      // Alcune richieste dovrebbero essere bloccate
      const blocked = responses.filter(r => r.status === 429)
      const allowed = responses.filter(r => r.status !== 429)
      
      expect(blocked.length).toBeGreaterThan(0)
      expect(allowed.length).toBeLessThanOrEqual(apiRateLimitConfig.maxRequests)
    })

    it.skip('should include rate limit headers in responses', async () => {
      const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
      if (!BASE_URL) {
        console.warn('Skipping API test: server not available. Set NEXT_PUBLIC_BASE_URL to enable.')
        return
      }
      
      const response = await fetch(`${BASE_URL}/api/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': BASE_URL,
        },
        body: JSON.stringify({ email: 'test@example.com' }),
      })
      
      const rateLimitLimit = response.headers.get('X-RateLimit-Limit')
      const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining')
      const rateLimitReset = response.headers.get('X-RateLimit-Reset')
      
      expect(rateLimitLimit).toBeDefined()
      expect(rateLimitRemaining).toBeDefined()
      expect(rateLimitReset).toBeDefined()
      
      if (rateLimitRemaining) {
        expect(parseInt(rateLimitRemaining)).toBeGreaterThanOrEqual(0)
        expect(parseInt(rateLimitRemaining)).toBeLessThanOrEqual(parseInt(rateLimitLimit || '10'))
      }
    })

    it.skip('should return 429 with Retry-After header when rate limited', async () => {
      const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
      if (!BASE_URL) {
        console.warn('Skipping API test: server not available. Set NEXT_PUBLIC_BASE_URL to enable.')
        return
      }
      
      // Raggiungi il limite
      for (let i = 0; i < apiRateLimitConfig.maxRequests + 1; i++) {
        const response = await fetch(`${BASE_URL}/api/check-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': BASE_URL,
          },
          body: JSON.stringify({ email: 'test@example.com' }),
        })
        
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After')
          expect(retryAfter).toBeDefined()
          expect(parseInt(retryAfter || '0')).toBeGreaterThan(0)
          break
        }
      }
    })
  })

  describe('Concurrent Request Handling', () => {
    it('should handle concurrent requests correctly', async () => {
      const identifier = getUniqueTestId()
      const concurrentRequests = 5
      const maxRequests = 10
      
      const promises = Array(concurrentRequests).fill(null).map(() =>
        Promise.resolve(checkRateLimit(identifier, maxRequests, 60000))
      )
      
      const results = await Promise.all(promises)
      
      // Tutte le richieste dovrebbero essere permesse (sotto il limite)
      results.forEach(result => {
        expect(result.allowed).toBe(true)
      })
      
      // Il conteggio totale dovrebbe essere corretto
      const totalCount = results.reduce((sum, r) => sum + (r.allowed ? 1 : 0), 0)
      expect(totalCount).toBe(concurrentRequests)
      
      // Verifica che il conteggio finale sia corretto
      const finalResult = checkRateLimit(identifier, maxRequests, 60000)
      expect(finalResult.remaining).toBe(maxRequests - (concurrentRequests + 1))
    })
  })
})

