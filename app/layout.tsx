import type { Metadata, Viewport } from 'next'
import { Anton, Archivo } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { Footer } from '@/components/Footer'
import { PWARegister } from '@/components/PWARegister'

const display = Anton({ subsets: ['latin'], weight: '400', variable: '--font-display' })
const corpo = Archivo({ subsets: ['latin'], variable: '--font-corpo' })

export const metadata: Metadata = {
  title: 'Guess the Length - Indovina la Lunghezza',
  description: 'Gioco interattivo: allunga il metro per indovinare la lunghezza esatta! Diventa il maestro delle misurazioni.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Guess the Length',
  appleWebApp: {
    capable: true,
    title: 'Guess the Length',
    statusBarStyle: 'black',
  },
  icons: {
    icon: [{ url: '/assets/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/assets/icon.svg', type: 'image/svg+xml' }],
  },
}

export const viewport: Viewport = {
  themeColor: '#24211D',
  colorScheme: 'dark',
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
    <html lang="it" className={`${display.variable} ${corpo.variable} h-full`}>
      <body className="min-h-screen flex flex-col">
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

