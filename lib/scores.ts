import { supabase } from './supabase'

export interface Score {
  id: string
  user_id: string
  best_score: number
  username: string
  created_at: string
  updated_at: string
}

// Ottieni il miglior punteggio dell'utente corrente
export async function getUserBestScore(userId: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('scores')
    .select('best_score')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return Number(data.best_score)
}

// Salva o aggiorna il miglior punteggio dell'utente
export async function saveBestScore(userId: string, score: number): Promise<void> {
  // Controlla se esiste già un punteggio
  const { data: existing } = await supabase
    .from('scores')
    .select('id, best_score')
    .eq('user_id', userId)
    .single()

  if (existing) {
    // Aggiorna solo se il nuovo punteggio è migliore (più basso)
    if (score < existing.best_score) {
      await supabase
        .from('scores')
        .update({ best_score: score, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
    }
  } else {
    // Crea un nuovo record
    await supabase
      .from('scores')
      .insert({ user_id: userId, best_score: score })
  }
}

// Ottieni la classifica globale (migliori punteggi)
export async function getLeaderboard(limit: number = 10): Promise<Score[]> {
  const { data: scoresData, error: scoresError } = await supabase
    .from('scores')
    .select('*')
    .order('best_score', { ascending: true })
    .limit(limit)

  if (scoresError || !scoresData) {
    return []
  }

  // Ottieni i profili per tutti gli user_id
  const userIds = scoresData.map(s => s.user_id)
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, username')
    .in('id', userIds)

  // Crea una mappa per lookup veloce
  const profilesMap = new Map(
    (profilesData || []).map(p => [p.id, p.username])
  )

  return scoresData.map((item) => ({
    id: item.id,
    user_id: item.user_id,
    best_score: Number(item.best_score),
    username: profilesMap.get(item.user_id) || 'Anonimo',
    created_at: item.created_at,
    updated_at: item.updated_at,
  }))
}

