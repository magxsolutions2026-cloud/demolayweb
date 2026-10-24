/** T. De Leon Chapter — meeting place (Google Maps pin from this full string + Plus Code) */
export const LODGE_ADDRESS =
  'Isabela Lodge No. 60, 4VWQ+FJ3, Rizal St, Ilagan City, Isabela' as const;

const encodedAddress = encodeURIComponent(LODGE_ADDRESS);

/** Opens in Google Maps at the geocoded lodge / Rizal St location. */
export const googleMapsLodgeUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

/**
 * Embedded map: `q` is the place query so Google pins the listing (coords alone pointed at the wrong spot).
 * No API key.
 */
export const googleMapsEmbedSrc = `https://www.google.com/maps?q=${encodedAddress}&hl=en&z=17&output=embed`;

/** Opens the verified Google Street View panorama for the lodge frontage — no API key. */
export const googleStreetViewOpenUrl =
  'https://www.google.com/maps/@17.1462385,121.8891406,3a,75y,242.37h,83.27t/data=!3m7!1e1!3m5!1sNonXxO3Vd76i097Zbe_NXA!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D6.727530657989931%26panoid%3DNonXxO3Vd76i097Zbe_NXA%26yaw%3D242.3674920095054!7i16384!8i8192?entry=ttu&g_ep=EgoyMDI2MDQwNy4wIKXMDSoASAFQAw%3D%3D';
