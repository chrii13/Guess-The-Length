'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Verifica che l'username sia stato inserito
    if (!username || username.trim().length < 5) {
      setError('Username obbligatorio (minimo 5 caratteri)')
      setLoading(false)
      return
    }

    // Registra l'utente con metadata che include l'username
    // Il trigger database creerà automaticamente il profilo
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.trim(),
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      // Il profilo viene creato automaticamente dal trigger database
      // Aspettiamo un attimo per assicurarci che il trigger abbia finito
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Se il profilo non esiste ancora, proviamo a crearlo manualmente
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          username: username.trim(),
        }, {
          onConflict: 'id'
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        // Non blocchiamo la registrazione, il trigger dovrebbe averlo creato
      }

      router.push('/')
    }
  }

  return (
    <>
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-indigo-900 mb-6 text-center">Registrati</h1>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Il tuo username"
              />
              <p className="mt-1 text-xs text-gray-500">Minimo 5 caratteri (obbligatorio)</p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="tua@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-500">Minimo 8 caratteri</p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? 'Registrazione in corso...' : 'Registrati'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Hai già un account?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-800 font-semibold">
              Accedi
            </Link>
          </p>
        </div>
      </main>
    </>
  )
}

