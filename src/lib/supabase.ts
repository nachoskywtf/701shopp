import { createClient } from '@supabase/supabase-js';

// Fallback to empty strings to avoid breaking the build if env vars are missing during initial deployment setup.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
