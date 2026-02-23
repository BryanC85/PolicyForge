import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebaseAdmin';

export async function GET(req) {
  const organizationId = new URL(req.url).searchParams.get('organization_id');
  if (!organizationId) {
    return NextResponse.json({ error: 'organization_id query param required' }, { status: 400 });
  }

  const snapshot = await db.collection('audit_events').where('organization_id', '==', organizationId).get();
  const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json({ organization_id: organizationId, events });
}
