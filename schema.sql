-- SCHEMA FOR DYNAMIC QR CODE MICRO-SAAS

-- Disable triggers temporarily if needed, but not required for fresh run
-- 1. USERS TABLE (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. QR CODES TABLE
CREATE TABLE IF NOT EXISTS public.qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    target_url TEXT NOT NULL,
    config JSONB DEFAULT '{}'::jsonb NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. SCAN LOGS TABLE (For Analytics)
CREATE TABLE IF NOT EXISTS public.scan_logs (
    id BIGSERIAL PRIMARY KEY,
    qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
    scanned_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    device_type TEXT DEFAULT 'Other' NOT NULL,
    browser TEXT DEFAULT 'Other' NOT NULL
);

-- 4. HIGH-PERFORMANCE INDEXES
-- Index for lightning-fast cache-miss routing lookup
CREATE INDEX IF NOT EXISTS idx_qr_codes_short_code ON public.qr_codes(short_code);
-- Index for dashboard operations
CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id ON public.qr_codes(user_id);
-- Indexes for blazingly fast analytical operations
CREATE INDEX IF NOT EXISTS idx_scan_logs_qr_code_id ON public.scan_logs(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_scan_logs_scanned_at ON public.scan_logs(scanned_at);

-- 5. AUTOMATIC PROFILE SYNC FROM SUPABASE AUTH
-- Create trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, plan)
    VALUES (
        new.id, 
        new.email, 
        CASE WHEN new.email = 'admin@qrcup.com' THEN 'pro' ELSE 'free' END
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users table
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS on all public tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;

-- User Table Policies
CREATE POLICY "Users can view their own profile" 
    ON public.users FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
    ON public.users FOR UPDATE 
    USING (auth.uid() = id);

-- QR Code Policies
CREATE POLICY "Users can read their own QR codes" 
    ON public.qr_codes FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own QR codes" 
    ON public.qr_codes FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own QR codes" 
    ON public.qr_codes FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own QR codes" 
    ON public.qr_codes FOR DELETE 
    USING (auth.uid() = user_id);

-- Scan Logs Policies
CREATE POLICY "Users can view scan logs of their own QR codes" 
    ON public.scan_logs FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.qr_codes 
            WHERE public.qr_codes.id = public.scan_logs.qr_code_id 
            AND public.qr_codes.user_id = auth.uid()
        )
    );

-- Allow server routes (running with service role key) to write scan logs.
-- Since Supabase service_role client bypasses RLS entirely, we do not need to enable public inserts,
-- which keeps the database incredibly secure.
