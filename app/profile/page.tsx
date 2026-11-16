'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { useAuth } from '@/components/AuthProvider'
import { getUserProfile, updateUsername } from '@/lib/profile'
import { getUserBestScore, getUserRecentSessions } from '@/lib/scores'
import { formatLength } from '@/lib/game'
import { sanitizeString } from '@/lib/sanitize'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
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
      setSuccess('Nome utente aggiornato')
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
        <main className="mx-auto max-w-xl px-5 pb-16 pt-10 md:pt-16">
          <div className="caricamento" role="status" aria-label="Caricamento" />
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="entra mx-auto max-w-xl px-5 pb-16 pt-10 md:pt-16">
        <h1 className="cifre text-[clamp(3.4rem,14vw,6rem)]">Profilo</h1>

        <dl className="mt-8 grid grid-cols-2 gap-x-6 border-y border-riga py-5">
          <div>
            <dt className="text-sm text-grafite">Partite giocate</dt>
            <dd className="cifre mt-1 text-4xl">{totalGames}</dd>
          </div>
          <div>
            <dt className="text-sm text-grafite">Miglior punteggio</dt>
            <dd className="cifre mt-1 text-4xl">
              {bestScore !== null ? formatLength(bestScore) : '--'}
              <span className="text-[0.5em]"> cm</span>
            </dd>
          </div>
        </dl>

        <div className="mt-8 space-y-6">
          {/* Email (non modificabile) */}
          <div>
            <p className="etichetta">Email</p>
            <p className="truncate border-b border-riga pb-3">{sanitizeString(email || '')}</p>
            <p className="mt-1 text-xs text-grafite">L&apos;email non può essere modificata</p>
          </div>

          {/* Username (modificabile) */}
          <div>
            <label htmlFor="nome-utente" className="etichetta">
              Nome utente
            </label>
            {editingUsername ? (
              <div className="space-y-3">
                <input
                  id="nome-utente"
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="campo"
                  placeholder="Il tuo nuovo nome utente"
                  maxLength={30}
                />
                {error && (
                  <p className="avviso-errore" role="alert">{error}</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveUsername}
                    disabled={saving || newUsername.trim() === username || newUsername.trim().length < 3}
                    className="btn btn-nastro px-6 py-2.5"
                  >
                    {saving ? 'Salvataggio...' : 'Salva'}
                  </button>
                  <button onClick={handleCancelEdit} disabled={saving} className="btn btn-linea px-6 py-2.5">
                    Annulla
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-baseline justify-between gap-4 border-b border-riga pb-3">
                <p className="min-w-0 truncate font-semibold">{sanitizeString(username || 'Utente')}</p>
                <button onClick={() => setEditingUsername(true)} className="collegamento shrink-0">
                  Modifica
                </button>
              </div>
            )}
            {success && (
              <p className="avviso-ok dissolvi mt-3" role="status">{success}</p>
            )}
            <p className="mt-1 text-xs text-grafite">Da 3 a 30 caratteri</p>
          </div>
        </div>

        <Link href="/result" className="btn btn-linea mt-10">
          Vai al resoconto completo
        </Link>
      </main>
    </>
  )
}
