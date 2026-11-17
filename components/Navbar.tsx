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
    <nav className="sticky top-0 z-50 bg-carta">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 font-display text-lg tracking-[0.03em] sm:text-xl">
            {/* Logo Flessometro: la cassa tonda del metro */}
            <svg viewBox="0 0 40 40" className="h-8 w-8" aria-hidden="true">
              <rect width="40" height="40" rx="3" fill="rgb(var(--nastro))" />
              <circle cx="20" cy="20" r="12" fill="rgb(var(--pece))" />
              <circle cx="20" cy="20" r="4.5" fill="rgb(var(--nastro))" />
            </svg>
            GUESS THE LENGTH
          </Link>
          {user && (
            <div className="hidden items-center gap-5 text-sm font-semibold text-grafite sm:flex">
              <Link href="/result" className="hover:text-inchiostro">Resoconto</Link>
              <Link href="/leaderboard" className="hover:text-inchiostro">Classifica</Link>
            </div>
          )}
        </div>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
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
              <Link href="/login" className="inline-flex min-h-[44px] items-center px-1 text-sm font-semibold hover:underline sm:px-2">
                Accedi
              </Link>
              <Link href="/register" className="btn btn-inchiostro min-h-[44px] px-3 py-2 text-xs sm:px-4 sm:text-sm">
                Registrati
              </Link>
            </>
          )}
        </div>
      </div>
      {/* Strisce gialle e nere sotto la barra */}
      <div className="strisce h-2" aria-hidden="true" />
    </nav>
  )
}
