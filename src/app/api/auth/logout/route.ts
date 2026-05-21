import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const supabase = await getSupabaseServer();
    
    // 1. Sign out from Supabase Auth Server
    await supabase.auth.signOut();
  } catch (err) {
    console.error('Supabase server signOut failed:', err);
  }

  // 2. Erase the secure session cookie
  try {
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'sb-access-token',
      value: '',
      path: '/',
      maxAge: 0,
      sameSite: 'lax',
      secure: true
    });
  } catch (cookieErr) {
    console.error('Failed to clear cookie in logout route:', cookieErr);
  }

  // 3. Perform client-side storage cleanup and redirect to login screen
  const cleanupHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>กำลังออกจากระบบ...</title>
      </head>
      <body style="background-color: #020617; color: #94a3b8; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
        <div style="text-align: center;">
          <p>กำลังออกจากระบบอย่างปลอดภัย...</p>
        </div>
        <script>
          try {
            localStorage.clear();
            sessionStorage.clear();
          } catch (e) {
            console.error('Failed to clear client storage:', e);
          }
          window.location.href = '/login';
        </script>
      </body>
    </html>
  `;

  return new NextResponse(cleanupHtml, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
