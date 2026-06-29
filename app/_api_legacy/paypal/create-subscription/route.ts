import { NextResponse } from 'next/server';
import { createSubscription } from '@/lib/paypal/client';

export async function POST(req: Request) {
  try {
    const { planId, userId } = await req.json();
    const subscription = await createSubscription(planId, userId);
    
    // Extract approval URL
    const approvalLink = subscription.links.find((link: any) => link.rel === 'approve');
    
    return NextResponse.json({ approvalUrl: approvalLink.href });
  } catch (error) {
    console.error('PayPal Error:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}
