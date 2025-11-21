'use client'

import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)
  const [imageVersion, setImageVersion] = useState(() => Date.now())

  useEffect(() => {
    setMounted(true)
    // Controlla se c'è un tema salvato o usa la preferenza del sistema
    const savedTheme = localStorage.getItem('guess-the-length-theme') as Theme | null
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initialTheme = savedTheme || systemTheme
    setTheme(initialTheme)
    applyTheme(initialTheme)
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    // Usa un timestamp per forzare il reload delle immagini
    setImageVersion(Date.now())
    localStorage.setItem('guess-the-length-theme', newTheme)
    applyTheme(newTheme)
    // Forza un re-render immediato
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('themechange'))
      // Forza un secondo evento dopo un breve delay per essere sicuri
      setTimeout(() => {
        window.dispatchEvent(new Event('themechange'))
      }, 50)
    }
  }

  // Aggiorna imageVersion quando cambia il tema
  useEffect(() => {
    if (mounted) {
      setImageVersion(Date.now())
    }
  }, [theme, mounted])

  // Listener per l'evento themechange per forzare aggiornamento immagini
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleThemeChange = () => {
        setImageVersion(Date.now())
      }
      window.addEventListener('themechange', handleThemeChange)
      return () => {
        window.removeEventListener('themechange', handleThemeChange)
      }
    }
  }, [])

  return { theme, toggleTheme, mounted, imageVersion }
}

