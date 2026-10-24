import { query } from '@/lib/db';

/** Rows from DB before optional photo framing columns existed. */
export type OfficerRow = {
  id: number;
  name: string;
  position: string;
  photo_url: string | null;
  photo_pos_x?: number;
  photo_pos_y?: number;
  photo_zoom?: number;
};

function isUnknownColumnError(e: unknown): boolean {
  if (e && typeof e === 'object' && 'code' in e) {
    return (e as { code?: string }).code === 'ER_BAD_FIELD_ERROR';
  }
  const msg = e instanceof Error ? e.message : String(e);
  return /Unknown column/i.test(msg);
}

function withDefaultFraming(row: Record<string, unknown>): OfficerRow {
  return {
    ...row,
    photo_pos_x: 50,
    photo_pos_y: 45,
    photo_zoom: 100,
  } as unknown as OfficerRow;
}

const FULL_OFFICERS_SELECT =
  'SELECT id, name, position, photo_url, photo_pos_x, photo_pos_y, photo_zoom FROM officers ORDER BY name';

/** Adds photo framing columns when missing (same as db-migrate-officers-photo-framing.sql). Safe to call repeatedly. */
export async function migrateOfficersFramingIfNeeded(): Promise<void> {
  const rows = await query<{ c: number }>(
    `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'officers'
     AND COLUMN_NAME IN ('photo_pos_x', 'photo_pos_y', 'photo_zoom')`,
  );
  const c = Number(rows[0]?.c ?? 0);
  if (c >= 3) return;

  await query(
    `ALTER TABLE officers
      ADD COLUMN photo_pos_x TINYINT UNSIGNED NOT NULL DEFAULT 50 COMMENT '0-100 horizontal focal' AFTER photo_url,
      ADD COLUMN photo_pos_y TINYINT UNSIGNED NOT NULL DEFAULT 45 COMMENT '0-100 vertical focal' AFTER photo_pos_x,
      ADD COLUMN photo_zoom TINYINT UNSIGNED NOT NULL DEFAULT 100 COMMENT '100=cover, up to 200=tighter zoom' AFTER photo_pos_y`,
  );
}

/**
 * Lists officers for API responses. Migrates legacy DBs missing `photo_pos_*` columns when possible;
 * otherwise returns default framing values without persisting (until migration is applied).
 */
export async function listOfficersOrderedByName(): Promise<OfficerRow[]> {
  try {
    return await query<OfficerRow>(FULL_OFFICERS_SELECT);
  } catch (e: unknown) {
    if (!isUnknownColumnError(e)) throw e;
    try {
      await migrateOfficersFramingIfNeeded();
      return await query<OfficerRow>(FULL_OFFICERS_SELECT);
    } catch (e2: unknown) {
      if (!isUnknownColumnError(e2)) throw e2;
      const rows = await query<Record<string, unknown>>(
        'SELECT id, name, position, photo_url FROM officers ORDER BY name',
      );
      return rows.map(withDefaultFraming);
    }
  }
}
