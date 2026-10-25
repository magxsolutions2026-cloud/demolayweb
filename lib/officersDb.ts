import { query } from '@/lib/db';

/** Rows from DB; photo framing columns are created by db-init.sql. */
export type OfficerRow = {
  id: number;
  name: string;
  position: string;
  photo_url: string | null;
  photo_pos_x?: number;
  photo_pos_y?: number;
  photo_zoom?: number;
};

const FULL_OFFICERS_SELECT =
  'SELECT id, name, position, photo_url, photo_pos_x, photo_pos_y, photo_zoom FROM officers ORDER BY name';

/** Lists officers for API responses. Schema (incl. framing columns) is managed by db-init.sql. */
export async function listOfficersOrderedByName(): Promise<OfficerRow[]> {
  return query<OfficerRow>(FULL_OFFICERS_SELECT);
}
