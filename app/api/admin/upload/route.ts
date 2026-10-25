import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/auth';
import crypto from 'crypto';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const BUCKET = 'uploads';

function sanitizeBaseName(name: string) {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'image';
}

function extensionFromMime(mimeType: string) {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    default:
      return 'bin';
  }
}

function getSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  }
  // Server-only route (behind requireAdmin) — service role key never reaches the browser.
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

async function uploadToStorage(supabase: SupabaseClient, path: string, body: Buffer, contentType: string) {
  let { error } = await supabase.storage.from(BUCKET).upload(path, body, { contentType, upsert: false });

  if (error && /bucket not found/i.test(error.message)) {
    // First upload on a fresh project: create the public bucket, then retry once.
    const { error: createError } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (createError && !/already exists|duplicate/i.test(createError.message)) {
      throw createError;
    }
    ({ error } = await supabase.storage.from(BUCKET).upload(path, body, { contentType, upsert: false }));
  }

  if (error) throw error;
}

export async function POST(request: Request) {
  await requireAdmin(request);

  const supabase = getSupabase();

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  const baseName = sanitizeBaseName(file.name);
  const extension = extensionFromMime(file.type);
  const uniqueToken = crypto.randomBytes(6).toString('hex');
  const fileName = `${Date.now()}-${baseName}-${uniqueToken}.${extension}`;

  try {
    await uploadToStorage(supabase, fileName, fileBuffer, file.type);
  } catch (err) {
    console.error('[api/admin/upload] Supabase Storage upload failed:', err);
    return NextResponse.json({ error: 'Could not upload file to storage.' }, { status: 500 });
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

  return NextResponse.json({
    success: true,
    url: data.publicUrl,
    name: fileName,
    size: file.size,
    type: file.type,
  });
}
