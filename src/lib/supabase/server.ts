/**
 * Server-side Supabase client
 * Use this in API routes and server components for privileged operations
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Create a server-side Supabase client with service role privileges
 * This bypasses RLS policies - use carefully!
 */
export function createServerClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Supabase server environment variables not configured. ' +
      'Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Check if server-side Supabase is properly configured
 */
export function isServerSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseServiceKey);
}
