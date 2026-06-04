import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

let _supabase: SupabaseClient | null = null;

try {
  if (supabaseUrl.startsWith('http') && supabaseAnonKey) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch {
  // Credentials not configured yet — app still renders without Supabase
}

export const supabase = _supabase;
