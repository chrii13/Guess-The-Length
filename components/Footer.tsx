'use client'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-riga">
      <div className="mx-auto flex max-w-5xl flex-col gap-1 px-5 py-6 text-sm text-grafite sm:flex-row sm:justify-between">
        <p>
          Problemi o bug? Scrivi a{' '}
          <a href="mailto:christianpetrone03@gmail.com" className="collegamento text-inchiostro">
            christianpetrone03@gmail.com
          </a>
        </p>
        <p>© {new Date().getFullYear()} Guess the Length. Tutti i diritti riservati</p>
      </div>
    </footer>
  )
}
