'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/hooks/useTheme'

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [showThemeOptions, setShowThemeOptions] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const { theme, toggleTheme, mounted: themeMounted, imageVersion } = useTheme()

  // Assicurati che il componente sia montato (per SSR)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Chiudi il menu quando si clicca fuori
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-menu-container]')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsOpen(false)
    router.push('/')
  }

  const handleProfile = () => {
    setIsOpen(false)
    router.push('/profile')
  }

  const handleLeaderboard = () => {
    setIsOpen(false)
    router.push('/leaderboard')
  }

  const handleResult = () => {
    setIsOpen(false)
    router.push('/result')
  }

  if (!mounted || !themeMounted) {
    return (
      <button
        className="p-2 md:p-3 rounded-xl-large hover:bg-primary-gray-light dark:hover:bg-primary-gray-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-yellow border-2 border-primary-gray-light dark:border-primary-gray-medium hover:border-primary-yellow dark:hover:border-primary-yellow-dark shadow-soft hover:shadow-soft-lg"
        aria-label="Menu"
        type="button"
        disabled
      >
        <svg
          className="w-6 h-6 md:w-7 md:h-7"
          fill="none"
          stroke="#1C1C1C"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          style={{ color: '#1C1C1C' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    )
  }

  const menuContent = isOpen ? (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-primary-gray-dark/50 dark:bg-black/70 backdrop-blur-sm z-[9998]"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Sidebar menu: renderizzato direttamente nel body tramite portal */}
      <aside
        data-menu-container
        className="fixed top-0 bottom-0 right-0 w-full max-w-[100vw] md:w-[260px] md:max-w-[90vw] bg-primary-yellow dark:bg-primary-gray-dark shadow-soft-lg-lg z-[9999] transition-transform duration-300 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
            {/* Header: titolo + X */}
            <div className="flex items-center justify-between p-4 border-b border-primary-gray-light dark:border-primary-gray-medium flex-shrink-0">
              <h2 className="text-lg font-bold text-primary-gray-dark dark:text-primary-gray-light">Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl-large hover:bg-primary-gray-light dark:hover:bg-primary-gray-medium transition-colors"
                aria-label="Chiudi menu"
              >
                <svg className="w-6 h-6 text-primary-gray-dark dark:text-primary-gray-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Menu vero e proprio: scrollabile, occupa tutto lo spazio rimanente */}
            <div className="flex-1 overflow-y-auto p-4 pb-20" style={{ minHeight: 0 }}>
              {/* Cambio tema */}
              <div className="mb-4">
                <button
                  onClick={() => setShowThemeOptions(!showThemeOptions)}
                  className="w-full flex items-center justify-between p-3 rounded-xl-large hover:bg-primary-gray-light dark:hover:bg-primary-gray-medium transition-colors group"
                >
                  <span className="font-semibold text-primary-gray-dark dark:text-primary-gray-light text-left">Tema</span>
                  <svg
                    className={`w-5 h-5 text-primary-gray-medium dark:text-primary-gray-light transition-transform ${showThemeOptions ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showThemeOptions && (
                  <div className="mt-2 bg-primary-gray-light dark:bg-primary-gray-medium rounded-xl-large p-3 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        if (theme !== 'light') toggleTheme();
                        setShowThemeOptions(false);
                      }}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${theme==='light'?'bg-primary-yellow/20 dark:bg-primary-yellow-dark/20 border-2 border-primary-yellow dark:border-primary-yellow-dark':'hover:bg-white/50 dark:hover:bg-primary-gray-dark/50'}`}
                    >
                      <span className="font-medium text-primary-gray-dark dark:text-primary-gray-light">Chiaro</span>
                      {theme==='light' && <svg className="w-5 h-5 text-primary-yellow-dark" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                    </button>
                    <button
                      onClick={() => {
                        if (theme !== 'dark') toggleTheme();
                        setShowThemeOptions(false);
                      }}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${theme==='dark'?'bg-primary-yellow/20 dark:bg-primary-yellow-dark/20 border-2 border-primary-yellow dark:border-primary-yellow-dark':'hover:bg-white/50 dark:hover:bg-primary-gray-dark/50'}`}
                    >
                      <span className="font-medium text-primary-gray-dark dark:text-primary-gray-light">Scuro</span>
                      {theme==='dark' && <svg className="w-5 h-5 text-primary-yellow-dark dark:text-primary-yellow" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                    </button>
                  </div>
                )}
              </div>
              {/* Classifica */}
              {user && (
                <button
                  onClick={handleLeaderboard}
                  className="w-full flex items-center p-3 rounded-xl-large hover:bg-primary-gray-light dark:hover:bg-primary-gray-medium transition-colors group"
                >
                  <span className="font-semibold text-primary-gray-dark dark:text-primary-gray-light text-left">Classifica</span>
                </button>
              )}
              
              {/* Resoconto */}
              {user && (
                <button
                  onClick={handleResult}
                  className="w-full flex items-center p-3 rounded-xl-large hover:bg-primary-gray-light dark:hover:bg-primary-gray-medium transition-colors group"
                >
                  <span className="font-semibold text-primary-gray-dark dark:text-primary-gray-light text-left">Resoconto</span>
                </button>
              )}

              {/* Profilo */}
              {user && (
                <button
                  onClick={handleProfile}
                  className="w-full flex items-center p-3 rounded-xl-large hover:bg-primary-gray-light dark:hover:bg-primary-gray-medium transition-colors group"
                >
                  <span className="font-semibold text-primary-gray-dark dark:text-primary-gray-light text-left">Profilo</span>
                </button>
              )}
            </div>
            {/* Footer con Logout in basso a sinistra */}
            {user && (
              <div className="flex-shrink-0 p-4 border-t border-primary-gray-light dark:border-primary-gray-medium">
                <button
                  onClick={handleLogout}
                  className="font-semibold text-red-600 dark:text-red-400 hover:opacity-80 transition-opacity"
                >
                  Logout
                </button>
              </div>
            )}
        </aside>
    </>
  ) : null

  return (
    <>
      {/* Pulsante hamburger */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="p-2 md:p-3 rounded-xl-large hover:bg-primary-gray-light dark:hover:bg-primary-gray-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-yellow border-2 border-primary-gray-light dark:border-primary-gray-medium hover:border-primary-yellow dark:hover:border-primary-yellow-dark shadow-soft hover:shadow-soft-lg"
        aria-label="Menu"
        type="button"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg
            className="w-6 h-6 md:w-7 md:h-7 transition-transform duration-300"
            fill="none"
            stroke="#1C1C1C"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            style={{ color: '#1C1C1C' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg
            className="w-6 h-6 md:w-7 md:h-7 transition-transform duration-300"
            fill="none"
            stroke="#1C1C1C"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            style={{ color: '#1C1C1C' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Renderizza il menu direttamente nel body usando Portal */}
      {mounted && typeof document !== 'undefined' && createPortal(menuContent, document.body)}
    </>
  )
}

