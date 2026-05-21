import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Unknown signature error';
    console.error(`Webhook Signature verification failed:`, errMsg);
    return NextResponse.json({ error: `Webhook Error: ${errMsg}` }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  try {
    switch (event.type) {
      // 1. Subscription Activated / Paid successfully
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const supabaseUserId = session.metadata?.supabase_user_id;

        console.log(`Checkout session completed for customer ${customerId}`);

        if (supabaseUserId) {
          // Sync directly via metadata UID
          const { error } = await supabaseAdmin
            .from('users')
            .update({ plan: 'pro', stripe_customer_id: customerId })
            .eq('id', supabaseUserId);

          if (error) throw error;
        } else if (customerId) {
          // Fallback sync via Stripe Customer ID
          const { error } = await supabaseAdmin
            .from('users')
            .update({ plan: 'pro' })
            .eq('stripe_customer_id', customerId);

          if (error) throw error;
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        console.log(`Invoice paid successfully for customer ${customerId}`);

        if (customerId) {
          const { error } = await supabaseAdmin
            .from('users')
            .update({ plan: 'pro' })
            .eq('stripe_customer_id', customerId);

          if (error) throw error;
        }
        break;
      }

      // 2. Subscription Cancelled / Terminated
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        console.log(`Subscription deleted for customer ${customerId}`);

        if (customerId) {
          // Revert to Free tier. Scans remain active, CRUD locked automatically in API
          const { error } = await supabaseAdmin
            .from('users')
            .update({ plan: 'free' })
            .eq('stripe_customer_id', customerId);

          if (error) throw error;
        }
        break;
      }

      // 3. Subscription Updated (e.g. paused, downgraded, etc.)
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status;

        console.log(`Subscription updated for customer ${customerId}. Status: ${status}`);

        // If subscription is unpaid, canceled, or past_due, downgrade access
        if (customerId) {
          const isProActive = ['active', 'trialing'].includes(status);
          const targetPlan = isProActive ? 'pro' : 'free';

          const { error } = await supabaseAdmin
            .from('users')
            .update({ plan: targetPlan })
            .eq('stripe_customer_id', customerId);

          if (error) throw error;
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe Webhook Event: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (dbError: unknown) {
    console.error(`Stripe Webhook Database Sync failed:`, dbError);
    const errMsg = dbError instanceof Error ? dbError.message : 'Database Sync failed';
    // Returns 500 error to signal database failure to Stripe, which triggers retries
    return NextResponse.json({ error: `Database Sync failed: ${errMsg}` }, { status: 500 });
  }
}
