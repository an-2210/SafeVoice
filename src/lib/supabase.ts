// filepath: [supabase.ts](http://_vscodecontentref_/1)
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client as a singleton
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a single instance that will be reused
export const supabase = createClient(supabaseUrl, supabaseKey);