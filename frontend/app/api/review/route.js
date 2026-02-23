import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebaseAdmin';
import { runLightweightPolicyAudit } from '../../../lib/policyEngine';

export async function POST(req) {
  const body = await req.json();
  const { organization_id, requested_by } = body;
  if (!organization_id || !requested_by) {
    return NextResponse.json({ error: 'organization_id and requested_by required' }, { status: 400 });
  }

  const chunkSnap = await db.collection('document_chunks').where('organization_id', '==', organization_id).get();
  const combined = chunkSnap.docs.map((d) => d.data().content).join('\n');
  const result = runLightweightPolicyAudit(combined);

  const reviewRef = await db.collection('policy_reviews').add({
    organization_id,
    requested_by,
    status: 'completed',
    ...result,
    created_at: new Date().toISOString()
  });

  await db.collection('audit_events').add({
    organization_id,
    actor_user_id: requested_by,
    event_type: 'policy_review_generated',
    entity_type: 'policy_review',
    entity_id: reviewRef.id,
    created_at: new Date().toISOString()
  });

  return NextResponse.json({ id: reviewRef.id, ...result, status: 'completed' });
}
