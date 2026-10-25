import { cleanImageUrls, DEFAULT_MAX_IMAGE_URLS, parseImageUrls, serializeImageUrls } from '@/lib/imageUrls';

export const MAX_CAMPAIGN_IMAGES = DEFAULT_MAX_IMAGE_URLS;

export function cleanCampaignImageUrls(value: unknown): string[] {
  return cleanImageUrls(value, MAX_CAMPAIGN_IMAGES);
}

export function parseCampaignImageUrls(value: unknown, fallbackUrl?: unknown): string[] {
  const parsed = parseImageUrls(value, MAX_CAMPAIGN_IMAGES);
  if (parsed.length > 0) return parsed;
  return cleanCampaignImageUrls(fallbackUrl ? [fallbackUrl] : []);
}

export function serializeCampaignImageUrls(value: unknown): string {
  return serializeImageUrls(value, MAX_CAMPAIGN_IMAGES);
}

