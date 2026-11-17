'use client'

import { useEffect } from 'react'

export function PWARegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !window.isSecureContext) {
      return
    }

    // In sviluppo i file JavaScript cambiano a ogni modifica ma tengono lo stesso nome:
    // il service worker servirebbe versioni vecchie dalla cache, quindi lo togliamo
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then((registrazioni) => {
        registrazioni.forEach((registrazione) => registrazione.unregister())
      })
      return
    }

    const registerServiceWorker = () => {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.warn('Service worker registration failed:', error)
      })
    }

    if (document.readyState === 'complete') {
      registerServiceWorker()
      return
    }

    window.addEventListener('load', registerServiceWorker, { once: true })

    return () => {
      window.removeEventListener('load', registerServiceWorker)
    }
  }, [])

  return null
}
