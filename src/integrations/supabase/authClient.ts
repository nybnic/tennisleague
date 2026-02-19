import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL_AUTH
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY_AUTH

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase Auth credentials. Please ensure VITE_SUPABASE_URL_AUTH and VITE_SUPABASE_ANON_KEY_AUTH are set in .env.local.auth')
}

export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey)
