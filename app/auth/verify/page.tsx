'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/hooks/useTheme'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme, mounted: themeMounted } = useTheme()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('Verifica email in corso...')
  const [error, setError] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Leggi i parametri dalla query string che Supabase passa
        const tokenHash = searchParams.get('token_hash')
        const type = searchParams.get('type')
        const token = searchParams.get('token')

        // Supabase passa token_hash e type quando l'utente clicca sul link di verifica
        if (!tokenHash && !token) {
          setStatus('error')
          setError('Link di verifica non valido o scaduto.')
          return
        }

        // Se abbiamo token_hash e type, verifichiamo con verifyOtp
        if (tokenHash && type) {
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as any, // 'email' | 'signup' | 'recovery' | 'magiclink' | 'email_change'
          })

          if (verifyError) {
            console.error('Verify error:', verifyError)
            setStatus('error')
            if (verifyError.message.includes('expired') || verifyError.message.includes('invalid')) {
              setError('Link di verifica non valido o scaduto. Richiedi un nuovo link di verifica.')
            } else {
              setError(verifyError.message || 'Errore durante la verifica dell\'email.')
            }
            return
          }

          // Verifica riuscita
          if (data?.user) {
            setStatus('success')
            setMessage('Email verificata correttamente!')
            
            // Redirect alla home dopo 3 secondi
            setTimeout(() => {
              router.push('/')
            }, 3000)
            return
          }
        }

        // Fallback: se abbiamo solo token (formato più vecchio)
        if (token && type) {
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type as any, // 'email' | 'signup' | 'recovery' | 'magiclink' | 'email_change'
          })

          if (verifyError) {
            console.error('Verify error:', verifyError)
            setStatus('error')
            setError('Link di verifica non valido o scaduto.')
            return
          }

          if (data?.user) {
            setStatus('success')
            setMessage('Email verificata correttamente!')
            setTimeout(() => {
              router.push('/')
            }, 3000)
            return
          }
        }

        // Se arriviamo qui senza parametri validi o senza successo, verifica lo stato della sessione
        // (potrebbe essere che Supabase ha già processato il token automaticamente)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
        }
        
        if (session?.user?.email_confirmed_at) {
          setStatus('success')
          setMessage('Email verificata correttamente!')
          setTimeout(() => {
            router.push('/')
          }, 3000)
        } else if (!tokenHash && !token) {
          // Se non ci sono parametri e non c'è sessione, è un accesso diretto
          setStatus('error')
          setError('Link di verifica non valido o scaduto.')
        } else {
          // Se abbiamo parametri ma la verifica non è andata a buon fine
          setStatus('error')
          setError('Impossibile verificare l\'email. Il link potrebbe essere scaduto.')
        }
      } catch (error) {
        console.error('Verification error:', error)
        setStatus('error')
        setError('Errore durante la verifica dell\'email. Riprova più tardi.')
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <>
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-8 md:py-16 relative z-10">
        <div className="bg-white dark:bg-primary-gray-medium backdrop-blur-sm rounded-2xl-large shadow-soft-lg p-6 md:p-10" style={{ border: '2px solid #1C1C1C' }}>
          <div className="text-center">
            {status === 'verifying' && (
              <>
                <div className="mb-6">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-yellow"></div>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2 text-primary-gray-dark dark:text-primary-gray-light">
                  Verifica in corso...
                </h1>
                <p className="text-sm md:text-base text-primary-gray-medium dark:text-primary-gray-light">
                  {message}
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2 text-primary-gray-dark dark:text-primary-gray-light">
                  Email verificata correttamente!
                </h1>
                <p className="text-sm md:text-base text-primary-gray-medium dark:text-primary-gray-light mb-6">
                  La tua email è stata verificata con successo. Verrai reindirizzato alla home page tra qualche secondo.
                </p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 text-base md:text-lg font-bold bg-gradient-to-r from-primary-yellow to-primary-yellow-dark rounded-xl-large hover:shadow-yellow-glow transition-all shadow-soft-lg transform hover:scale-105 active:scale-95"
                  style={{ color: '#1C1C1C' }}
                >
                  Vai alla Home
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30">
                    <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2 text-primary-gray-dark dark:text-primary-gray-light">
                  Verifica fallita
                </h1>
                <p className="text-sm md:text-base text-primary-gray-medium dark:text-primary-gray-light mb-6">
                  {error || 'Il link di verifica non è valido o è scaduto.'}
                </p>
                <div className="space-y-3">
                  <Link
                    href="/login"
                    className="inline-block w-full px-6 py-3 text-base md:text-lg font-bold bg-gradient-to-r from-primary-yellow to-primary-yellow-dark rounded-xl-large hover:shadow-yellow-glow transition-all shadow-soft-lg transform hover:scale-105 active:scale-95 text-center"
                    style={{ color: '#1C1C1C' }}
                  >
                    Vai al Login
                  </Link>
                  <Link
                    href="/register"
                    className="inline-block w-full px-6 py-3 text-base md:text-lg font-bold text-primary-gray-dark dark:text-primary-gray-light bg-white dark:bg-primary-gray-medium border-2 border-primary-yellow dark:border-primary-yellow-dark rounded-xl-large hover:bg-primary-yellow/10 dark:hover:bg-primary-yellow-dark/20 transition-all shadow-soft-lg text-center"
                  >
                    Registrati di nuovo
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <>
        <Navbar />
        <main className="max-w-md mx-auto px-4 py-8 md:py-16 relative z-10">
          <div className="bg-white dark:bg-primary-gray-medium backdrop-blur-sm rounded-2xl-large shadow-soft-lg p-6 md:p-10" style={{ border: '2px solid #1C1C1C' }}>
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-yellow"></div>
              </div>
              <p className="text-sm md:text-base text-primary-gray-medium dark:text-primary-gray-light">
                Caricamento...
              </p>
            </div>
          </div>
        </main>
      </>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}

