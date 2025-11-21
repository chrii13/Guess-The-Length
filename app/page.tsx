'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/Navbar'
import { useTheme } from '@/hooks/useTheme'

export default function Home() {
  const { theme, mounted: themeMounted, imageVersion } = useTheme()
  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16 overflow-visible">
          <div className="inline-flex items-center justify-center mb-6 animate-float">
            <div className="relative w-[125px] h-[125px] md:w-[166px] md:h-[166px] flex items-center justify-center transform hover:scale-110 transition-all duration-300 bg-transparent dark:bg-transparent">
              <Image
                key={`logo-${theme}-${imageVersion}`}
                src={`${themeMounted && theme === 'dark' ? "/assets/logo-dark.svg" : "/assets/logo.svg"}?v=${theme}-${imageVersion}`}
                alt="Guess the Length Logo"
                width={166}
                height={166}
                className="w-full h-full pointer-events-none"
                style={{ backgroundColor: 'transparent', background: 'transparent', display: 'block' }}
                unoptimized
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-primary-gray-dark via-primary-yellow-dark to-primary-gray-dark bg-clip-text text-transparent overflow-visible" style={{ lineHeight: '1.25', paddingBottom: '0.35rem' }}>
            Guess the Length
          </h1>
          <p className="text-lg md:text-xl text-primary-gray-medium mb-4 max-w-2xl mx-auto font-medium">
            Allunga il metro per indovinare la lunghezza esatta!
          </p>
          <p className="text-base md:text-lg text-primary-gray-medium dark:text-primary-gray-light mb-8 max-w-2xl mx-auto">
            In ogni partita verranno fornite 3 lunghezze casuali da indovinare. 
            <br className="hidden sm:block" />
            Hai 2 tentativi per ogni lunghezza. Il tuo obiettivo è sbagliare il meno possibile!
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-10">
          <div className="bg-primary-yellow dark:bg-primary-yellow backdrop-blur-sm rounded-2xl-large p-6 md:p-8 shadow-soft-lg hover:shadow-soft-lg-lg transition-all transform hover:-translate-y-2 hover:scale-[1.02] border border-primary-gray-light dark:border-primary-gray-medium group">
            <div className="w-[90px] h-[90px] md:w-[108px] md:h-[108px] mx-auto mb-4 flex items-center justify-center bg-transparent dark:bg-transparent">
              <Image
                key={`precision-${theme}-${imageVersion}`}
                src={`${themeMounted && theme === 'dark' ? "/assets/icons/precision-dark.svg" : "/assets/icons/precision.svg"}?v=${theme}-${imageVersion}`}
                alt="Precisione"
                width={108}
                height={108}
                className="w-full h-full pulse-scale pointer-events-none"
                style={{ backgroundColor: 'transparent', background: 'transparent', display: 'block' }}
                unoptimized
              />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 text-center" style={{ color: '#1C1C1C' }}>Precisione</h3>
            <p className="text-sm md:text-base text-center" style={{ color: '#1C1C1C' }}>
              Testa la tua capacità di stimare lunghezze con precisione
            </p>
          </div>
          
          <div className="bg-primary-yellow dark:bg-primary-yellow backdrop-blur-sm rounded-2xl-large p-6 md:p-8 shadow-soft-lg hover:shadow-soft-lg-lg transition-all transform hover:-translate-y-2 hover:scale-[1.02] border border-primary-gray-light dark:border-primary-gray-medium group">
            <div className="w-[60px] h-[90px] md:w-[72px] md:h-[108px] mx-auto mb-4 flex items-center justify-center bg-transparent dark:bg-transparent">
              <Image
                key={`competition-${theme}-${imageVersion}`}
                src={`${themeMounted && theme === 'dark' ? "/assets/icons/competition-dark.svg" : "/assets/icons/competition.svg"}?v=${theme}-${imageVersion}`}
                alt="Competizione"
                width={72}
                height={108}
                className="w-full h-full pulse-scale pointer-events-none"
                style={{ backgroundColor: 'transparent', background: 'transparent', display: 'block' }}
                unoptimized
              />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 text-center" style={{ color: '#1C1C1C' }}>Competizione</h3>
            <p className="text-sm md:text-base text-center" style={{ color: '#1C1C1C' }}>
              Sali in classifica e diventa il maestro delle misurazioni
            </p>
          </div>
          
          <div className="bg-primary-yellow dark:bg-primary-yellow backdrop-blur-sm rounded-2xl-large p-6 md:p-8 shadow-soft-lg hover:shadow-soft-lg-lg transition-all transform hover:-translate-y-2 hover:scale-[1.02] border border-primary-gray-light dark:border-primary-gray-medium group">
            <div className="w-[60px] h-[90px] md:w-[72px] md:h-[108px] mx-auto mb-4 flex items-center justify-center bg-transparent dark:bg-transparent">
              <Image
                key={`fun-${theme}-${imageVersion}`}
                src={`${themeMounted && theme === 'dark' ? "/assets/icons/fun-dark.svg" : "/assets/icons/fun.svg"}?v=${theme}-${imageVersion}`}
                alt="Divertimento"
                width={72}
                height={108}
                className="w-full h-full pulse-scale pointer-events-none"
                style={{ backgroundColor: 'transparent', background: 'transparent', display: 'block' }}
                unoptimized
              />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 text-center" style={{ color: '#1C1C1C' }}>Divertimento</h3>
            <p className="text-sm md:text-base text-center" style={{ color: '#1C1C1C' }}>
              Gioco semplice e coinvolgente per tutte le età
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex justify-center items-center">
          <Link
            href="/play"
            className="group w-full sm:w-auto px-10 md:px-14 py-5 md:py-6 text-lg md:text-xl font-bold bg-gradient-to-r from-primary-yellow to-primary-yellow-dark rounded-2xl-large hover:shadow-yellow-glow-lg transition-all shadow-soft-lg transform hover:scale-105 active:scale-95 text-center flex items-center justify-center min-w-[240px] md:min-w-[280px]"
            style={{ color: '#1C1C1C' }}
          >
            <span>Gioca Ora</span>
          </Link>
        </div>
      </main>
    </>
  )
}

