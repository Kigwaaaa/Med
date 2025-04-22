import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if the environment variables are properly set
if (!supabaseUrl || supabaseUrl === 'your-project-url' || !supabaseUrl.startsWith('http')) {
  throw new Error(
    'Invalid or missing Supabase URL. Please:\n' +
    '1. Click the "Connect to Supabase" button in the top right\n' +
    '2. Copy your Supabase project URL to the VITE_SUPABASE_URL variable in the .env file'
  );
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
  throw new Error(
    'Invalid or missing Supabase Anon Key. Please:\n' +
    '1. Click the "Connect to Supabase" button in the top right\n' +
    '2. Copy your Supabase anon key to the VITE_SUPABASE_ANON_KEY variable in the .env file'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);