'use client'

import { usePathname } from 'next/navigation'

export function Footer() {
  // Durante la partita il footer distrae: lo togliamo
  if (usePathname() === '/play') return null

  return (
    <footer className="mt-auto border-t border-riga">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-6 text-sm text-grafite sm:flex-row sm:items-center sm:justify-between">
        <p>
          Problemi o bug?
          <a
            href="https://github.com/chrii13/Guess-The-Length/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-linea btn-piccolo ml-3"
          >
            Segnala su GitHub
          </a>
        </p>
        <p>© {new Date().getFullYear()} Guess the Length. Tutti i diritti riservati</p>
      </div>
    </footer>
  )
}
