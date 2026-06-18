import { createClient } from '@supabase/supabase-js';

// One shared Supabase client for the whole app.
// URL + anon/publishable key come from .env (and Heroku config vars in production).
// These are safe to expose in the browser; row-level security guards the data.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '❌ Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
