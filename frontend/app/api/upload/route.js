import { NextResponse } from 'next/server';
import { db, storage } from '../../../lib/firebaseAdmin';

function sanitizeText(raw) {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !/^page\s+\d+/i.test(line))
    .join('\n');
}

function semanticChunk(text, maxLength = 1000) {
  const parts = text.split('\n').filter(Boolean);
  const out = [];
  let current = '';
  for (const part of parts) {
    if ((current + part).length < maxLength) current += `${part}\n`;
    else {
      out.push(current.trim());
      current = `${part}\n`;
    }
  }
  if (current.trim()) out.push(current.trim());
  return out;
}

export async function POST(req) {
  const form = await req.formData();
  const file = form.get('file');
  const organizationId = form.get('organization_id');
  const uploadedBy = form.get('uploaded_by');

  if (!file || !organizationId || !uploadedBy) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = `organizations/${organizationId}/documents/${Date.now()}-${file.name}`;
  await storage.file(storagePath).save(buffer, { contentType: file.type });

  const text = sanitizeText(buffer.toString('utf8'));
  const chunks = semanticChunk(text);

  const docRef = await db.collection('documents').add({
    organization_id: organizationId,
    uploaded_by: uploadedBy,
    filename: file.name,
    content_type: file.type,
    storage_path: storagePath,
    status: 'indexed',
    created_at: new Date().toISOString()
  });

  await Promise.all(chunks.map((chunk, idx) =>
    db.collection('document_chunks').add({
      organization_id: organizationId,
      document_id: docRef.id,
      chunk_index: idx,
      content: chunk,
      created_at: new Date().toISOString()
    })
  ));

  await db.collection('audit_events').add({
    organization_id: organizationId,
    actor_user_id: uploadedBy,
    event_type: 'policy_upload',
    entity_type: 'document',
    entity_id: docRef.id,
    created_at: new Date().toISOString()
  });

  return NextResponse.json({
    organization_id: organizationId,
    document_id: docRef.id,
    chunk_count: chunks.length,
    status: 'indexed'
  });
}
