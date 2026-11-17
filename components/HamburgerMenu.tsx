'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { supabase } from '@/lib/supabase'

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const apriRef = useRef<HTMLButtonElement>(null)
  const pannelloRef = useRef<HTMLElement>(null)

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

    // Tastiera: Esc chiude, Tab resta dentro il menu
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        return
      }
      if (event.key !== 'Tab' || !pannelloRef.current) return
      const focusabili = pannelloRef.current.querySelectorAll<HTMLElement>('button, a[href]')
      const primo = focusabili[0]
      const ultimo = focusabili[focusabili.length - 1]
      if (event.shiftKey && document.activeElement === primo) {
        event.preventDefault()
        ultimo.focus()
      } else if (!event.shiftKey && document.activeElement === ultimo) {
        event.preventDefault()
        primo.focus()
      }
    }

    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    // All'apertura il focus entra nel menu; alla chiusura torna al bottone che l'ha aperto
    pannelloRef.current?.querySelector<HTMLElement>('button')?.focus()
    const apri = apriRef.current

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      apri?.focus()
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

  const icona = (aperto: boolean) => (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="square" strokeWidth={2} d={aperto ? 'M6 18L18 6M6 6l12 12' : 'M4 7h16M4 12h16M4 17h16'} />
    </svg>
  )

  if (!mounted) {
    return (
      <button className="-mr-2.5 p-2.5" aria-label="Menu" type="button" disabled>
        {icona(false)}
      </button>
    )
  }

  const voce = 'block w-full border-b border-riga py-4 text-left text-lg font-semibold hover:pl-2 transition-[padding] duration-150'

  const menuContent = isOpen ? (
    <>
      {/* Overlay */}
      <div
        className="dissolvi fixed inset-0 z-[9998] bg-pece/50"
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar menu: renderizzato direttamente nel body tramite portal */}
      <aside
        ref={pannelloRef}
        data-menu-container
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="da-destra fixed bottom-0 right-0 top-0 z-[9999] flex w-full flex-col bg-foglio text-inchiostro sm:w-[320px] sm:border-l sm:border-riga"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-riga px-5">
          <h2 className="font-bold">Menu</h2>
          <button onClick={() => setIsOpen(false)} className="-mr-2.5 p-2.5" aria-label="Chiudi menu">
            {icona(true)}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5" style={{ minHeight: 0 }}>
          {user && (
            <>
              <button onClick={handleLeaderboard} className={voce}>Classifica</button>
              <button onClick={handleResult} className={voce}>Resoconto</button>
              <button onClick={handleProfile} className={voce}>Profilo</button>
            </>
          )}
        </div>

        {user && (
          <div className="flex-shrink-0 border-t border-riga px-5 py-4">
            <button onClick={handleLogout} className="font-semibold text-errore hover:underline">
              Esci
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
        ref={apriRef}
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="-mr-2.5 p-2.5"
        aria-label="Menu"
        type="button"
        aria-expanded={isOpen}
      >
        {icona(isOpen)}
      </button>

      {/* Renderizza il menu direttamente nel body usando Portal */}
      {mounted && typeof document !== 'undefined' && createPortal(menuContent, document.body)}
    </>
  )
}
