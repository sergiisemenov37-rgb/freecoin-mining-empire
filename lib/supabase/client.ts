/**
 * Supabase Client Configuration
 * Client-side and server-side Supabase clients
 */

import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ============================================
// ENVIRONMENT VARIABLES
// ============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key not found in environment variables');
}

// ============================================
// CLIENT-SIDE CLIENT
// ============================================

export function createClientClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// ============================================
// SERVER-SIDE CLIENT
// ============================================

export async function createServerClientClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

// ============================================
// ADMIN CLIENT (SERVICE ROLE)
// ============================================

const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export function createAdminClient() {
  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ============================================
// SINGLETON CLIENTS
// ============================================

let browserClient: ReturnType<typeof createClientClient> | null = null;

export function getBrowserClient() {
  if (!browserClient) {
    browserClient = createClientClient();
  }
  return browserClient;
}
