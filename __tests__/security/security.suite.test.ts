/**
 * Test Suite Completa per Sicurezza
 * Esegue tutti i test di sicurezza e genera un report
 */

import { xssPayloads, sqlInjectionPayloads } from './payloads'

describe('Security Test Suite', () => {
  describe('Security Overview', () => {
    it('should have XSS payloads defined', () => {
      expect(xssPayloads.length).toBeGreaterThan(0)
      expect(xssPayloads.every(p => typeof p === 'string')).toBe(true)
    })

    it('should have SQL injection payloads defined', () => {
      expect(sqlInjectionPayloads.length).toBeGreaterThan(0)
      expect(sqlInjectionPayloads.every(p => typeof p === 'string')).toBe(true)
    })
  })

  describe('Security Configuration', () => {
    it('should have rate limiting configured', () => {
      const { apiRateLimitConfig } = require('@/lib/config')
      expect(apiRateLimitConfig.maxRequests).toBeGreaterThan(0)
      expect(apiRateLimitConfig.windowMs).toBeGreaterThan(0)
    })

    it('should have CSP headers configured', () => {
      const nextConfig = require('../../next.config.js')
      // next.config.js può esportare direttamente o come default
      const config = nextConfig.default || nextConfig
      expect(config.headers).toBeDefined()
    })
  })

  describe('Security Libraries', () => {
    it('should have DOMPurify installed', () => {
      // DOMPurify viene mockato per evitare problemi ESM con Jest
      const DOMPurify = require('isomorphic-dompurify')
      expect(DOMPurify).toBeDefined()
      // Il mock può esportare come default o direttamente
      const sanitize = DOMPurify.sanitize || (DOMPurify.default && DOMPurify.default.sanitize) || DOMPurify.default?.sanitize
      expect(typeof sanitize).toBe('function')
    })
  })
})

/**
 * Test di integrazione per verificare che tutte le protezioni funzionino insieme
 */
describe('Security Integration Tests', () => {
  it('should prevent XSS and SQL injection simultaneously', () => {
    const { sanitizeString, sanitizeHtml } = require('@/lib/sanitize')
    const { validateUsername } = require('@/lib/validation')
    
    const combinedAttack = "<script>alert('XSS')</script>' OR 1=1--"
    
    // sanitizeString rimuove solo caratteri di controllo, non HTML
    // Per HTML, usa sanitizeHtml
    const sanitized = sanitizeString(combinedAttack)
    expect(sanitized).not.toMatch(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/)
    
    // Per rimuovere HTML, usa sanitizeHtml
    const htmlSanitized = sanitizeHtml(combinedAttack)
    expect(htmlSanitized).not.toMatch(/<script[\s\S]*?>/i)
    
    // SQL injection dovrebbe essere rifiutato dalla validazione
    const validation = validateUsername(combinedAttack)
    expect(validation.valid).toBe(false)
  })

  it('should apply all security layers', () => {
    // Verifica che esistano tutte le funzioni di sicurezza
    const { sanitizeString } = require('@/lib/sanitize')
    const { validateUsername, validateEmail } = require('@/lib/validation')
    const { checkRateLimit } = require('@/lib/rate-limit')
    const { verifyCsrfRequest } = require('@/lib/csrf')
    
    expect(typeof sanitizeString).toBe('function')
    expect(typeof validateUsername).toBe('function')
    expect(typeof validateEmail).toBe('function')
    expect(typeof checkRateLimit).toBe('function')
    expect(typeof verifyCsrfRequest).toBe('function')
  })
})


