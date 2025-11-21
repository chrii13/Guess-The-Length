// Jest setup file
// Questo file viene eseguito prima di ogni test

// Mock delle variabili d'ambiente per i test
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key'

// Aumenta il timeout per i test di rete
jest.setTimeout(30000)

// Mock per fetch globale se necessario
if (typeof global.fetch === 'undefined') {
  global.fetch = require('node-fetch')
}

// Mock per DOM API in ambiente Node
if (typeof global.document === 'undefined') {
  // Usa jsdom solo se necessario, altrimenti i test funzionano senza
  try {
    const { JSDOM } = require('jsdom')
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
    global.document = dom.window.document
    global.window = dom.window
  } catch (e) {
    // jsdom non installato, va bene per i test base
  }
}

// Silenzia i log durante i test (opzionale)
// console.log = jest.fn()
// console.error = jest.fn()
// console.warn = jest.fn()


