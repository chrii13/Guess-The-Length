import { supabase } from './supabase'

// Ottieni il profilo dell'utente corrente
export async function getUserProfile(userId: string): Promise<{ username: string } | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

// Ottieni o crea il profilo dell'utente
export async function getOrCreateUserProfile(userId: string, email: string): Promise<string> {
  // Prova prima a ottenere il profilo esistente
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .single()

  if (existingProfile) {
    return existingProfile.username
  }

  // Se non esiste, prova a crearlo
  const username = email.split('@')[0]
  const { error: insertError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      username: username,
    })

  if (insertError) {
    console.error('Error creating profile:', insertError)
    return username // Fallback all'username dall'email
  }

  return username
}

