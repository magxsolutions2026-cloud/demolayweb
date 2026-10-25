import type { AdminAccountStatus } from '@/lib/adminAccountConfig';

export type LandingSection =
  | 'funds'
  | 'events'
  | 'officers'
  | 'news'
  | 'sirKnights'
  | 'petitioners'
  | 'subscribers'
  | 'accounts';

export type EventCategory = 'important' | 'formal' | 'activity';

export interface EventItem {
  id: number;
  title: string;
  event_date: string;
  event_time: string;
  location: string;
  description: string;
  category?: string;
}

export interface OfficerItem {
  id: number;
  name: string;
  position: string;
  photo_url: string;
  photo_pos_x?: number;
  photo_pos_y?: number;
  photo_zoom?: number;
}

export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  image_urls?: string[];
  is_published: number;
  published_at?: string;
}

export interface PetitionerItem {
  id: number;
  name: string;
  age: number;
  email: string;
  phone: string;
  address: string;
  school: string;
  reason: string;
  status: string;
  /** From DB `submitted_at` */
  submitted_at?: string;
}

export interface SubscriberItem {
  id: number;
  email: string;
  date_subscribed: string;
}

export interface CampaignOrderItem {
  id: number;
  campaign_id?: number;
  campaign_name?: string;
  campaign_slug?: string | null;
  brother_name: string;
  email: string;
  phone?: string | null;
  shirt_size: string;
  quantity: number | string;
  unit_price?: number | string;
  total_amount?: number | string;
  notes?: string | null;
  created_at: string;
}

export interface AdminUserItem {
  id: number;
  username: string;
  name: string;
  email: string;
  status: AdminAccountStatus;
  created_at: string;
  updated_at?: string | null;
}

export interface LandingData {
  hero?: { title?: string; subtitle?: string; cta?: string; /** Public URL, e.g. /uploads/… */ logo_url?: string };
  about?: { text?: string };
}

export interface NavItem {
  id: LandingSection;
  label: string;
}

export interface NavGroup {
  id: 'chapterMembers';
  label: string;
  children: NavItem[];
}

export type NavSection = NavItem | NavGroup;
