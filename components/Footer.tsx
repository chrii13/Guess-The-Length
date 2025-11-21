'use client'

export function Footer() {
  return (
    <footer className="bg-white/90 dark:bg-primary-gray-dark/90 backdrop-blur-sm border-t border-primary-gray-light dark:border-primary-gray-medium mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="text-center">
          <p className="text-sm md:text-base text-primary-gray-medium dark:text-primary-gray-light">
            Problemi o bug? Contattaci:{' '}
            <a 
              href="mailto:christianpetrone03@gmail.com" 
              className="text-primary-yellow-dark dark:text-primary-yellow hover:text-primary-yellow dark:hover:text-primary-yellow-dark font-semibold transition-colors"
            >
              christianpetrone03@gmail.com
            </a>
          </p>
          <p className="text-xs md:text-sm text-primary-gray-medium dark:text-primary-gray-light mt-2 opacity-75">
            © {new Date().getFullYear()} Guess the Length - Tutti i diritti riservati
          </p>
        </div>
      </div>
    </footer>
  )
}

