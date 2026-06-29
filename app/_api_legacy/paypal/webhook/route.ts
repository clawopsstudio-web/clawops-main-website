import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(req: Request) {
  if (!supabase) {
    return NextResponse.json({ received: true, note: 'DB not configured' });
  }

  const event = await req.json();
  const eventType = event.event_type;

  try {
    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await supabase.from('subscriptions').upsert({
          paypal_subscription_id: event.resource.id,
          status: 'active',
          user_id: event.resource.custom_id,
          plan_id: event.resource.plan_id,
          updated_at: new Date().toISOString()
        });
        break;
      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        await supabase.from('subscriptions').update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        }).eq('paypal_subscription_id', event.resource.id);
        break;
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}