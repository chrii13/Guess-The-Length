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
            {/* Logo Flessometro: la cassa tonda del metro con il nastro tirato fuori */}
            <svg viewBox="0 0 48 34" className="h-8 w-[45px] shrink-0" aria-hidden="true">
              <rect x="15" y="21" width="26" height="10" fill="rgb(var(--nastro))" stroke="rgb(var(--pece))" strokeWidth="2" />
              <path d="M24 21v4M30 21v6M36 21v4" stroke="rgb(var(--pece))" strokeWidth="1.5" />
              <rect x="39" y="17" width="6" height="16" rx="1" fill="rgb(var(--acciaio))" stroke="rgb(var(--pece))" strokeWidth="2" />
              <circle cx="16" cy="16" r="14" fill="rgb(var(--nastro))" stroke="rgb(var(--pece))" strokeWidth="2.5" />
              <circle cx="16" cy="16" r="7.5" fill="rgb(var(--pece))" />
              <circle cx="16" cy="16" r="2.8" fill="rgb(var(--nastro))" />
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
              {/* Su telefono un solo bottone, per non affollare la barra: la registrazione è nella pagina di accesso */}
              <Link href="/login" className="btn btn-inchiostro min-h-[44px] px-4 py-2 text-base sm:hidden">
                Accedi
              </Link>
              <Link href="/login" className="hidden min-h-[44px] items-center px-2 text-sm font-semibold hover:text-nastro sm:inline-flex">
                Accedi
              </Link>
              <Link href="/register" className="btn btn-inchiostro hidden min-h-[44px] px-4 py-2 text-sm sm:inline-flex">
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
