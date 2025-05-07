import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Configure Supabase options
const supabaseOptions = {
  auth: {
    autoConfirm: true,
    flowType: 'pkce' as const,
    detectSessionInUrl: true,
    persistSession: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js/2.0.0',
    },
  },
};

// Check if the environment variables are properly set
if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
  throw new Error(
    'Invalid or missing Supabase URL. Please check your .env file and ensure VITE_SUPABASE_URL is set correctly.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Invalid or missing Supabase Anon Key. Please check your .env file and ensure VITE_SUPABASE_ANON_KEY is set correctly.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, supabaseOptions);