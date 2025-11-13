'use client'

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Problemi o bug? Contattaci:{' '}
            <a 
              href="mailto:christianpetrone5775@gmail.com" 
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              christianpetrone5775@gmail.com
            </a>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            © {new Date().getFullYear()} Meter Game - Tutti i diritti riservati
          </p>
        </div>
      </div>
    </footer>
  )
}

