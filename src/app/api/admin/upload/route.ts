import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

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

export async function POST(request: Request) {
  await requireAdmin(request);

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
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadsDir, { recursive: true });

  const baseName = sanitizeBaseName(file.name);
  const extension = extensionFromMime(file.type);
  const uniqueToken = crypto.randomBytes(6).toString('hex');
  const fileName = `${Date.now()}-${baseName}-${uniqueToken}.${extension}`;
  const filePath = path.join(uploadsDir, fileName);

  await writeFile(filePath, fileBuffer);

  return NextResponse.json({
    success: true,
    url: `/uploads/${fileName}`,
    name: fileName,
    size: file.size,
    type: file.type,
  });
}
