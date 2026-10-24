export const ADMIN_ACCOUNT_ROLES = [
  'Super Admin',
  'Finance Admin',
  'Communications Admin',
  'Membership Admin',
] as const;

export const ADMIN_ACCOUNT_STATUSES = ['Active', 'Inactive'] as const;

export type AdminAccountRole = (typeof ADMIN_ACCOUNT_ROLES)[number];
export type AdminAccountStatus = (typeof ADMIN_ACCOUNT_STATUSES)[number];

export const DEFAULT_ADMIN_ACCOUNT_ROLE: AdminAccountRole = 'Super Admin';
export const DEFAULT_ADMIN_ACCOUNT_STATUS: AdminAccountStatus = 'Active';
