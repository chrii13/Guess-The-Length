// Mock per isomorphic-dompurify per evitare problemi ESM con Jest
// Questo mock fornisce una versione semplificata di DOMPurify che rimuove HTML

/**
 * Mock di DOMPurify.sanitize
 * Rimuove tutti i tag HTML e mantiene solo il testo
 */
function sanitize(html, config = {}) {
  if (typeof html !== 'string') {
    return ''
  }

  // Rimuove tutti i tag HTML
  let sanitized = html.replace(/<[^>]*>/g, '')
  
  // Rimuove attributi javascript: e data URIs pericolosi
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/data:text\/html/gi, '')
  
  // Rimuove event handlers se ancora presenti
  sanitized = sanitized.replace(/on\w+\s*=/gi, '')

  // Se USE_PROFILES.html è true, rimuove tutto (strettamente sicuro)
  if (config.USE_PROFILES?.html) {
    // Rimuove tutto eccetto spazi e caratteri alfanumerici base
    sanitized = sanitized.replace(/[<>]/g, '')
  }

  return sanitized
}

module.exports = {
  sanitize,
  default: {
    sanitize,
  },
}

