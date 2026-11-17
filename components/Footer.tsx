'use client'

import Link from 'next/link'
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
            className="ml-2 font-semibold text-inchiostro hover:text-nastro"
          >
            Segnala su GitHub
          </a>
        </p>
        <p>
          © {new Date().getFullYear()} Guess the Length. Tutti i diritti riservati
          <Link href="/privacy" className="ml-3 font-semibold text-inchiostro hover:text-nastro">
            Privacy
          </Link>
        </p>
      </div>
    </footer>
  )
}
