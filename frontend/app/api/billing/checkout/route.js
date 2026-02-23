import { NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import { getMasterApiConfig } from '../../../../lib/masterApiConfig';

export async function POST(req) {
  const body = await req.json();
  const { price_id, organization_id } = body;
  if (!price_id || !organization_id) {
    return NextResponse.json({ error: 'price_id and organization_id are required' }, { status: 400 });
  }

  const cfg = getMasterApiConfig();
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: price_id, quantity: 1 }],
    success_url: `${cfg.app.url}/billing?status=success`,
    cancel_url: `${cfg.app.url}/billing?status=cancelled`,
    metadata: { organization_id }
  });

  return NextResponse.json({ checkout_url: session.url });
}
