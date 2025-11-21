import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { applyApiSecurity, secureResponse, secureErrorResponse } from '@/lib/api-security'
import { validateEmail } from '@/lib/validation'
import { sanitizeEmail as sanitizeEmailInput } from '@/lib/sanitize'
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'
import { checkEmailRateLimitConfig, checkEmailMaxBodySize } from '@/lib/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase service role key. Please add SUPABASE_SERVICE_ROLE_KEY to .env.local')
}

// Crea un client Supabase admin con service_role key (solo lato server)
const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

export async function POST(request: NextRequest) {
  try {
    // Applica tutte le protezioni di sicurezza (CSRF, Content-Type, Rate Limiting, Sanitizzazione)
    // NOTA: requireCsrf è true ma la verifica CSRF controlla Origin/Referer, che dovrebbe essere presente
    // per richieste same-origin dal browser
    const security = await applyApiSecurity(request, {
      rateLimit: checkEmailRateLimitConfig, // Configurato da variabili d'ambiente
      requireCsrf: true, // CSRF verifica Origin/Referer per same-origin
      requireContentType: true,
      maxBodySize: checkEmailMaxBodySize, // Configurato da variabili d'ambiente
    })

    if (!security.valid) {
      return security.response!
    }

    // Body già sanitizzato da applyApiSecurity
    const body = security.sanitizedBody || {}

    // Estrai email dal body sanitizzato
    const emailInput = body.email

    if (!emailInput || typeof emailInput !== 'string') {
      return secureErrorResponse('Email is required and must be a valid string', 400)
    }

    // Sanitizza email (rimuove caratteri pericolosi e converte in lowercase)
    const email = sanitizeEmailInput(emailInput)

    // Valida email
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return secureErrorResponse(emailValidation.error || 'Invalid email format', 400)
    }

    // Limita lunghezza email (prevenzione DoS)
    if (email.length > 254) {
      return secureErrorResponse('Email too long', 400)
    }

    if (!supabaseAdmin) {
      return secureErrorResponse('Server configuration error', 500)
    }

    // Usa l'Admin API per verificare se l'email esiste già
    // L'Admin API può accedere direttamente a auth.users
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
      console.error('Error checking email:', error)
      return secureErrorResponse('Error checking email', 500)
    }

    // Verifica se esiste già un utente con questa email
    const emailExists = users?.users?.some(user => 
      user.email?.toLowerCase() === email.toLowerCase()
    ) || false

    // Ottieni info rate limit per la risposta
    const identifier = getRateLimitIdentifier(request)
    const rateLimit = checkRateLimit(
      identifier,
      checkEmailRateLimitConfig.maxRequests,
      checkEmailRateLimitConfig.windowMs
    )

    return secureResponse(
      { exists: emailExists },
      200,
      {
        maxRequests: checkEmailRateLimitConfig.maxRequests,
        remaining: rateLimit.remaining,
        resetTime: rateLimit.resetTime,
      }
    )
  } catch (error) {
    console.error('Error in check-email endpoint:', error)
    return secureErrorResponse('Internal server error', 500)
  }
}

