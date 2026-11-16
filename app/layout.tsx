import type { Metadata, Viewport } from 'next'
import { Archivo } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { Footer } from '@/components/Footer'
import { PWARegister } from '@/components/PWARegister'

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo' })

// Applica il tema salvato prima del primo paint, per evitare il lampo chiaro
const themeScript = `try{var t=localStorage.getItem('guess-the-length-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`

export const metadata: Metadata = {
  title: 'Guess the Length - Indovina la Lunghezza',
  description: 'Gioco interattivo: allunga il metro per indovinare la lunghezza esatta! Diventa il maestro delle misurazioni.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Guess the Length',
  appleWebApp: {
    capable: true,
    title: 'Guess the Length',
    statusBarStyle: 'default',
  },
  icons: {
    icon: [{ url: '/assets/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/assets/icon.svg', type: 'image/svg+xml' }],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ECEEEA' },
    { media: '(prefers-color-scheme: dark)', color: '#17191B' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it" className={`${archivo.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <PWARegister />
        <AuthProvider>
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}

