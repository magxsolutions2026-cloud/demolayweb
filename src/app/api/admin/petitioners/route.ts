import { NextResponse } from 'next/server';
import { publishAdminRealtime } from '@/lib/adminRealtime';
import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import {
  PetitionerApprovalMailError,
  sendPetitionerApprovalEmail,
  type PetitionerApprovalRecipient,
} from '@/lib/petitionerApprovalEmail';

type PetitionerStatus = 'Pending' | 'Approved' | 'Declined';

type PetitionerRow = PetitionerApprovalRecipient & {
  status: PetitionerStatus;
};

function isPetitionerStatus(value: unknown): value is PetitionerStatus {
  return value === 'Pending' || value === 'Approved' || value === 'Declined';
}

export async function GET(request: Request) {
  await requireAdmin(request);
  const rows = await query('SELECT * FROM petitioners ORDER BY submitted_at DESC');
  return NextResponse.json({ petitioners: rows });
}

export async function PUT(request: Request) {
  try {
    await requireAdmin(request);
    const { id, status } = await request.json();
    const petitionerId = Number(id);

    if (!Number.isInteger(petitionerId) || petitionerId < 1 || !isPetitionerStatus(status)) {
      return NextResponse.json({ error: 'invalid input' }, { status: 400 });
    }

    const currentRows = await query<PetitionerRow>('SELECT * FROM petitioners WHERE id = ? LIMIT 1', [petitionerId]);
    const petitioner = currentRows[0];

    if (!petitioner) {
      return NextResponse.json({ error: 'Petitioner not found.' }, { status: 404 });
    }

    const shouldSendApprovalEmail = status === 'Approved' && petitioner.status !== 'Approved';
    if (shouldSendApprovalEmail) {
      await sendPetitionerApprovalEmail(petitioner);
    }

    await query('UPDATE petitioners SET status = ? WHERE id = ?', [status, petitionerId]);
    publishAdminRealtime('petitioners');
    const updated = await query<PetitionerRow>('SELECT * FROM petitioners WHERE id = ? LIMIT 1', [petitionerId]);

    return NextResponse.json({
      updated: Array.isArray(updated) ? updated[0] : null,
      mailSent: shouldSendApprovalEmail,
    });
  } catch (error) {
    if (error instanceof Response) return error;

    console.error('Failed to update petitioner status', error);

    const message =
      error instanceof PetitionerApprovalMailError ? error.message : 'Could not update petitioner status.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
