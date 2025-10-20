import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables from CRA or Vite
const supabaseUrl: string = import.meta.env.VITE_APP_SUPABASE_URL;
const supabaseKey: string = import.meta.env.VITE_APP_SUPABASE_KEY;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);
