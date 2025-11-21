import { supabase } from './supabase'
import { validateUsername, sanitizeUsername } from './validation'

// Ottieni il profilo dell'utente corrente
export async function getUserProfile(userId: string): Promise<{ username: string } | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .maybeSingle()

  // Ignora errori non critici (non trovato, formato, auth temporanea)
  if (error && error.code !== 'PGRST116' && error.code !== '406' && error.code !== '42501') {
    console.error('Error getting user profile:', error)
  }

  if (!data) {
    return null
  }

  return data
}

// Ottieni o crea il profilo dell'utente
export async function getOrCreateUserProfile(userId: string, email: string): Promise<string> {
  // Prova prima a ottenere il profilo esistente
  const { data: existingProfile, error: getError } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .maybeSingle()

  // Ignora errori non critici
  if (getError && getError.code !== 'PGRST116' && getError.code !== '406' && getError.code !== '42501') {
    console.warn('Error getting profile:', getError)
  }

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

  // Ignora errori 406/401 (problemi di formato/auth) e unique violation (già esiste)
  if (insertError && 
      insertError.code !== '406' && 
      insertError.code !== '42501' && 
      insertError.code !== '23505') {
    console.warn('Error creating profile (non-critical):', insertError)
  }

  return username // Fallback all'username dall'email
}

// Aggiorna l'username dell'utente
export async function updateUsername(userId: string, newUsername: string): Promise<{ success: boolean; error?: string }> {
  // Validazione username usando la funzione di validazione
  const validation = validateUsername(newUsername)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  // Sanitizza l'username
  const trimmedUsername = sanitizeUsername(newUsername)
  
  // Validazione dopo sanitizzazione (per sicurezza aggiuntiva)
  const finalValidation = validateUsername(trimmedUsername)
  if (!finalValidation.valid) {
    return { success: false, error: finalValidation.error }
  }

  // Controlla se l'username è già in uso
  const { data: existingProfile, error: checkError } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('username', trimmedUsername)
    .maybeSingle()

  // Se c'è un errore diverso da "nessun risultato trovato", gestiscilo
  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Error checking username:', checkError)
    return { success: false, error: 'Errore durante la verifica del nome utente' }
  }

  // Se esiste un profilo con questo username e non è l'utente corrente
  if (existingProfile && existingProfile.id !== userId) {
    return { success: false, error: 'Questo nome utente è già in uso' }
  }

  // Aggiorna l'username
  const { error } = await supabase
    .from('profiles')
    .update({ username: trimmedUsername })
    .eq('id', userId)

  if (error) {
    console.error('Error updating username:', error)
    return { success: false, error: 'Errore durante l\'aggiornamento del nome utente' }
  }

  return { success: true }
}

// Verifica se un username è già in uso
export async function checkUsernameExists(username: string): Promise<boolean> {
  // Valida prima di cercare
  const validation = validateUsername(username)
  if (!validation.valid) {
    return false // Se non è valido, assume che non esista
  }

  const trimmedUsername = sanitizeUsername(username)
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', trimmedUsername)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking username:', error)
    return false // In caso di errore, assumiamo che non esista
  }

  return data !== null
}

