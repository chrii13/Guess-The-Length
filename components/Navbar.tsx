'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { getUserProfile, getOrCreateUserProfile } from '@/lib/profile'
import { HamburgerMenu } from './HamburgerMenu'
import { sanitizeString } from '@/lib/sanitize'

export function Navbar() {
  const { user, loading } = useAuth()
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

  return (
    <nav className="sticky top-0 z-50 border-b border-riga bg-carta">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-5">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-2 font-bold">
            <svg viewBox="0 0 20 20" className="h-5 w-5 rounded-[3px]" aria-hidden="true">
              <rect width="20" height="20" fill="rgb(var(--nastro))" />
              <path d="M5 0v6M8.5 0v10M12 0v5M15 0v12" stroke="rgb(var(--pece))" strokeWidth="1.3" />
            </svg>
            Guess the Length
          </Link>
          {user && (
            <div className="hidden items-center gap-5 text-sm font-semibold text-grafite sm:flex">
              <Link href="/result" className="hover:text-inchiostro">Resoconto</Link>
              <Link href="/leaderboard" className="hover:text-inchiostro">Classifica</Link>
            </div>
          )}
        </div>

        <div className="flex min-w-0 items-center gap-3">
          {loading ? (
            <div className="caricamento" role="status" aria-label="Caricamento" />
          ) : user ? (
            <>
              <span className="hidden max-w-[16ch] truncate text-sm text-grafite lg:block">
                Ciao, <span className="font-semibold text-inchiostro">{sanitizeString(username || user.email?.split('@')[0] || 'Utente')}</span>
              </span>
              <HamburgerMenu />
            </>
          ) : (
            <>
              <Link href="/login" className="px-2 py-2 text-sm font-semibold hover:underline">
                Accedi
              </Link>
              <Link href="/register" className="btn btn-inchiostro px-4 py-2 text-sm">
                Registrati
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
