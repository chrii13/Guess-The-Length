'use client'

import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const { user, loading } = useAuth()
  const router = useRouter()

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
            <Link href="/leaderboard" className="text-gray-700 hover:text-indigo-600">
              Classifica
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {loading ? (
              <span className="text-gray-500">Caricamento...</span>
            ) : user ? (
              <>
                <span className="text-gray-700">Ciao, {user.email}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600"
                >
                  Logout
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

