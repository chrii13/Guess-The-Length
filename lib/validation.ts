// Funzioni di validazione per input utente

// Username riservati che non possono essere usati
const RESERVED_USERNAMES = [
  'admin', 'administrator', 'root', 'system', 'api', 'www', 'mail', 'ftp',
  'null', 'undefined', 'true', 'false', 'delete', 'remove', 'update', 'create',
  'login', 'logout', 'register', 'profile', 'settings', 'config', 'error'
]

// Pattern per validare username (solo alfanumerici, underscore, trattino)
const USERNAME_PATTERN = /^[a-zA-Z0-9_-]+$/

// Pattern per validare email
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Pattern per caratteri pericolosi
const DANGEROUS_PATTERN = /\.\.|\.\/|\/\.|javascript:|on\w+\s*=|<script|<\/script|eval\(|expression\(/i

/**
 * Valida un username
 * @param username - L'username da validare
 * @returns Oggetto con valid: boolean e error?: string
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Username obbligatorio' }
  }

  const trimmed = username.trim()

  // Lunghezza
  if (trimmed.length < 3) {
    return { valid: false, error: 'Username deve avere almeno 3 caratteri' }
  }

  if (trimmed.length > 30) {
    return { valid: false, error: 'Username non può superare i 30 caratteri' }
  }

  // Solo caratteri alfanumerici, underscore, trattino
  if (!USERNAME_PATTERN.test(trimmed)) {
    return { valid: false, error: 'Username può contenere solo lettere, numeri, underscore (_) e trattini (-)' }
  }

  // Non può iniziare o finire con underscore o trattino
  if (/^[_-]|[_-]$/.test(trimmed)) {
    return { valid: false, error: 'Username non può iniziare o finire con underscore o trattino' }
  }

  // Evita username riservati
  if (RESERVED_USERNAMES.includes(trimmed.toLowerCase())) {
    return { valid: false, error: 'Questo username non è disponibile' }
  }

  // Evita pattern sospetti
  if (DANGEROUS_PATTERN.test(trimmed)) {
    return { valid: false, error: 'Username non valido' }
  }

  return { valid: true }
}

/**
 * Valida un'email
 * @param email - L'email da validare
 * @returns Oggetto con valid: boolean e error?: string
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email obbligatoria' }
  }

  const trimmed = email.trim()

  // Lunghezza massima (standard email)
  if (trimmed.length > 254) {
    return { valid: false, error: 'Email troppo lunga' }
  }

  // Pattern base email
  if (!EMAIL_PATTERN.test(trimmed)) {
    return { valid: false, error: 'Formato email non valido' }
  }

  // Evita caratteri pericolosi
  if (/[<>'"\\]/.test(trimmed)) {
    return { valid: false, error: 'Email contiene caratteri non validi' }
  }

  // Evita pattern sospetti
  if (DANGEROUS_PATTERN.test(trimmed)) {
    return { valid: false, error: 'Email non valida' }
  }

  // Verifica che non ci siano spazi multipli
  if (/\s{2,}/.test(trimmed)) {
    return { valid: false, error: 'Email non valida' }
  }

  return { valid: true }
}

/**
 * Valida una password
 * @param password - La password da validare
 * @param requireComplexity - Se true, richiede complessità (maiuscole, minuscole, numeri)
 * @returns Oggetto con valid: boolean e error?: string
 */
export function validatePassword(password: string, requireComplexity: boolean = true): { valid: boolean; error?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password obbligatoria' }
  }

  // Lunghezza minima
  if (password.length < 8) {
    return { valid: false, error: 'La password deve essere lunga almeno 8 caratteri' }
  }

  // Lunghezza massima (per prevenire DoS)
  if (password.length > 128) {
    return { valid: false, error: 'La password è troppo lunga (massimo 128 caratteri)' }
  }

  // Se richiesta complessità
  if (requireComplexity) {
    // Almeno una lettera maiuscola
    if (!/[A-Z]/.test(password)) {
      return { valid: false, error: 'La password deve contenere almeno una lettera maiuscola (A-Z)' }
    }

    // Almeno una lettera minuscola
    if (!/[a-z]/.test(password)) {
      return { valid: false, error: 'La password deve contenere almeno una lettera minuscola (a-z)' }
    }

    // Almeno un numero
    if (!/[0-9]/.test(password)) {
      return { valid: false, error: 'La password deve contenere almeno un numero (0-9)' }
    }
  }

  // Evita caratteri Unicode problematici
  if (!/^[\x20-\x7E]+$/.test(password)) {
    return { valid: false, error: 'La password può contenere solo caratteri ASCII stampabili' }
  }

  return { valid: true }
}

/**
 * Sanitizza un username rimuovendo caratteri pericolosi
 * @param username - L'username da sanitizzare
 * @returns Username sanitizzato
 */
export function sanitizeUsername(username: string): string {
  if (!username || typeof username !== 'string') {
    return ''
  }

  return username
    .trim()
    .replace(/[<>'"\\]/g, '') // Rimuove caratteri pericolosi
    .replace(/\s+/g, '') // Rimuove spazi
    .substring(0, 30) // Limita lunghezza
}

/**
 * Sanitizza un'email rimuovendo caratteri pericolosi
 * @param email - L'email da sanitizzare
 * @returns Email sanitizzata
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return ''
  }

  return email
    .trim()
    .toLowerCase()
    .replace(/[<>'"\\]/g, '') // Rimuove caratteri pericolosi
    .replace(/\s+/g, '') // Rimuove spazi
    .substring(0, 254) // Limita lunghezza
}

