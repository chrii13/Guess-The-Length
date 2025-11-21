'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/hooks/useTheme'
import { checkUsernameExists } from '@/lib/profile'
import { validateUsername, validateEmail, validatePassword, sanitizeUsername, sanitizeEmail } from '@/lib/validation'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lastAttempt, setLastAttempt] = useState(0)
  const [buttonTextColor, setButtonTextColor] = useState('#1C1C1C')
  const [titleTextColor, setTitleTextColor] = useState('#1C1C1C')
  const router = useRouter()
  const { theme, mounted: themeMounted } = useTheme()

  useEffect(() => {
    if (themeMounted) {
      setButtonTextColor('#1C1C1C')
      setTitleTextColor(theme === 'dark' ? '#FFFFFF' : '#1C1C1C')
    }
  }, [theme, themeMounted])

  const handleRegister = async (e: React.FormEvent) => {
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
      setLoading(false)
      return
    }
    
    setLoading(true)

    // Validazione username
    const usernameValidation = validateUsername(username)
    if (!usernameValidation.valid) {
      setError(usernameValidation.error || 'Username non valido')
      setLoading(false)
      return
    }

    // Validazione email
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      setError(emailValidation.error || 'Email non valida')
      setLoading(false)
      return
    }

    // Validazione password
    const passwordValidation = validatePassword(password, true)
    if (!passwordValidation.valid) {
      setError(passwordValidation.error || 'Password non valida')
      setLoading(false)
      return
    }

    // Sanitizza input
    const trimmedUsername = sanitizeUsername(username)
    const trimmedEmail = sanitizeEmail(email)

    // Verifica che l'username sia unico (controllo client-side)
    try {
      const usernameExists = await checkUsernameExists(trimmedUsername)
      if (usernameExists) {
        setError('Questo nome utente è già in uso. Per favore scegline un altro.')
        setLoading(false)
        return
      }
    } catch (error) {
      console.error('Error checking username:', error)
      // Continua con la registrazione, il server controllerà comunque
    }

    // IMPORTANTE: Verifica se l'email esiste già PRIMA di chiamare signUp
    // Usa l'endpoint API server-side per verificare se l'email esiste
    // Questo controllo è OBBLIGATORIO - se fallisce, blocca la registrazione
    let emailCheckSuccessful = false
    let emailExists = false
    
    try {
      const checkEmailResponse = await fetch('/api/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmedEmail }),
      })

      if (checkEmailResponse.ok) {
        const data = await checkEmailResponse.json()
        emailExists = data.exists === true
        emailCheckSuccessful = true
        
        if (emailExists) {
          // L'email esiste già - messaggio chiaro con suggerimento di accedere
          setError('Questa email è già registrata. Accedi se hai già un account, oppure usa un\'altra email.')
          setLoading(false)
          setAttempts(prev => prev + 1)
          return
        }
      } else {
        // Se l'endpoint fallisce, blocca la registrazione per sicurezza
        const errorText = await checkEmailResponse.text().catch(() => 'Unknown error')
        let errorMessage = 'Impossibile verificare se l\'email è già in uso.'
        
        // Messaggi di errore più specifici in base allo status
        if (checkEmailResponse.status === 403) {
          errorMessage = 'Errore di sicurezza durante la verifica email. Ricarica la pagina e riprova.'
        } else if (checkEmailResponse.status === 429) {
          errorMessage = 'Troppe richieste. Attendi un momento e riprova.'
        } else if (checkEmailResponse.status >= 500) {
          errorMessage = 'Errore del server durante la verifica email. Riprova più tardi.'
        }
        
        console.error('Email check endpoint failed with status:', checkEmailResponse.status, 'error:', errorText)
        setError(errorMessage)
        setLoading(false)
        setAttempts(prev => prev + 1)
        return
      }
    } catch (error) {
      // Se l'endpoint non è disponibile o c'è un errore di rete, blocca la registrazione
      console.error('Email check endpoint error:', error)
      setError('Impossibile verificare se l\'email è già in uso. Controlla la connessione e riprova.')
      setLoading(false)
      setAttempts(prev => prev + 1)
      return
    }
    
    // Se il controllo email non è andato a buon fine, blocca la registrazione
    if (!emailCheckSuccessful) {
      setError('Impossibile verificare se l\'email è già in uso. Riprova più tardi.')
      setLoading(false)
      setAttempts(prev => prev + 1)
      return
    }

    // Registra l'utente con metadata che include l'username
    // Il trigger database creerà automaticamente il profilo
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          username: trimmedUsername,
        },
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
      },
    })

    setLastAttempt(Date.now())

    // IMPORTANTE: Prima di tutto, verifica se c'è un errore
    // Se c'è un errore, gestiscilo PRIMA di procedere con la registrazione
    if (signUpError) {
      // Incrementa tentativi falliti
      setAttempts(prev => prev + 1)
      
      // Log completo dell'errore per debug
      console.error('Registration error full:', {
        message: signUpError.message,
        code: signUpError.code,
        status: signUpError.status,
        error: signUpError,
        fullError: JSON.stringify(signUpError, null, 2)
      })
      
      // Gestisci errori specifici di Supabase Auth
      const errorMessage = signUpError.message?.toLowerCase() || ''
      const errorCode = signUpError.status || signUpError.code
      const errorName = signUpError.name?.toLowerCase() || ''
      
      // Controlla prima gli errori specifici di username (il trigger SQL potrebbe essere eseguito prima)
      if (
        errorMessage.includes('username already exists') || 
        (errorMessage.includes('username') && errorMessage.includes('already exists')) ||
        errorMessage.includes('username already exists:')
      ) {
        // Errore del trigger SQL per username duplicato
        setError('Questo nome utente è già in uso. Per favore scegline un altro.')
        setLoading(false)
        return
      }
      // Poi controlla errori specifici di email già in uso - AGGIUNTO PIÙ CONTROLLI
      else if (
        errorMessage.includes('email already registered') ||
        errorMessage.includes('email address is already registered') ||
        errorMessage.includes('user already registered') ||
        errorMessage.includes('email already exists') ||
        errorMessage.includes('user already exists') ||
        errorMessage.includes('already registered') ||
        errorMessage.includes('email address already registered') ||
        errorMessage.includes('a user with this email address has already been registered') ||
        errorMessage.includes('signup is disabled') ||
        errorMessage.includes('email already confirmed') ||
        errorMessage.includes('user with this email') ||
        errorMessage.includes('duplicate key value') ||
        errorCode === 422 ||
        errorCode === 400 ||
        errorCode === 'email_already_registered' ||
        errorCode === '23505' || // PostgreSQL unique violation
        errorCode === 'PGRST301' || // PostgREST conflict
        errorName === 'authapierror' && (errorCode === 422 || errorCode === 400 || errorMessage.includes('already')) ||
        (errorCode === 422 && errorMessage.includes('email')) || // Status 422 con messaggio che contiene email
        (errorCode === 400 && (errorMessage.includes('email') || errorMessage.includes('user'))) // Status 400 con email/user
      ) {
        // Errore specifico per email già registrata - messaggio chiaro con suggerimento di accedere
        setError('Questa email è già registrata. Accedi se hai già un account, oppure usa un\'altra email.')
        setLoading(false)
        return
      } 
      // Poi altri errori di validazione
      else if (errorMessage.includes('username length') || errorMessage.includes('username contains invalid')) {
        // Errore del trigger SQL per validazione username
        setError('Nome utente non valido: ' + signUpError.message)
      } else if (errorMessage.includes('invalid email') || errorMessage.includes('email format') || errorMessage.includes('invalid email format')) {
        setError('Email non valida. Verifica il formato dell\'indirizzo email.')
      } else if (errorMessage.includes('password') || errorMessage.includes('password')) {
        // Gestisci errori password da Supabase
        if (errorMessage.includes('password should be at least')) {
          setError('La password deve essere lunga almeno 8 caratteri')
        } else {
          setError('Password non valida. ' + (signUpError.message || 'Verifica i requisiti della password.'))
        }
      } else {
        // Per altri errori, verifica se contiene indicazioni di duplicati
        const lowerError = JSON.stringify(signUpError).toLowerCase()
        if (
          lowerError.includes('already') || 
          lowerError.includes('exists') || 
          lowerError.includes('duplicate') ||
          errorCode === 422 ||
          errorCode === 409 || // Conflict
          errorCode === '23505' || // PostgreSQL unique violation
          (errorMessage.includes('already') || errorMessage.includes('exists') || errorMessage.includes('duplicate'))
        ) {
          setError('Questa email o username è già in uso. Accedi se hai già un account, oppure usa credenziali diverse.')
        } else {
          // Mostra messaggio con dettagli utili per debug
          // Se il messaggio contiene "already" o "exists", suggerisci di accedere
          const errorMsg = signUpError.message || ''
          if (errorMsg.toLowerCase().includes('already') || errorMsg.toLowerCase().includes('exists') || errorMsg.toLowerCase().includes('registered')) {
            setError('Questa email è già registrata. Accedi se hai già un account, oppure usa un\'altra email.')
          } else {
            setError('Errore durante la registrazione: ' + (errorMsg || 'Riprova più tardi.'))
          }
        }
      }
      setLoading(false)
      return
    }

    // IMPORTANTE: Verifica che l'utente sia stato creato
    // Se Supabase non restituisce errore ma anche non restituisce user,
    // potrebbe significare che l'email esiste già (non verificata)
    if (!authData?.user) {
      // Non c'è un user - l'email esiste già e Supabase non ha creato un nuovo utente
      setError('Questa email è già registrata. Accedi se hai già un account, oppure usa un\'altra email.')
      setLoading(false)
      setAttempts(prev => prev + 1)
      return
    }

    // IMPORTANTE: Verifica che l'utente sia realmente nuovo e creato
    // Controlla la data di creazione - se è più vecchia di 1 secondo, è sospetto
    const currentTime = new Date()
    const userCreatedAt = authData.user.created_at ? new Date(authData.user.created_at) : null
    
    if (!userCreatedAt) {
      // Non c'è data di creazione - sospetto, blocca la registrazione
      setError('Errore durante la registrazione. Riprova.')
      setLoading(false)
      setAttempts(prev => prev + 1)
      return
    }
    
    const secondsSinceCreation = (currentTime.getTime() - userCreatedAt.getTime()) / 1000
    
    // Se l'utente è stato creato più di 1 secondo fa, probabilmente esisteva già
    // Un nuovo utente dovrebbe essere creato praticamente istantaneamente (meno di 1 secondo fa)
    if (secondsSinceCreation > 1) {
      // L'utente esisteva già - blocca la registrazione
      setError('Questa email è già registrata. Accedi se hai già un account, oppure usa un\'altra email.')
      setLoading(false)
      setAttempts(prev => prev + 1)
      return
    }
    
    // IMPORTANTE: Verifica aggiuntiva - verifica se l'utente è stato effettivamente creato
    // Se Supabase ha creato un nuovo utente, non dovremmo essere in grado di fare login immediatamente
    // Se invece possiamo fare login, significa che l'utente esisteva già
    // Aspetta un attimo per dare tempo a Supabase di processare la registrazione
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Prova a fare login con la password fornita
    // Se il login funziona, significa che l'utente esisteva già (perché un nuovo utente non verificato non può fare login)
    const { data: loginTestData, error: loginTestError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: password,
    })
    
    // Se il login ha successo, significa che l'utente esisteva già
    if (loginTestData?.user && !loginTestError) {
      const loginUserId = loginTestData.user.id
      const newUserId = authData.user.id
      
      // Se l'ID è diverso, significa che sono utenti diversi - l'email esiste già
      if (loginUserId !== newUserId) {
        setError('Questa email è già registrata. Accedi se hai già un account, oppure usa un\'altra email.')
        setLoading(false)
        setAttempts(prev => prev + 1)
        await supabase.auth.signOut()
        return
      }
      
      // Se l'ID è lo stesso, verifica la data di creazione
      const loginUserCreatedAt = loginTestData.user.created_at ? new Date(loginTestData.user.created_at) : null
      if (loginUserCreatedAt) {
        const loginSecondsSinceCreation = (currentTime.getTime() - loginUserCreatedAt.getTime()) / 1000
        // Se possiamo fare login e l'utente è stato creato più di 2 secondi fa, esisteva già
        if (loginSecondsSinceCreation > 2) {
          setError('Questa email è già registrata. Accedi se hai già un account, oppure usa un\'altra email.')
          setLoading(false)
          setAttempts(prev => prev + 1)
          await supabase.auth.signOut()
          return
        }
      }
      
      // Se il login funziona ma l'utente è nuovo, facciamo logout e procediamo
      // (questo caso è raro, ma può succedere se l'utente è stato verificato immediatamente)
      await supabase.auth.signOut()
    }
    
    // Verifica aggiuntiva: controlla se l'utente è verificato
    // Se un utente è verificato immediatamente dopo la registrazione, probabilmente esisteva già
    if (authData.user.email_confirmed_at && secondsSinceCreation > 0.5) {
      // L'utente è verificato e non è appena stato creato - probabilmente esisteva già
      setError('Questa email è già registrata. Accedi se hai già un account, oppure usa un\'altra email.')
      setLoading(false)
      setAttempts(prev => prev + 1)
      return
    }

    // IMPORTANTE: Verifica se c'è una session nella risposta di signUp
    // Se Supabase restituisce una session, significa che l'utente è già autenticato
    if (authData?.session) {
      // C'è una session nella risposta - l'utente esisteva già e la password è corretta
      setError('Questa email è già registrata. Accedi se hai già un account, oppure usa un\'altra email.')
      setLoading(false)
      setAttempts(prev => prev + 1)
      // Fai logout per non autenticare l'utente esistente
      await supabase.auth.signOut()
      return
    }

    // Reset tentativi su successo
    setAttempts(0)

    // Il profilo viene creato automaticamente dal trigger database
    // Aspettiamo che il trigger abbia finito (aumentato a 1 secondo per sicurezza)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Verifica che il profilo sia stato creato correttamente dal trigger
    // Proviamo più volte in caso di ritardo del trigger
    let profile = null
    let profileCheckError = null
    
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', authData.user.id)
        .maybeSingle()

      if (data && !error) {
        profile = data
        break
      }
      
      if (error && error.code !== 'PGRST116' && error.code !== '406' && error.code !== '42501') {
        // Se è un errore diverso da "non trovato" o errori di formato/auth, salvalo
        profileCheckError = error
      }
      
      // Se non trovato, aspetta un po' e riprova
      if (attempt < 2) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    // Se il profilo non esiste ancora dopo i tentativi, NON proviamo a crearlo manualmente
    // Le policy RLS impediscono la creazione manuale (solo il trigger SQL può farlo)
    // Il profilo verrà creato:
    // 1. Dal trigger SQL quando l'utente accede per la prima volta
    // 2. Quando l'utente verifica la sua email
    // 3. Al prossimo accesso se il trigger non è ancora stato eseguito
    
    if (!profile) {
      console.warn('Profile not found after registration, but trigger may create it later')
      // Non mostriamo errore all'utente - il trigger SQL creerà il profilo
      // L'utente può procedere e il profilo verrà creato automaticamente
    }

    // Procedi comunque - il trigger SQL creerà il profilo automaticamente
    // Anche se non viene trovato subito, verrà creato quando l'utente accede
    router.push('/')
  }

  return (
    <>
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-8 md:py-16 relative z-10">
        <div className="bg-white dark:bg-primary-gray-medium backdrop-blur-sm rounded-2xl-large shadow-soft-lg p-6 md:p-10" style={{ border: '2px solid #1C1C1C' }}>
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: titleTextColor }}>Registrati</h1>
            <p className="text-sm md:text-base text-primary-gray-medium dark:text-primary-gray-light">Crea il tuo account Guess the Length</p>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-primary-gray-dark dark:text-primary-gray-light mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={5}
                className="w-full px-4 py-3 border-2 border-primary-gray-light dark:border-primary-gray-medium rounded-xl-large focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow transition-all bg-white dark:bg-primary-gray-dark text-primary-gray-dark dark:text-primary-gray-light placeholder:text-primary-gray-medium/50 dark:placeholder:text-primary-gray-light/50"
                placeholder="Il tuo username"
              />
              <p className="mt-1 text-xs text-primary-gray-medium dark:text-primary-gray-light">Minimo 5 caratteri (obbligatorio)</p>
            </div>

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
                minLength={8}
                className="w-full px-4 py-3 border-2 border-primary-gray-light dark:border-primary-gray-medium rounded-xl-large focus:ring-2 focus:ring-primary-yellow focus:border-primary-yellow transition-all bg-white dark:bg-primary-gray-dark text-primary-gray-dark dark:text-primary-gray-light placeholder:text-primary-gray-medium/50 dark:placeholder:text-primary-gray-light/50"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-primary-gray-medium dark:text-primary-gray-light">Minimo 8 caratteri</p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl-large text-sm">
                <div className="flex flex-col gap-2">
                  <div>{error}</div>
                  {(error.includes('già registrata') || error.includes('già in uso')) && (
                    <Link href="/login" className="text-red-800 dark:text-red-300 hover:underline font-semibold text-sm">
                      → Vai alla pagina di accesso
                    </Link>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 text-base md:text-lg font-bold bg-gradient-to-r from-primary-yellow to-primary-yellow-dark rounded-xl-large hover:shadow-yellow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-soft-lg transform hover:scale-[1.02] active:scale-[0.98]"
              style={{ color: buttonTextColor }}
            >
              {loading ? 'Registrazione in corso...' : 'Registrati'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm md:text-base text-primary-gray-medium dark:text-primary-gray-light">
            Hai già un account?{' '}
            <Link href="/login" className="text-primary-gray-dark dark:text-primary-yellow hover:opacity-80 dark:hover:text-primary-yellow-dark font-bold transition-colors">
              Accedi
            </Link>
          </p>
        </div>
      </main>
    </>
  )
}

