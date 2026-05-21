import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabase-server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    // Read request body to extract optional subscription interval selection
    const body = await request.json().catch(() => ({}));
    const interval = body.interval || 'monthly';

    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe payments are not configured.' }, { status: 500 });
    }

    // 1. Fetch user's profile to retrieve stripe_customer_id
    const { data: profile } = await supabase
      .from('users')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    // 2. On-demand customer registration
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || profile?.email || '',
        metadata: {
          supabase_user_id: user.id
        }
      });
      
      customerId = customer.id;

      // Sync customer ID back using high-privilege Admin Client
      const supabaseAdmin = getSupabaseAdmin();
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);

      if (updateError) {
        console.error('Failed to sync stripe_customer_id to public.users:', updateError);
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Choose dynamic Price ID based on interval select
    const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
    const yearlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || monthlyPriceId;
    const priceId = interval === 'yearly' ? yearlyPriceId : monthlyPriceId;

    if (!priceId) {
      return NextResponse.json({ 
        error: `${interval === 'yearly' ? 'NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID' : 'NEXT_PUBLIC_STRIPE_PRO_PRICE_ID'} is not configured in environment variables.` 
      }, { status: 500 });
    }

    // 3. Initiate subscription session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl}/dashboard?upgrade_status=success`,
      cancel_url: `${appUrl}/dashboard`,
      metadata: {
        supabase_user_id: user.id
      }
    });

    return NextResponse.json({ url: session.url });

  } catch (error: unknown) {
    console.error('Stripe checkout session error:', error);
    const errMsg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
