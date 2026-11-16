'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
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
      <main className="entra mx-auto max-w-md px-5 pb-16 pt-10 md:pt-16">
        {status === 'verifying' && (
          <>
            <h1 className="cifre text-5xl">Verifica in corso</h1>
            <p className="mt-4 text-grafite">{message}</p>
            <div className="caricamento mt-6" role="status" aria-label="Caricamento" />
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className="cifre text-5xl">Email verificata</h1>
            <p className="mt-4 text-grafite">
              Tra qualche secondo torni alla home.
            </p>
            <Link href="/" className="btn btn-nastro mt-8">
              Vai alla home
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="cifre text-5xl text-errore">Verifica fallita</h1>
            <p className="mt-4 text-grafite">
              {error || 'Il link di verifica non è valido o è scaduto.'}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="btn btn-nastro">
                Vai al login
              </Link>
              <Link href="/register" className="btn btn-linea">
                Registrati di nuovo
              </Link>
            </div>
          </>
        )}
      </main>
    </>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <>
        <Navbar />
        <main className="mx-auto max-w-md px-5 pb-16 pt-10 md:pt-16">
          <div className="caricamento" role="status" aria-label="Caricamento" />
        </main>
      </>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
