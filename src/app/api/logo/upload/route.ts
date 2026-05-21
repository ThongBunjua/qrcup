import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify authenticated user session
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: 'ไม่ได้รับสิทธิ์เข้าใช้งาน กรุณาเข้าสู่ระบบอีกครั้ง' }, { status: 401 });
    }

    // 1.5 Plan Check — Block Free plan users from uploading logos
    const { data: profile } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single();

    const plan = user.email === 'admin@qrcup.com' ? 'pro' : (profile?.plan || 'free');

    if (plan === 'free') {
      return NextResponse.json({ error: 'ฟีเจอร์อัปโหลดโลโก้สำหรับสมาชิก Pro เท่านั้น กรุณาอัปเกรดเพื่อใช้งาน' }, { status: 403 });
    }

    // 2. Parse FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'ไม่พบไฟล์รูปภาพที่จะอัปโหลด' }, { status: 400 });
    }

    // Enforce 1MB limit on server side for protection
    if (file.size > 1024 * 1024) {
      return NextResponse.json({ error: 'ขนาดไฟล์โลโก้ต้องไม่เกิน 1MB' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Initialize high-privilege Admin Client (bypasses RLS)
    const supabaseAdmin = getSupabaseAdmin();

    // 4. Ensure 'logos' bucket exists and is public
    try {
      const { data: buckets } = await supabaseAdmin.storage.listBuckets();
      const logosBucket = buckets?.find(b => b.name === 'logos');
      if (!logosBucket) {
        console.log("Bucket 'logos' not found, creating it as public...");
        await supabaseAdmin.storage.createBucket('logos', {
          public: true,
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'],
          fileSizeLimit: 1048576
        });
      }
    } catch (bucketErr) {
      console.error('Failed to auto-create logos storage bucket:', bucketErr);
    }

    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    // 5. Upload file using Admin Client (RLS Bypass)
    const { error: uploadErr } = await supabaseAdmin.storage
      .from('logos')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true
      });

    if (uploadErr) {
      throw uploadErr;
    }

    // 6. Retrieve public URL
    const { data } = supabaseAdmin.storage.from('logos').getPublicUrl(filePath);

    return NextResponse.json({ publicUrl: data.publicUrl });
  } catch (err: unknown) {
    console.error('Server-side logo upload error:', err);
    const errMsg = err instanceof Error ? err.message : 'อัปโหลดรูปภาพล้มเหลว';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
