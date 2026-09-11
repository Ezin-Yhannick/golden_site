import { createClient } from '@supabase/supabase-js'

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env?: ImportMetaEnv
}

const supabaseUrl = (import.meta as ImportMeta).env?.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = (import.meta as ImportMeta).env?.VITE_SUPABASE_ANON_KEY ?? ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Variables Supabase manquantes. Copie .env.example vers .env et renseigne tes clés.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
