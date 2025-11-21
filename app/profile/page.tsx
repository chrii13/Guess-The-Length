'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { useAuth } from '@/components/AuthProvider'
import { getUserProfile, updateUsername } from '@/lib/profile'
import { getUserBestScore, getUserRecentSessions } from '@/lib/scores'
import { formatLength } from '@/lib/game'
import { useTheme } from '@/hooks/useTheme'
import { sanitizeString } from '@/lib/sanitize'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { theme, mounted: themeMounted, imageVersion } = useTheme()
  const [username, setUsername] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [bestScore, setBestScore] = useState<number | null>(null)
  const [totalGames, setTotalGames] = useState<number>(0)
  const [loadingData, setLoadingData] = useState(true)
  const [editingUsername, setEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadUserData = useCallback(async () => {
    if (!user) return

    setLoadingData(true)
    try {
      // Carica profilo
      const profile = await getUserProfile(user.id)
      if (profile) {
        setUsername(profile.username)
        setNewUsername(profile.username)
      } else {
        setUsername(user.email?.split('@')[0] || 'Utente')
      }

      // Carica email
      setEmail(user.email || '')

      // Carica statistiche
      const [best, sessions] = await Promise.all([
        getUserBestScore(user.id),
        getUserRecentSessions(user.id),
      ])

      setBestScore(best)
      setTotalGames(sessions.length)
    } catch (err) {
      console.error('Error loading user data:', err)
    } finally {
      setLoadingData(false)
    }
  }, [user])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      loadUserData()
    }
  }, [user, loading, router, loadUserData])

  const handleSaveUsername = async () => {
    if (!user) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    const result = await updateUsername(user.id, newUsername)

    if (result.success) {
      setUsername(newUsername)
      setEditingUsername(false)
      setSuccess('Nome utente aggiornato con successo!')
      setTimeout(() => setSuccess(null), 3000)
    } else {
      setError(result.error || 'Errore durante l\'aggiornamento')
    }

    setSaving(false)
  }

  const handleCancelEdit = () => {
    setNewUsername(username)
    setEditingUsername(false)
    setError(null)
  }

  if (loading || loadingData) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 relative z-10">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-primary-yellow border-r-transparent"></div>
            <p className="mt-4 text-primary-gray-medium dark:text-primary-gray-light">Caricamento...</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 relative z-10">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-gray-dark via-primary-yellow-dark to-primary-gray-dark dark:from-primary-gray-light dark:via-primary-yellow dark:to-primary-gray-light bg-clip-text text-transparent">
            Profilo
          </h1>
          <p className="text-primary-gray-medium dark:text-primary-gray-light text-base md:text-lg">
            Gestisci le tue informazioni personali e visualizza le tue statistiche
          </p>
        </div>

        {/* Informazioni Profilo */}
        <div className="bg-white/90 dark:bg-primary-gray-medium backdrop-blur-sm rounded-2xl-large shadow-soft-lg overflow-hidden mb-6 md:mb-8 border border-primary-gray-light dark:border-primary-gray-medium">
          <div className="bg-gradient-to-r from-primary-yellow to-primary-yellow-dark text-primary-gray-dark dark:text-primary-gray-dark py-4 md:py-6 px-4 md:px-8">
            <h2 className="text-xl md:text-2xl font-bold text-center text-primary-gray-dark dark:text-primary-gray-dark">
              Informazioni Personali
            </h2>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Email (non modificabile) */}
            <div>
              <label className="block text-sm font-semibold text-primary-gray-dark dark:text-primary-gray-light mb-2">
                Email
              </label>
              <div className="w-full px-4 py-3 bg-primary-gray-light dark:bg-primary-gray-dark rounded-xl-large border border-primary-gray-light dark:border-primary-gray-medium text-primary-gray-dark dark:text-primary-gray-light">
                {sanitizeString(email || '')}
              </div>
              <p className="mt-1 text-xs text-primary-gray-medium dark:text-primary-gray-light">
                L&apos;email non può essere modificata
              </p>
            </div>

            {/* Username (modificabile) */}
            <div>
              <label className="block text-sm font-semibold text-primary-gray-dark dark:text-primary-gray-light mb-2">
                Nome Utente
              </label>
              {editingUsername ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-primary-gray-dark rounded-xl-large border-2 border-primary-yellow dark:border-primary-yellow-dark focus:outline-none focus:ring-2 focus:ring-primary-yellow dark:focus:ring-primary-yellow-dark text-primary-gray-dark dark:text-primary-gray-light"
                    placeholder="Inserisci un nuovo nome utente"
                    maxLength={30}
                  />
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl-large">
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  )}
                  {success && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl-large">
                      <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveUsername}
                      disabled={saving || newUsername.trim() === username || newUsername.trim().length < 3}
                      className="px-6 py-2 bg-gradient-to-r from-primary-yellow to-primary-yellow-dark text-primary-gray-dark font-semibold rounded-xl-large hover:shadow-yellow-glow-lg transition-all shadow-soft-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Salvataggio...' : 'Salva'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="px-6 py-2 bg-primary-gray-light dark:bg-primary-gray-dark text-primary-gray-dark dark:text-primary-gray-light font-semibold rounded-xl-large hover:bg-primary-gray-medium dark:hover:bg-primary-gray-medium transition-all border border-primary-gray-light dark:border-primary-gray-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Annulla
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex-1 px-4 py-3 bg-primary-gray-light dark:bg-primary-gray-dark rounded-xl-large border border-primary-gray-light dark:border-primary-gray-medium text-primary-gray-dark dark:text-primary-gray-light font-medium">
                    {sanitizeString(username || 'Utente')}
                  </div>
                  <button
                    onClick={() => setEditingUsername(true)}
                    className="px-4 py-3 bg-primary-yellow/10 dark:bg-primary-yellow-dark/10 text-primary-yellow-dark dark:text-primary-yellow font-semibold rounded-xl-large hover:bg-primary-yellow/20 dark:hover:bg-primary-yellow-dark/20 transition-all border border-primary-yellow dark:border-primary-yellow-dark"
                  >
                    Modifica
                  </button>
                </div>
              )}
              <p className="mt-1 text-xs text-primary-gray-medium dark:text-primary-gray-light">
                Minimo 3 caratteri, massimo 30 caratteri
              </p>
            </div>
          </div>
        </div>

        {/* Statistiche */}
        <div className="bg-white/90 dark:bg-primary-gray-medium backdrop-blur-sm rounded-2xl-large shadow-soft-lg overflow-hidden mb-6 md:mb-8 border border-primary-gray-light dark:border-primary-gray-medium">
          <div className="bg-gradient-to-r from-primary-yellow to-primary-yellow-dark text-primary-gray-dark dark:text-primary-gray-dark py-4 md:py-6 px-4 md:px-8">
            <h2 className="text-xl md:text-2xl font-bold text-center text-primary-gray-dark dark:text-primary-gray-dark">
              Statistiche
            </h2>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="text-center p-4 md:p-6 bg-primary-yellow/20 dark:bg-primary-yellow-dark/10 rounded-xl-large border border-primary-yellow/30 dark:border-primary-yellow-dark/20">
                <p className="text-2xl md:text-3xl font-bold text-primary-gray-dark dark:text-primary-gray-light mb-1">
                  {totalGames}
                </p>
                <p className="text-xs md:text-sm text-primary-gray-medium dark:text-primary-gray-light font-medium">Partite Giocate</p>
              </div>
              <div className="text-center p-4 md:p-6 bg-primary-yellow/20 dark:bg-primary-yellow-dark/10 rounded-xl-large border border-primary-yellow/30 dark:border-primary-yellow-dark/20">
                <p className="text-2xl md:text-3xl font-bold text-primary-gray-dark dark:text-primary-gray-light mb-1">
                  {bestScore !== null ? formatLength(bestScore) : '--'} cm
                </p>
                <p className="text-xs md:text-sm text-primary-gray-medium dark:text-primary-gray-light font-medium">Miglior Punteggio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Link al Resoconto */}
        <div className="text-center">
          <a
            href="/result"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-yellow to-primary-yellow-dark text-primary-gray-dark dark:text-primary-gray-dark font-semibold rounded-xl-large hover:shadow-yellow-glow-lg transition-all shadow-soft-lg"
          >
            Vai al Resoconto Completo
          </a>
        </div>
      </main>
    </>
  )
}

