'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { getUserProfile, getOrCreateUserProfile } from '@/lib/profile'

export function Navbar() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      // Carica l'username dal profilo
      getUserProfile(user.id).then((profile) => {
        if (profile) {
          setUsername(profile.username)
        } else {
          // Se non esiste il profilo, prova a crearlo
          getOrCreateUserProfile(user.id, user.email || '').then((name) => {
            setUsername(name)
          })
        }
      })
    }
  }, [user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-indigo-600 hover:text-indigo-800">
              📏 Meter Game
            </Link>
            {user && (
              <Link href="/result" className="text-gray-700 hover:text-indigo-600">
                Resoconto
              </Link>
            )}
            <Link href="/leaderboard" className="text-gray-700 hover:text-indigo-600">
              Classifica
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {loading ? (
              <span className="text-gray-500 text-sm">Caricamento...</span>
            ) : user ? (
              <>
                <span className="text-gray-700 text-sm">
                  Ciao, <span className="font-semibold">{username || user.email?.split('@')[0] || 'Utente'}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs text-white bg-red-500 rounded-lg hover:bg-red-600"
                >
                  Esci
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  Registrati
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

