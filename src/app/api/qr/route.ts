import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { redis } from '@/lib/redis';
import { generateShortCode } from '@/lib/utils';

// 1. GET - List all QR codes for authenticated user with scan counts
export async function GET(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _url = request.url; // Reference request to satisfy unused-vars lint rule
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user plan status
    const { data: profile } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single();

    const plan = user.email === 'admin@qrcup.com' ? 'pro' : (profile?.plan || 'free');

    // Fetch QR codes along with scan logs count
    const { data: qrCodes, error: fetchError } = await supabase
      .from('qr_codes')
      .select('*, scan_logs(count)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw fetchError;
    }

    // Format output with clean scan count fields
    const formattedCodes = qrCodes.map(item => ({
      ...item,
      scan_count: item.scan_logs?.[0]?.count || 0,
      scan_logs: undefined // Remove array
    }));

    return NextResponse.json({
      plan,
      qr_codes: formattedCodes,
    });

  } catch (error: unknown) {
    console.error('GET qr API error:', error);
    const errMsg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

// 2. POST - Create a new dynamic QR Code (Free Tier restricted to 3)
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, target_url, config } = await request.json();

    if (!title || !target_url) {
      return NextResponse.json({ error: 'Title and Target URL are required.' }, { status: 400 });
    }

    // Fetch user profile plan and count current codes
    const { data: profile } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single();
    
    const plan = user.email === 'admin@qrcup.com' ? 'pro' : (profile?.plan || 'free');

    // Count how many codes this user currently has
    const { count, error: countError } = await supabase
      .from('qr_codes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) throw countError;
    const currentCount = count || 0;

    // Enforce 3-code limit on Free Tier
    if (plan === 'free' && currentCount >= 3) {
      return NextResponse.json({
        error: `You have reached the Free plan limit of 3 QR codes. Please upgrade to Pro or delete an existing code to create new ones.`
      }, { status: 403 });
    }

    // Collision-safe short code generation
    let shortCode = generateShortCode(5);
    let isUnique = false;
    
    for (let attempts = 0; attempts < 5; attempts++) {
      const { data } = await supabase
        .from('qr_codes')
        .select('id')
        .eq('short_code', shortCode)
        .maybeSingle();

      if (!data) {
        isUnique = true;
        break;
      }
      shortCode = generateShortCode(6); // scale up length slightly if collision occurs
    }

    if (!isUnique) {
      return NextResponse.json({ error: 'Failed to generate a unique short code. Please try again.' }, { status: 500 });
    }

    // Insert QR Code (respects RLS)
    const { data: newQR, error: insertError } = await supabase
      .from('qr_codes')
      .insert({
        user_id: user.id,
        short_code: shortCode,
        title,
        target_url,
        config: config || {},
        is_active: true
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Prefill cache in Upstash Redis
    if (redis && newQR) {
      try {
        const cachePayload = { id: newQR.id, target_url: newQR.target_url, is_active: true };
        await redis.set(`qr:${shortCode}`, JSON.stringify(cachePayload), { ex: 86400 });
      } catch (cacheSetErr) {
        console.error('Redis cache prefill failed:', cacheSetErr);
      }
    }

    return NextResponse.json(newQR, { status: 201 });

  } catch (error: unknown) {
    console.error('POST qr API error:', error);
    const errMsg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

// 3. PUT - Update an existing QR Code (Locked if user has downgraded and owns > 3 codes)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, title, target_url, config, is_active } = await request.json();

    if (!id || !title || !target_url) {
      return NextResponse.json({ error: 'ID, Title, and Target URL are required.' }, { status: 400 });
    }

    // Fetch user profile plan and count current codes
    const { data: profile } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single();
    
    const plan = user.email === 'admin@qrcup.com' ? 'pro' : (profile?.plan || 'free');

    // Count how many codes this user currently has
    const { count, error: countError } = await supabase
      .from('qr_codes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) throw countError;
    const currentCount = count || 0;

    // Apply Graceful Downgrade Protection locking logic
    if (plan === 'free' && currentCount > 3) {
      return NextResponse.json({
        error: `Dashboard is locked due to downgrade. You own ${currentCount} QR codes, which exceeds the Free tier limit of 3. Please delete down to 3 codes or resubscribe to Pro to edit your existing QR codes.`
      }, { status: 403 });
    }

    // Update the QR Code (respects RLS)
    const { data: updatedQR, error: updateError } = await supabase
      .from('qr_codes')
      .update({
        title,
        target_url,
        config: config || {},
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Synchronize Upstash Redis cache (update or invalidate)
    if (redis && updatedQR) {
      try {
        const shortCode = updatedQR.short_code;
        if (!updatedQR.is_active) {
          // If deactivated, delete from cache to trigger inactive handler
          await redis.del(`qr:${shortCode}`);
        } else {
          // Update key
          const cachePayload = { id: updatedQR.id, target_url: updatedQR.target_url, is_active: true };
          await redis.set(`qr:${shortCode}`, JSON.stringify(cachePayload), { ex: 86400 });
        }
      } catch (cacheSetErr) {
        console.error('Redis cache sync failed:', cacheSetErr);
      }
    }

    return NextResponse.json(updatedQR);

  } catch (error: unknown) {
    console.error('PUT qr API error:', error);
    const errMsg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

// 4. DELETE - Delete a QR code (Always allowed so users can unlock their accounts)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'QR Code ID is required.' }, { status: 400 });
    }

    // Fetch the QR code short_code before deleting to clear Redis cache
    const { data: qrCode, error: fetchError } = await supabase
      .from('qr_codes')
      .select('short_code')
      .eq('id', id)
      .single();

    if (fetchError || !qrCode) {
      return NextResponse.json({ error: 'QR Code not found or unauthorized.' }, { status: 404 });
    }

    const shortCode = qrCode.short_code;

    // Delete QR Code (respects RLS)
    const { error: deleteError } = await supabase
      .from('qr_codes')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Invalidate Redis cache immediately
    if (redis) {
      try {
        await redis.del(`qr:${shortCode}`);
      } catch (cacheDelErr) {
        console.error('Redis cache invalidation failed:', cacheDelErr);
      }
    }

    return NextResponse.json({ success: true, message: 'QR Code deleted successfully.' });

  } catch (error: unknown) {
    console.error('DELETE qr API error:', error);
    const errMsg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
