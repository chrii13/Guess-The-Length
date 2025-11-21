'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from './AuthProvider'
import { getUserProfile, getOrCreateUserProfile } from '@/lib/profile'
import { HamburgerMenu } from './HamburgerMenu'
import { useTheme } from '@/hooks/useTheme'
import { Mascot } from './Mascot'
import { sanitizeString } from '@/lib/sanitize'

export function Navbar() {
  const { user, loading } = useAuth()
  const [username, setUsername] = useState<string | null>(null)
  const { theme, mounted: themeMounted, imageVersion } = useTheme()

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
    <nav className="bg-primary-yellow backdrop-blur-sm shadow-soft border-b border-primary-gray-light sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 md:h-20">
          <div className="flex items-center space-x-4 md:space-x-8">
            <Link href="/" className="flex items-center space-x-1 md:space-x-1.5 group">
              <div className="relative w-[80px] h-[92px] md:w-[115px] md:h-[138px] flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 bg-transparent dark:bg-transparent overflow-visible">
                <Mascot className="w-full h-full pointer-events-none object-contain" />
              </div>
              <span className="text-lg md:text-xl lg:text-2xl font-bold bg-gradient-to-r from-primary-gray-dark via-primary-yellow-dark to-primary-gray-dark bg-clip-text text-transparent">
                Guess the Length
              </span>
            </Link>
            {user && (
              <>
                <Link 
                  href="/result" 
                  className="hidden sm:flex items-center text-base md:text-lg hover:text-primary-yellow-dark font-bold transition-colors group"
                  style={{ color: '#1C1C1C' }}
                >
                  <Image
                    key={`chart-${theme}-${imageVersion}`}
                    src={`${themeMounted && theme === 'dark' ? "/assets/icons/chart-dark.svg" : "/assets/icons/chart.svg"}?v=${theme}-${imageVersion}`}
                    alt="Resoconto"
                    width={95}
                    height={95}
                    className="w-[82px] h-[82px] md:w-[95px] md:h-[95px] pointer-events-none -mr-2 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: 'transparent', background: 'transparent', display: 'block', filter: 'brightness(0)' }}
                    unoptimized
                  />
                  <span>Resoconto</span>
                </Link>
                <Link 
                  href="/leaderboard" 
                  className="hidden sm:flex items-center space-x-2 text-base md:text-lg hover:text-primary-yellow-dark font-bold transition-colors group"
                  style={{ color: '#1C1C1C' }}
                >
                  <Image
                    key={`trophy-${imageVersion}`}
                    src={`/assets/icons/trophy.svg?v=${imageVersion}`}
                    alt="Classifica"
                    width={56}
                    height={56}
                    className="w-12 h-12 md:w-14 md:h-14 pointer-events-none group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: 'transparent', background: 'transparent', display: 'block' }}
                    unoptimized
                  />
                  <span>Classifica</span>
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            {loading ? (
              <div className="flex items-center space-x-2 text-primary-gray-dark text-xs md:text-sm">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Caricamento...</span>
              </div>
            ) : user ? (
              <>
                <span className="text-sm md:text-base hidden lg:block" style={{ color: '#1C1C1C' }}>
                  Ciao, <span className="font-semibold" style={{ color: '#1C1C1C' }}>{sanitizeString(username || user.email?.split('@')[0] || 'Utente')}</span>
                </span>
                <HamburgerMenu />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm border-2 rounded-xl-large hover:bg-primary-yellow/10 font-medium transition-all shadow-soft hover:shadow-soft-lg"
                  style={{ borderColor: '#1C1C1C', color: '#1C1C1C' }}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm bg-gradient-to-r from-primary-yellow to-primary-yellow-dark rounded-xl-large hover:shadow-yellow-glow-lg font-medium transition-all shadow-soft-lg transform hover:scale-105 active:scale-95"
                  style={{ border: '2px solid #1C1C1C', color: '#1C1C1C' }}
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

