// Utility per gestire configurazioni da variabili d'ambiente con fallback

/**
 * Ottiene una variabile d'ambiente come stringa
 */
export function getEnvString(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue
}

/**
 * Ottiene una variabile d'ambiente come numero
 */
export function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key]
  if (!value) {
    return defaultValue
  }
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * Ottiene una variabile d'ambiente come boolean
 */
export function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key]
  if (!value) {
    return defaultValue
  }
  return value.toLowerCase() === 'true' || value === '1'
}

/**
 * Configurazione Rate Limiting API Routes
 */
export const apiRateLimitConfig = {
  maxRequests: getEnvNumber('API_RATE_LIMIT_MAX_REQUESTS', 10),
  windowMs: getEnvNumber('API_RATE_LIMIT_WINDOW_MS', 60000), // 1 minuto default
}

/**
 * Configurazione Max Body Size per API Routes
 */
export const apiMaxBodySize = getEnvNumber('API_MAX_BODY_SIZE', 1024 * 1024) // 1MB default

/**
 * Configurazione specifica per endpoint /api/check-email
 */
export const checkEmailRateLimitConfig = {
  maxRequests: getEnvNumber('API_CHECK_EMAIL_RATE_LIMIT_MAX_REQUESTS', 10),
  windowMs: getEnvNumber('API_CHECK_EMAIL_RATE_LIMIT_WINDOW_MS', 60000), // 1 minuto default
}

/**
 * Max Body Size per endpoint /api/check-email
 */
export const checkEmailMaxBodySize = getEnvNumber('API_CHECK_EMAIL_MAX_BODY_SIZE', 1024) // 1KB default

/**
 * Configurazione Supabase (già gestita, ma centralizzata per riferimento)
 */
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
}

