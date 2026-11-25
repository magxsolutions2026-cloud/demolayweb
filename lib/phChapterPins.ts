/**
 * Philippine DeMolay chapters per province, ESTIMATED for visualization only.
 * Read from the "Philippine DeMolay Chapters: 113" map (as of February 2023): each colored province
 * becomes one pin at its center, with its legend level as `count` (5 means "5 or more").
 * Positions were matched to real coordinates by landmark fit and snapped to land; they are approximate.
 */
export interface ChapterPin {
  lat: number;
  lon: number;
  /** Chapters in the province, 1–5 (5 = five or more). */
  count: number;
  /** Our own province; drawn in gold on Ilagan, Isabela. */
  home?: true;
}

export const PH_CHAPTER_PINS: ChapterPin[] = [
  { lat: 19.21, lon: 121.58, count: 1 },
  { lat: 18.37, lon: 122.2, count: 1 },
  { lat: 17.94, lon: 121.81, count: 1 },
  { lat: 16.87, lon: 120.63, count: 1 },
  { lat: 17.148, lon: 121.889, count: 5, home: true }, // Isabela, pinned on Ilagan
  { lat: 16.18, lon: 121.35, count: 1 },
  { lat: 15.74, lon: 120.68, count: 4 },
  { lat: 15.39, lon: 120.56, count: 1 },
  { lat: 15.09, lon: 120.41, count: 3 },
  { lat: 14.87, lon: 121.06, count: 2 },
  { lat: 14.3, lon: 121.6, count: 1 },
  { lat: 14.53, lon: 120.5, count: 2 },
  { lat: 14.03, lon: 121.73, count: 1 },
  { lat: 14.07, lon: 120.94, count: 5 },
  { lat: 14.05, lon: 121.28, count: 5 },
  { lat: 13.73, lon: 121.13, count: 2 },
  { lat: 13.56, lon: 123.19, count: 2 },
  { lat: 13.08, lon: 123.6, count: 1 },
  { lat: 12.69, lon: 121.01, count: 1 },
  { lat: 11.7, lon: 119.93, count: 1 },
  { lat: 10.77, lon: 122.33, count: 1 },
  { lat: 10.53, lon: 124.83, count: 2 },
  { lat: 9.94, lon: 123.01, count: 2 },
  { lat: 9.83, lon: 123.9, count: 2 },
  { lat: 9.43, lon: 118.43, count: 1 },
  { lat: 9.7, lon: 124.2, count: 1 },
  { lat: 9.17, lon: 123.0, count: 1 },
  { lat: 8.57, lon: 123.6, count: 1 },
  { lat: 7.91, lon: 125.71, count: 1 },
  { lat: 7.9, lon: 123.73, count: 2 },
  { lat: 7.8, lon: 124.5, count: 2 },
  { lat: 7.65, lon: 122.88, count: 1 },
  { lat: 7.63, lon: 123.27, count: 4 },
  { lat: 7.6, lon: 122.33, count: 2 },
  { lat: 7.17, lon: 125.02, count: 3 },
  { lat: 7.0, lon: 124.37, count: 1 },
  { lat: 7.03, lon: 122.1, count: 4 },
  { lat: 6.43, lon: 125.5, count: 1 },
  { lat: 6.49, lon: 125.41, count: 3 },
  { lat: 5.91, lon: 122.05, count: 1 },
  { lat: 6.03, lon: 124.77, count: 1 },
  { lat: 5.97, lon: 124.97, count: 2 },
  { lat: 5.7, lon: 125.37, count: 1 },
  { lat: 5.31, lon: 121.16, count: 2 },
];
