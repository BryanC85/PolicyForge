import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebaseAdmin';

export async function POST(req) {
  const body = await req.json();
  const { organization_id, user_id, document_id } = body;
  if (!organization_id || !user_id || !document_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const ref = await db.collection('policy_acknowledgements').add({
    organization_id,
    user_id,
    document_id,
    acknowledged_at: new Date().toISOString()
  });

  await db.collection('audit_events').add({
    organization_id,
    actor_user_id: user_id,
    event_type: 'policy_acknowledged',
    entity_type: 'policy_acknowledgement',
    entity_id: ref.id,
    created_at: new Date().toISOString()
  });

  return NextResponse.json({ status: 'acknowledged', id: ref.id });
}
