import { supabase } from './supabase'

export interface Score {
  id: string
  user_id: string
  best_score: number
  username: string
  created_at: string
  updated_at: string
}

export interface GameSession {
  id: string
  user_id: string
  score: number
  round_1_target: number
  round_1_best_error: number
  round_2_target: number
  round_2_best_error: number
  round_3_target: number
  round_3_best_error: number
  created_at: string
}

export interface RoundData {
  target: number
  bestError: number
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

  if (scoresError || !scoresData || scoresData.length === 0) {
    return []
  }

  // Ottieni i profili per tutti gli user_id
  const userIds = scoresData.map(s => s.user_id)
  
  // Ottieni i profili dalla tabella profiles
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username')
    .in('id', userIds)

  // Se ci sono errori o profili mancanti, prova a crearli
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
  }

  // Crea una mappa per lookup veloce
  const profilesMap = new Map<string, string>()
  
  if (profilesData) {
    profilesData.forEach(p => {
      profilesMap.set(p.id, p.username)
    })
  }

  // Per ogni score senza profilo, prova a creare il profilo usando l'email
  const results: Score[] = []
  
  for (const item of scoresData) {
    let username = profilesMap.get(item.user_id)
    
    // Se non c'è un profilo, prova a crearlo
    if (!username) {
      // Prova a ottenere l'utente da auth.users (richiede privilegi)
      // Come fallback, usa un placeholder temporaneo
      // Il trigger dovrebbe creare il profilo automaticamente
      username = 'Utente'
      
      // Log per debug
      console.warn(`Profile missing for user ${item.user_id}`)
    }

    results.push({
      id: item.id,
      user_id: item.user_id,
      best_score: Number(item.best_score),
      username: username || 'Utente',
      created_at: item.created_at,
      updated_at: item.updated_at,
    })
  }

  return results
}

// Salva una nuova partita nella tabella game_sessions
export async function saveGameSession(
  userId: string,
  score: number,
  rounds: RoundData[]
): Promise<void> {
  if (rounds.length !== 3) {
    throw new Error('Deve esserci esattamente 3 round')
  }

  const { error } = await supabase
    .from('game_sessions')
    .insert({
      user_id: userId,
      score: score,
      round_1_target: rounds[0].target,
      round_1_best_error: rounds[0].bestError,
      round_2_target: rounds[1].target,
      round_2_best_error: rounds[1].bestError,
      round_3_target: rounds[2].target,
      round_3_best_error: rounds[2].bestError,
    })

  if (error) {
    console.error('Error saving game session:', error)
    throw error
  }

  // Aggiorna anche il best_score se necessario
  await saveBestScore(userId, score)
}

// Ottieni le ultime N partite dell'utente
export async function getUserRecentSessions(
  userId: string,
  limit: number = 5
): Promise<GameSession[]> {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching game sessions:', error)
    return []
  }

  if (!data) {
    return []
  }

  return data.map((session) => ({
    id: session.id,
    user_id: session.user_id,
    score: Number(session.score),
    round_1_target: Number(session.round_1_target),
    round_1_best_error: Number(session.round_1_best_error),
    round_2_target: Number(session.round_2_target),
    round_2_best_error: Number(session.round_2_best_error),
    round_3_target: Number(session.round_3_target),
    round_3_best_error: Number(session.round_3_best_error),
    created_at: session.created_at,
  }))
}

