import type { CSSProperties } from 'react';

export type OfficerPhotoFraming = {
  photo_url?: string | null;
  photo_pos_x?: number | string | null;
  photo_pos_y?: number | string | null;
  photo_zoom?: number | string | null;
};

export function clampOfficerFraming(o: OfficerPhotoFraming) {
  const x = Math.min(100, Math.max(0, Math.round(Number(o.photo_pos_x ?? 50) || 50)));
  const y = Math.min(100, Math.max(0, Math.round(Number(o.photo_pos_y ?? 45) || 45)));
  const z = Math.min(200, Math.max(100, Math.round(Number(o.photo_zoom ?? 100) || 100)));
  const url = o.photo_url?.trim() || '/placeholder-officer.svg';
  return { x, y, z, url };
}

/** Matches public chapter officers card (square tile, cover crop). */
export function officerPhotoBackgroundStyle(o: OfficerPhotoFraming): CSSProperties {
  const { x, y, z, url } = clampOfficerFraming(o);
  return {
    backgroundImage: `url(${url})`,
    backgroundSize: z > 100 ? `${z}%` : 'cover',
    backgroundPosition: `${x}% ${y}%`,
    backgroundRepeat: 'no-repeat',
  };
}
