import { cleanImageUrls, DEFAULT_MAX_IMAGE_URLS, parseImageUrls, serializeImageUrls } from '@/lib/imageUrls';

export const MAX_NEWS_IMAGES = DEFAULT_MAX_IMAGE_URLS;

export function cleanNewsImageUrls(value: unknown): string[] {
  return cleanImageUrls(value, MAX_NEWS_IMAGES);
}

export function parseNewsImageUrls(value: unknown): string[] {
  return parseImageUrls(value, MAX_NEWS_IMAGES);
}

export function serializeNewsImageUrls(value: unknown): string {
  return serializeImageUrls(value, MAX_NEWS_IMAGES);
}
