import { createClient } from '@supabase/supabase-js'

// These values come from your .env.local file.
// NEXT_PUBLIC_ prefix means they're safe to use in the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// This creates a single Supabase client that your whole app shares.
// You'll import this anywhere you need to talk to the database or auth.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
