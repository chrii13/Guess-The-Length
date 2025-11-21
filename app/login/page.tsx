'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/hooks/useTheme'
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
  const { theme, mounted: themeMounted, imageVersion } = useTheme()

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
      <main className="max-w-md mx-auto px-4 py-8 md:py-16 relative z-10">
        <div className="bg-white dark:bg-primary-gray-medium backdrop-blur-sm rounded-2xl-large shadow-soft-lg p-6 md:p-10" style={{ border: '2px solid #1C1C1C' }}>
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 flex mb-4 bg-transparent dark:bg-transparent">
              <Image
                key={`lock-${theme}-${imageVersion}`}
                src={`${themeMounted && theme === 'dark' ? "/assets/icons/lock-dark.svg" : "/assets/icons/lock.svg"}?v=${theme}-${imageVersion}`}
                alt="Lock Icon"
                width={40}
                height={40}
                className="w-8 h-8 md:w-10 md:h-10 pointer-events-none"
                style={{ backgroundColor: 'transparent', background: 'transparent', display: 'block' }}
                unoptimized
              />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary-gray-dark dark:text-primary-gray-light mb-2">Accedi</h1>
            <p className="text-sm md:text-base text-primary-gray-medium dark:text-primary-gray-light/70">Accedi al tuo account Guess the Length</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-primary-gray-dark dark:text-primary-gray-light mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-primary-gray-light dark:border-primary-gray-medium rounded-xl-large focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow transition-all bg-white dark:bg-primary-gray-dark text-primary-gray-dark dark:text-primary-gray-light placeholder:text-primary-gray-medium/50 dark:placeholder:text-primary-gray-light/50"
                placeholder="tua@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-primary-gray-dark dark:text-primary-gray-light mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-primary-gray-light dark:border-primary-gray-medium rounded-xl-large focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow transition-all bg-white dark:bg-primary-gray-dark text-primary-gray-dark dark:text-primary-gray-light placeholder:text-primary-gray-medium/50 dark:placeholder:text-primary-gray-light/50"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl-large text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 text-base md:text-lg font-bold bg-gradient-to-r from-primary-yellow to-primary-yellow-dark rounded-xl-large hover:shadow-yellow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-soft-lg transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ color: '#1C1C1C' }}
            >
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm md:text-base text-primary-gray-medium dark:text-primary-gray-light/70">
            Non hai un account?{' '}
            <Link href="/register" className="text-primary-gray-dark dark:text-primary-yellow hover:opacity-80 font-bold transition-colors">
              Registrati
            </Link>
          </p>
        </div>
      </main>
    </>
  )
}

