import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

// 1. Server-side Authenticated Client (respects RLS)
export const getSupabaseServer = async () => {
  let token = '';
  try {
    const cookieStore = await cookies();
    token = cookieStore.get('sb-access-token')?.value || '';
    
    // Fallback search for gotrue session cookies (prefixed with sb-)
    if (!token) {
      const allCookies = cookieStore.getAll();
      const authCookie = allCookies.find(c => c.name.includes('-auth-token'));
      if (authCookie) {
        try {
          const parsed = JSON.parse(authCookie.value);
          token = parsed.access_token || '';
        } catch {
          // ignore
        }
      }
    }
  } catch (error) {
    console.error('getSupabaseServer: cookies reading failed', error);
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  });

  if (token) {
    try {
      await client.auth.setSession({
        access_token: token,
        refresh_token: token, // Pass token as a non-empty string to avoid AuthSessionMissingError
      });
    } catch (err) {
      console.error('getSupabaseServer: failed to set auth session:', err);
    }
  }

  return client;
};

// 2. Admin Client (RLS Immune - Server Only)
export const getSupabaseAdmin = () => {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables.');
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
