'use client'

import { useEffect, useState } from 'react'
import DOMPurify from 'isomorphic-dompurify'

interface SvgLoaderProps {
  src: string
  alt: string
  className?: string
  fallback?: React.ReactNode
}

export function SvgLoader({ src, alt, className = '', fallback }: SvgLoaderProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const loadSvg = async () => {
      try {
        // Valida che src sia un URL relativo o assoluto sicuro
        if (!src || (src.startsWith('http') && !src.startsWith(window.location.origin))) {
          throw new Error('Invalid SVG source')
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 secondi timeout

        const response = await fetch(src, {
          signal: controller.signal,
          headers: {
            'Accept': 'image/svg+xml'
          }
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`Failed to load SVG: ${response.statusText}`)
        }

        // Verifica Content-Type
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('image/svg+xml')) {
          // Permetti anche text/plain o application/xml per compatibilità
          const allowedTypes = ['text/plain', 'application/xml', 'text/xml']
          if (!allowedTypes.some(type => contentType?.includes(type))) {
            throw new Error('Invalid content type')
          }
        }

        // Limita dimensione file (max 100KB)
        const contentLength = response.headers.get('content-length')
        if (contentLength && parseInt(contentLength) > 100000) {
          throw new Error('SVG file too large')
        }

        const svgText = await response.text()

        // Validazione base - deve essere un SVG valido
        if (!svgText.trim().startsWith('<svg')) {
          throw new Error('Invalid SVG format')
        }

        // Limita dimensione effettiva del contenuto
        if (svgText.length > 100000) {
          throw new Error('SVG content too large')
        }

        // Sanitizza l'SVG con DOMPurify
        const sanitizedSvg = DOMPurify.sanitize(svgText, {
          USE_PROFILES: { svg: true, svgFilters: true },
          ADD_TAGS: ['svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'g', 'defs', 'clipPath', 'mask', 'linearGradient', 'radialGradient', 'stop'],
          ADD_ATTR: ['viewBox', 'xmlns', 'xmlns:xlink', 'd', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'x', 'y', 'width', 'height', 'cx', 'cy', 'r', 'points', 'x1', 'y1', 'x2', 'y2', 'transform', 'opacity', 'class', 'style'],
          FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'link'],
          FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
        })

        // Verifica che dopo la sanitizzazione sia ancora un SVG valido
        if (!sanitizedSvg.trim().startsWith('<svg')) {
          throw new Error('SVG validation failed')
        }

        // Aggiungi le classi e stili per rimuovere sfondi bianchi
        const svgWithClass = sanitizedSvg.replace(
          /<svg([^>]*)>/,
          (match, attrs) => {
            // Rimuovi eventuali attributi di sfondo bianco
            let newAttrs = attrs
              .replace(/style="[^"]*"/g, '')
              .replace(/fill="white"/gi, '')
              .replace(/fill="#fff"/gi, '')
              .replace(/fill="#ffffff"/gi, '')
            
            // Aggiungi stile trasparente e classe
            const classAttr = className ? ` class="${className}"` : ''
            const styleAttr = ' style="background: transparent !important; background-color: transparent !important;"'
            
            return `<svg${newAttrs}${classAttr}${styleAttr} xmlns="http://www.w3.org/2000/svg">`
          }
        )

        setSvgContent(svgWithClass)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.error('SVG load timeout:', src)
        } else {
          console.error('Error loading SVG:', src, err)
        }
        setError(true)
      }
    }

    // Valida che src sia una stringa valida
    if (src && typeof src === 'string') {
      loadSvg()
    } else {
      setError(true)
    }
  }, [src, className])

  if (error) {
    return fallback || null
  }

  if (!svgContent) {
    return null
  }

  // Usa dangerouslySetInnerHTML solo dopo sanitizzazione con DOMPurify
  return (
    <div 
      className="bg-transparent dark:bg-transparent" 
      dangerouslySetInnerHTML={{ __html: svgContent }} 
      style={{ backgroundColor: 'transparent', background: 'transparent' }}
      aria-label={alt}
    />
  )
}

