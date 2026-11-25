/**
 * Philippine provinces with DeMolay chapters, ESTIMATED for visualization only.
 * Read from the "Philippine DeMolay Chapters: 113" map (as of February 2023): each colored province
 * became a pin at its center, matched to real coordinates by landmark fit and snapped to land.
 * Pins closer than ~0.6° were merged so each area shows a single pin. Positions are approximate.
 */
export interface ChapterPin {
  lat: number;
  lon: number;
  /** Our own province; drawn with the chapter logo on Ilagan, Isabela. */
  home?: true;
}

export const PH_CHAPTER_PINS: ChapterPin[] = [
  { lat: 19.21, lon: 121.58 },
  { lat: 18.37, lon: 122.2 },
  { lat: 17.148, lon: 121.889, home: true }, // Isabela, pinned on Ilagan
  { lat: 16.87, lon: 120.63 },
  { lat: 16.18, lon: 121.35 },
  { lat: 15.74, lon: 120.68 },
  { lat: 15.09, lon: 120.41 },
  { lat: 14.87, lon: 121.06 },
  { lat: 14.3, lon: 121.6 },
  { lat: 14.07, lon: 120.94 },
  { lat: 13.56, lon: 123.19 },
  { lat: 13.08, lon: 123.6 },
  { lat: 12.69, lon: 121.01 },
  { lat: 11.7, lon: 119.93 },
  { lat: 10.77, lon: 122.33 },
  { lat: 10.53, lon: 124.83 },
  { lat: 9.94, lon: 123.01 },
  { lat: 9.83, lon: 123.9 },
  { lat: 9.43, lon: 118.43 },
  { lat: 9.17, lon: 123.0 },
  { lat: 8.57, lon: 123.6 },
  { lat: 7.91, lon: 125.71 },
  { lat: 7.8, lon: 124.5 },
  { lat: 7.63, lon: 123.27 },
  { lat: 7.6, lon: 122.33 },
  { lat: 7.17, lon: 125.02 },
  { lat: 7.03, lon: 122.1 },
  { lat: 7.0, lon: 124.37 },
  { lat: 6.49, lon: 125.41 },
  { lat: 5.97, lon: 124.97 },
  { lat: 5.91, lon: 122.05 },
  { lat: 5.31, lon: 121.16 },
];
