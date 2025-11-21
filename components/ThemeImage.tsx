'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from '@/hooks/useTheme'

interface ThemeImageProps {
  srcLight: string
  srcDark: string
  alt: string
  className?: string
  style?: React.CSSProperties
}

export function ThemeImage({ srcLight, srcDark, alt, className, style }: ThemeImageProps) {
  const { theme, mounted: themeMounted, imageVersion } = useTheme()
  const [imageKey, setImageKey] = useState(0)
  const imgRef = useRef<HTMLImageElement>(null)
  const [isVisible, setIsVisible] = useState(true)

  // Aggiorna quando cambia il tema o imageVersion
  useEffect(() => {
    if (themeMounted) {
      // Forza reload: rimuovi temporaneamente l'immagine
      setIsVisible(false)
      setImageKey(prev => prev + 1)
      
      // Re-aggiungi l'immagine con il nuovo src dopo un breve delay
      setTimeout(() => {
        setIsVisible(true)
      }, 0)
    }
  }, [theme, themeMounted, imageVersion])

  // Listener per l'evento themechange globale
  useEffect(() => {
    const handleThemeChange = () => {
      // Forza reload aggressivo
      setIsVisible(false)
      setImageKey(prev => prev + 1)
      
      setTimeout(() => {
        setIsVisible(true)
        if (imgRef.current) {
          const img = imgRef.current
          const baseSrc = theme === 'dark' ? srcDark : srcLight
          const newSrc = `${baseSrc}?v=${Date.now()}-${imageVersion}-retry`
          img.src = ''
          // Usa requestAnimationFrame per essere sicuri che il browser processi il cambio
          requestAnimationFrame(() => {
            if (img) {
              img.src = newSrc
            }
          })
        }
      }, 0)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('themechange', handleThemeChange)
      return () => {
        window.removeEventListener('themechange', handleThemeChange)
      }
    }
  }, [theme, imageVersion, srcLight, srcDark])

  if (!themeMounted) {
    return null
  }

  // Calcola l'URL basato sul tema corrente
  const baseSrc = theme === 'dark' ? srcDark : srcLight
  const imageSrc = `${baseSrc}?v=${Date.now()}-${imageVersion}-${imageKey}`

  if (!isVisible) {
    return (
      <span 
        className={className} 
        style={{ ...style, display: 'inline-block', width: style?.width || 'auto', height: style?.height || 'auto' }}
        aria-hidden="true"
      />
    )
  }

  // eslint-disable-next-line @next/next/no-img-element
  // Usiamo <img> invece di <Image /> perché abbiamo bisogno di ref personalizzato
  // e gestione complessa di onLoad/onError che Next.js Image non supporta direttamente
  return (
    <img
      ref={imgRef}
      key={`theme-image-${theme}-${imageVersion}-${imageKey}`}
      src={imageSrc}
      alt={alt}
      className={className}
      style={style}
      onLoad={() => {
        // Assicurati che l'immagine sia caricata correttamente
        if (imgRef.current) {
          imgRef.current.style.opacity = '1'
        }
      }}
      onError={(e) => {
        // In caso di errore, riprova con un nuovo timestamp
        const target = e.currentTarget
        const src = theme === 'dark' ? srcDark : srcLight
        target.src = `${src}?v=${Date.now()}-error-retry`
      }}
    />
  )
}

