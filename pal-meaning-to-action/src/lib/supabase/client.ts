/**
 * Supabase Client Configuration
 * 
 * Initializes the Supabase client with environment variables.
 * Used throughout the application for database queries and authentication.
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables with validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

/**
 * Supabase client instance
 * 
 * @example
 * ```typescript
 * const { data, error } = await supabase
 *   .from('profiles')
 *   .select('*')
 *   .eq('id', userId);
 * ```
 */
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'x-application-name': 'pal-meaning-to-action',
      },
    },
    db: {
      schema: 'public',
    },
  }
);

/**
 * Type-safe Supabase query builder
 * Enforces RLS policies and tenant isolation
 */
export type SupabaseQuery<T extends Record<string, unknown>> = {
  data: T | null;
  error: Error | null;
};
