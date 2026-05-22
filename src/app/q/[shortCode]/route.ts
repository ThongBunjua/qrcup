import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { appendLineEscapeParam, mapUrlToNativeScheme, buildDeepLinkHtml } from '@/lib/utils';

interface QRData {
  id: string;
  target_url: string;
  is_active: boolean;
  user_id: string;
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await props.params;

  try {
    let qrCode: QRData | null = null;
    let ownerPlan: 'free' | 'pro' = 'free';

    // 1. Try Cache Lookup (Redis)
    if (redis) {
      try {
        const cached = await redis.get<string>(`qr:${shortCode}`);
        if (cached) {
          const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
          qrCode = parsed;
          // Cache stores owner plan
          ownerPlan = parsed.owner_plan || 'free';
        }
      } catch (cacheErr) {
        console.error('Redis cache lookup failed:', cacheErr);
      }
    }

    // 2. Cache Miss: DB Lookup (Supabase Admin)
    if (!qrCode) {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase
        .from('qr_codes')
        .select('id, target_url, is_active, user_id')
        .eq('short_code', shortCode)
        .single();

      if (error || !data) {
        return NextResponse.redirect(new URL('/not-found', request.url));
      }

      qrCode = data as QRData;

      // Fetch owner's plan and email from users table in a single query
      const { data: profile } = await supabase
        .from('users')
        .select('plan, email')
        .eq('id', data.user_id)
        .single();

      const isAdmin = profile?.email === 'admin@qrcup.com';
      ownerPlan = isAdmin ? 'pro' : (profile?.plan || 'free') as 'free' | 'pro';

      // Write-back to Redis cache with owner_plan (24 hours TTL = 86400s)
      if (redis && qrCode) {
        try {
          await redis.set(`qr:${shortCode}`, JSON.stringify({
            ...qrCode,
            owner_plan: ownerPlan,
          }), { ex: 86400 });
        } catch (cacheSetErr) {
          console.error('Redis cache write failed:', cacheSetErr);
        }
      }
    }

    // 3. Inactive Check
    if (!qrCode.is_active) {
      // Redirect to a clean inactive page
      return NextResponse.redirect(new URL(`/inactive?title=${encodeURIComponent(shortCode)}`, request.url));
    }

    // 4. Parse User-Agent (Sleek Regex Parser)
    const userAgent = request.headers.get('user-agent') || '';
    
    // Parse Device
    let deviceType = 'Other';
    if (/iPad|iPhone|iPod/i.test(userAgent)) {
      deviceType = 'iOS';
    } else if (/Android/i.test(userAgent)) {
      deviceType = 'Android';
    } else if (/Windows|Macintosh|Linux/i.test(userAgent)) {
      deviceType = 'Desktop';
    }

    // Parse Browser / In-App WebView
    let browser = 'Other';
    const uaLower = userAgent.toLowerCase();
    if (uaLower.includes('line/')) {
      browser = 'LINE';
    } else if (uaLower.includes('tiktok/')) {
      browser = 'TikTok';
    } else if (uaLower.includes('instagram')) {
      browser = 'Instagram';
    } else if (uaLower.includes('fbav') || uaLower.includes('fban')) {
      browser = 'Facebook';
    } else if (uaLower.includes('edg/') || uaLower.includes('edge')) {
      browser = 'Edge';
    } else if (uaLower.includes('firefox') || uaLower.includes('fxios')) {
      browser = 'Firefox';
    } else if (uaLower.includes('chrome') || uaLower.includes('crios')) {
      browser = 'Chrome';
    } else if (uaLower.includes('safari') && !uaLower.includes('chrome')) {
      browser = 'Safari';
    }

    // 5. Asynchronous Log Writing
    const logPromise = (async () => {
      try {
        const supabase = getSupabaseAdmin();
        const { error } = await supabase.from('scan_logs').insert({
          qr_code_id: qrCode!.id,
          device_type: deviceType,
          browser: browser
        });
        if (error) throw error;
      } catch (err) {
        console.error('Failed to log scan asynchronously:', err);
      }
    })();

    try {
      const edgeRequest = request as unknown as { waitUntil?: (promise: Promise<unknown>) => void };
      if (typeof edgeRequest.waitUntil === 'function') {
        edgeRequest.waitUntil(logPromise);
      } else {
        logPromise.catch(e => console.error(e));
      }
    } catch {
      // Fallback for standard node servers/local runtimes
      logPromise.catch(e => console.error(e));
    }

    // 6. Redirection Strategies
    
    // Strategy A: Escaping LINE In-App Browser Trap (Available for ALL plans)
    if (browser === 'LINE') {
      const escapedUrl = appendLineEscapeParam(qrCode.target_url);
      return NextResponse.redirect(escapedUrl, 302);
    }

    // Strategy B: Thai Localized Deep-Linking (PRO PLAN ONLY, Mobile Only)
    if (ownerPlan === 'pro') {
      const isMobile = deviceType === 'iOS' || deviceType === 'Android';
      if (isMobile) {
        const nativeScheme = mapUrlToNativeScheme(qrCode.target_url);
        if (nativeScheme) {
          // Returns the custom deep-link loader page
          const html = buildDeepLinkHtml(qrCode.target_url, nativeScheme);
          return new NextResponse(html, {
            headers: {
              'Content-Type': 'text/html',
              'Cache-Control': 'no-store, max-age=0, must-revalidate',
            },
          });
        }
      }
    }
    // Free plan: Skip deep-linking entirely, use standard redirect below

    // Strategy C: High-Speed Standard Redirection
    return NextResponse.redirect(qrCode.target_url, 302);

  } catch (error) {
    console.error('Redirection error:', error);
    // Graceful fallback to prevent blank pages
    return NextResponse.redirect(new URL('/', request.url));
  }
}
