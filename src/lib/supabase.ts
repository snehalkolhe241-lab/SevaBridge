import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

/** Empty env must not crash the shell. Callers in later phases get a clear error. */
export function getSupabase(): SupabaseClient {
  if (client) return client
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
  }
  client = createClient(url, anonKey)
  return client
}
