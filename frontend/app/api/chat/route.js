import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebaseAdmin';
import { answerFromPolicy } from '../../../lib/policyEngine';

export async function POST(req) {
  const body = await req.json();
  const { organization_id, user_id, question } = body;
  if (!organization_id || !user_id || !question) {
    return NextResponse.json({ error: 'Missing organization_id, user_id, question' }, { status: 400 });
  }

  const chunkSnap = await db.collection('document_chunks').where('organization_id', '==', organization_id).limit(20).get();
  const context = chunkSnap.docs.map((d) => d.data().content).join('\n');
  const response = answerFromPolicy(question, context);

  await db.collection('chat_logs').add({
    organization_id,
    user_id,
    question,
    ...response,
    created_at: new Date().toISOString()
  });

  await db.collection('audit_events').add({
    organization_id,
    actor_user_id: user_id,
    event_type: 'employee_question',
    entity_type: 'chat_log',
    event_payload: { question, escalated: response.escalated },
    created_at: new Date().toISOString()
  });

  return NextResponse.json(response);
}
