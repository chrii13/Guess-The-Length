'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { validateEmail, sanitizeEmail } from '@/lib/validation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lastAttempt, setLastAttempt] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Rate limiting lato client (base)
    const now = Date.now()
    const timeSinceLastAttempt = now - lastAttempt
    
    // Reset tentativi dopo 1 minuto
    if (timeSinceLastAttempt > 60000) {
      setAttempts(0)
    }
    
    // Blocca se troppi tentativi
    if (attempts >= 5 && timeSinceLastAttempt < 60000) {
      const remainingSeconds = Math.ceil((60000 - timeSinceLastAttempt) / 1000)
      setError(`Troppi tentativi falliti. Riprova tra ${remainingSeconds} secondi.`)
      setIsBlocked(true)
      return
    }
    
    setIsBlocked(false)
    setLoading(true)

    // Validazione email
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      setError(emailValidation.error || 'Email non valida')
      setLoading(false)
      return
    }

    // Sanitizza email
    const trimmedEmail = sanitizeEmail(email)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    })

    setLastAttempt(Date.now())

    if (signInError) {
      // Incrementa tentativi falliti
      setAttempts(prev => prev + 1)
      // Messaggio di errore generico per non rivelare se l'email esiste
      setError('Email o password non corretti')
      setLoading(false)
    } else {
      // Reset tentativi su successo
      setAttempts(0)
      router.push('/')
    }
  }

  return (
    <>
      <Navbar />
      <main className="entra mx-auto max-w-md px-5 pb-16 pt-10 md:pt-16">
        <h1 className="cifre text-6xl">Accedi</h1>
        <p className="mt-3 text-grafite">Entra nel tuo account Guess the Length.</p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="etichetta">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="campo"
              placeholder="tua@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="etichetta">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="campo"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="avviso-errore" role="alert">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-nastro w-full">
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-grafite">
          <p>Non hai un account?</p>
          <Link href="/register" className="btn btn-linea btn-piccolo">
            Registrati
          </Link>
        </div>
      </main>
    </>
  )
}
