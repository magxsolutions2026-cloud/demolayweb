/** Shared framing for the hero video layers and their poster, so the poster lines up with the video exactly. */
export const HERO_VIDEO_FRAME_CLASS_NAME =
  'absolute inset-0 scale-100 drop-shadow-[0_32px_70px_rgba(0,0,0,0.88)] md:scale-[0.86] md:translate-y-5 md:drop-shadow-[0_42px_96px_rgba(0,0,0,0.9)]';
export const HERO_VIDEO_CLASS_NAME = `${HERO_VIDEO_FRAME_CLASS_NAME} h-full w-full object-cover object-center transition-opacity duration-300 md:object-contain`;

/** First frame of the idle video; shows instantly while the videos load. */
export const HERO_POSTER_SRC = '/hero-poster.webp';
