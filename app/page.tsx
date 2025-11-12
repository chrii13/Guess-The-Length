import Link from 'next/link'
import { Navbar } from '@/components/Navbar'

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-6xl font-bold text-indigo-900 mb-4">
          📏 Meter Game
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Allunga il metro giallo per indovinare la lunghezza esatta!
        </p>
        <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
          Ogni partita ha 3 lunghezze casuali da indovinare. Hai 2 tentativi per ogni lunghezza.
          Il tuo obiettivo è ottenere il punteggio più basso possibile!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/play"
            className="px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-lg transform hover:scale-105 transition"
          >
            🎮 Gioca Ora
          </Link>
          <Link
            href="/leaderboard"
            className="px-8 py-4 text-lg font-semibold text-indigo-600 bg-white border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 shadow-lg transform hover:scale-105 transition"
          >
            🏆 Classifica
          </Link>
        </div>
      </main>
    </>
  )
}

