'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Meter } from '@/components/Meter'
import { cmToPixels } from '@/lib/game'

export default function Home() {
  // Il metro parte chiuso e si srotola una volta al caricamento
  const [meterLength, setMeterLength] = useState(24)

  useEffect(() => {
    setMeterLength(cmToPixels(5))
  }, [])

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 pb-16 pt-10 md:pt-20">
        <h1 className="cifre entra text-[clamp(3.4rem,14vw,7.5rem)]">
          Quanto sono lunghi 7,40 cm?
        </h1>

        <div className="-mx-5 mt-8 md:mx-0">
          <Meter length={meterLength} onLengthChange={setMeterLength} maxLength={cmToPixels(15)} />
        </div>
        <p className="mt-1 text-sm text-grafite">Trascina il gancio e prova a occhio.</p>

        <p className="mt-10 max-w-[44ch] text-lg leading-relaxed">
          In ogni partita ci sono tre lunghezze da indovinare, con due tentativi ciascuna.
          Niente righello: vince chi sbaglia meno.
        </p>
        <Link href="/play" className="btn btn-nastro mt-8 w-full sm:w-auto sm:px-14">
          Gioca
        </Link>
      </main>
    </>
  )
}
