import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import {
  ADMIN_ACCOUNT_ROLES,
  ADMIN_ACCOUNT_STATUSES,
  DEFAULT_ADMIN_ACCOUNT_ROLE,
  DEFAULT_ADMIN_ACCOUNT_STATUS,
  type AdminAccountRole,
  type AdminAccountStatus,
} from '@/lib/adminAccountConfig';
import { cleanEmail, cleanText, isValidEmail, validatePasswordRule } from '@/lib/validation';

export interface AdminAccountRow {
  id: number;
  username: string;
  name: string;
  email: string;
  role: AdminAccountRole;
  status: AdminAccountStatus;
  created_at: string;
  updated_at?: string | null;
}

export interface AdminAccountAuthRow extends AdminAccountRow {
  password_hash: string;
}

type CountRow = { c?: number; count?: number };

export class AdminAccountError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'AdminAccountError';
    this.status = status;
  }
}

export function isAdminAccountError(error: unknown): error is AdminAccountError {
  return error instanceof AdminAccountError;
}

const ACTIVE_STATUS_SQL = `
  CASE
    WHEN LOWER(TRIM(COALESCE(status, ''))) = 'inactive' THEN 'Inactive'
    ELSE 'Active'
  END
`;

const ADMIN_SELECT_BASE = `
  SELECT
    id,
    username,
    COALESCE(NULLIF(TRIM(name), ''), username) AS name,
    COALESCE(NULLIF(TRIM(email), ''), CONCAT('admin-', id, '@admin.local')) AS email,
    CASE
      WHEN role IN ('Super Admin', 'Finance Admin', 'Communications Admin', 'Membership Admin') THEN role
      ELSE '${DEFAULT_ADMIN_ACCOUNT_ROLE}'
    END AS role,
    ${ACTIVE_STATUS_SQL} AS status,
    created_at,
    updated_at
  FROM admins
`;

async function countQuery(sql: string, params: Array<string | number> = []) {
  const rows = await query<CountRow>(sql, params);
  return Number(rows[0]?.c ?? rows[0]?.count ?? 0);
}

async function columnExists(columnName: string) {
  const count = await countQuery(
    `SELECT COUNT(*) AS c
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'admins'
       AND COLUMN_NAME = ?`,
    [columnName],
  );
  return count > 0;
}

async function indexExists(indexName: string) {
  const count = await countQuery(
    `SELECT COUNT(*) AS c
     FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'admins'
       AND INDEX_NAME = ?`,
    [indexName],
  );
  return count > 0;
}

async function hasUniqueEmailIndex() {
  const count = await countQuery(
    `SELECT COUNT(*) AS c
     FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'admins'
       AND COLUMN_NAME = 'email'
       AND NON_UNIQUE = 0`,
  );
  return count > 0;
}

function normalizeRole(value: unknown): AdminAccountRole {
  const text = cleanText(value, 64).toLowerCase();
  if (!text) return DEFAULT_ADMIN_ACCOUNT_ROLE;
  const matched = ADMIN_ACCOUNT_ROLES.find((role) => role.toLowerCase() === text);
  return matched ?? DEFAULT_ADMIN_ACCOUNT_ROLE;
}

function normalizeStatus(value: unknown): AdminAccountStatus {
  const text = cleanText(value, 32).toLowerCase();
  const matched = ADMIN_ACCOUNT_STATUSES.find((status) => status.toLowerCase() === text);
  return matched ?? DEFAULT_ADMIN_ACCOUNT_STATUS;
}

async function ensureAdminAccountConstraints() {
  if (!(await hasUniqueEmailIndex()) && !(await indexExists('admins_email_unique'))) {
    await query('ALTER TABLE admins ADD UNIQUE KEY admins_email_unique (email)');
  }
}

async function normalizeLegacyAdminRows() {
  await query(
    `UPDATE admins
     SET name = COALESCE(NULLIF(TRIM(name), ''), username)`,
  );

  await query(
    `UPDATE admins
     SET email = CASE
       WHEN email IS NULL OR TRIM(email) = '' THEN
         CASE
           WHEN username REGEXP '^[^[:space:]@]+@[^[:space:]@]+\\.[^[:space:]@]+$' THEN LOWER(TRIM(username))
           ELSE CONCAT('admin-', id, '@admin.local')
         END
       ELSE LOWER(TRIM(email))
     END`,
  );

  await query(
    `UPDATE admins
     SET role = CASE
       WHEN role IN ('Super Admin', 'Finance Admin', 'Communications Admin', 'Membership Admin') THEN role
       ELSE '${DEFAULT_ADMIN_ACCOUNT_ROLE}'
     END`,
  );

  await query(
    `UPDATE admins
     SET status = ${ACTIVE_STATUS_SQL}`,
  );

  await query('ALTER TABLE admins MODIFY COLUMN name VARCHAR(160) NOT NULL');
  await query('ALTER TABLE admins MODIFY COLUMN email VARCHAR(255) NOT NULL');
  await query(
    `ALTER TABLE admins
     MODIFY COLUMN role VARCHAR(64) NOT NULL DEFAULT '${DEFAULT_ADMIN_ACCOUNT_ROLE}'`,
  );
  await query(
    `ALTER TABLE admins
     MODIFY COLUMN status VARCHAR(16) NOT NULL DEFAULT '${DEFAULT_ADMIN_ACCOUNT_STATUS}'`,
  );
}

export async function migrateAdminAccountsIfNeeded() {
  if (!(await columnExists('name'))) {
    await query('ALTER TABLE admins ADD COLUMN name VARCHAR(160) NULL AFTER username');
  }

  if (!(await columnExists('email'))) {
    await query('ALTER TABLE admins ADD COLUMN email VARCHAR(255) NULL AFTER name');
  }

  if (!(await columnExists('role'))) {
    await query(
      `ALTER TABLE admins
       ADD COLUMN role VARCHAR(64) NOT NULL DEFAULT '${DEFAULT_ADMIN_ACCOUNT_ROLE}' AFTER email`,
    );
  }

  if (!(await columnExists('status'))) {
    await query(
      `ALTER TABLE admins
       ADD COLUMN status VARCHAR(16) NOT NULL DEFAULT '${DEFAULT_ADMIN_ACCOUNT_STATUS}' AFTER role`,
    );
  }

  if (!(await columnExists('updated_at'))) {
    await query(
      `ALTER TABLE admins
       ADD COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at`,
    );
  }

  await normalizeLegacyAdminRows();
  await ensureAdminAccountConstraints();
}

async function ensureEmailAvailable(email: string, excludeId?: number) {
  const rows = await query<{ id: number }>(
    `SELECT id
     FROM admins
     WHERE LOWER(email) = LOWER(?)
       ${excludeId ? 'AND id <> ?' : ''}
     LIMIT 1`,
    excludeId ? [email, excludeId] : [email],
  );

  if (rows.length > 0) {
    throw new AdminAccountError('Another administrator is already using that email address.', 409);
  }
}

async function ensureUsernameAvailable(username: string, excludeId?: number) {
  const rows = await query<{ id: number }>(
    `SELECT id
     FROM admins
     WHERE LOWER(username) = LOWER(?)
       ${excludeId ? 'AND id <> ?' : ''}
     LIMIT 1`,
    excludeId ? [username, excludeId] : [username],
  );

  if (rows.length > 0) {
    throw new AdminAccountError('Another administrator is already using that login identifier.', 409);
  }
}

async function countOtherActiveAdmins(excludeId: number) {
  return countQuery(
    `SELECT COUNT(*) AS c
     FROM admins
     WHERE id <> ?
       AND ${ACTIVE_STATUS_SQL} = 'Active'`,
    [excludeId],
  );
}

function prepareBasePayload(input: {
  name?: unknown;
  email?: unknown;
  role?: unknown;
  status?: unknown;
  username?: unknown;
}, options?: { fallbackRole?: AdminAccountRole }) {
  const name = cleanText(input.name, 160);
  const email = cleanEmail(input.email, 255);
  const role = cleanText(input.role, 64) ? normalizeRole(input.role) : (options?.fallbackRole ?? DEFAULT_ADMIN_ACCOUNT_ROLE);
  const status = normalizeStatus(input.status);
  const username = cleanText(input.username, 100) || email;

  if (!name) {
    throw new AdminAccountError('Name is required.');
  }

  if (!email || !isValidEmail(email)) {
    throw new AdminAccountError('A valid email address is required.');
  }

  if (!username) {
    throw new AdminAccountError('A login identifier is required.');
  }

  return { name, email, role, status, username };
}

function preparePassword(passwordValue: unknown, required: boolean) {
  const password = String(passwordValue ?? '');
  if (!password) {
    if (required) {
      throw new AdminAccountError('Password is required.');
    }
    return '';
  }

  const passwordError = validatePasswordRule(password);
  if (passwordError) {
    throw new AdminAccountError(passwordError);
  }

  return password;
}

export async function listAdminAccounts() {
  await migrateAdminAccountsIfNeeded();
  return query<AdminAccountRow>(`${ADMIN_SELECT_BASE} ORDER BY created_at DESC, id DESC`);
}

export async function getAdminAccountById(id: number) {
  await migrateAdminAccountsIfNeeded();
  const rows = await query<AdminAccountRow>(`${ADMIN_SELECT_BASE} WHERE id = ? LIMIT 1`, [id]);
  return rows[0] ?? null;
}

export async function findAdminAccountByLogin(identifier: string) {
  await migrateAdminAccountsIfNeeded();
  const rows = await query<AdminAccountAuthRow>(
    `
      SELECT
        id,
        username,
        password_hash,
        COALESCE(NULLIF(TRIM(name), ''), username) AS name,
        COALESCE(NULLIF(TRIM(email), ''), CONCAT('admin-', id, '@admin.local')) AS email,
        CASE
          WHEN role IN ('Super Admin', 'Finance Admin', 'Communications Admin', 'Membership Admin') THEN role
          ELSE '${DEFAULT_ADMIN_ACCOUNT_ROLE}'
        END AS role,
        ${ACTIVE_STATUS_SQL} AS status,
        created_at,
        updated_at
      FROM admins
      WHERE LOWER(username) = LOWER(?)
         OR LOWER(email) = LOWER(?)
      LIMIT 1
    `,
    [identifier, identifier],
  );

  return rows[0] ?? null;
}

export async function createAdminAccount(input: {
  name?: unknown;
  email?: unknown;
  password?: unknown;
  role?: unknown;
  status?: unknown;
  username?: unknown;
}) {
  await migrateAdminAccountsIfNeeded();

  const { name, email, role, status, username } = prepareBasePayload(input);
  const password = preparePassword(input.password, true);

  await ensureEmailAvailable(email);
  await ensureUsernameAvailable(username);

  const passwordHash = await bcrypt.hash(password, 10);
  await query(
    `INSERT INTO admins (username, password_hash, name, email, role, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [username, passwordHash, name, email, role, status],
  );

  const rows = await query<AdminAccountRow>(`${ADMIN_SELECT_BASE} WHERE LOWER(email) = LOWER(?) LIMIT 1`, [email]);
  return rows[0] ?? null;
}

export async function updateAdminAccount(
  id: number,
  input: {
    name?: unknown;
    email?: unknown;
    password?: unknown;
    role?: unknown;
    status?: unknown;
    username?: unknown;
  },
  currentAdminId?: number | null,
) {
  await migrateAdminAccountsIfNeeded();

  const existing = await getAdminAccountById(id);
  if (!existing) {
    throw new AdminAccountError('Administrator account not found.', 404);
  }

  const { name, email, role, status, username } = prepareBasePayload(input, { fallbackRole: existing.role });
  const password = preparePassword(input.password, false);

  if (currentAdminId === id && status === 'Inactive') {
    throw new AdminAccountError('You cannot deactivate your own account.');
  }

  if (existing.status === 'Active' && status === 'Inactive') {
    const otherActiveAdmins = await countOtherActiveAdmins(id);
    if (otherActiveAdmins < 1) {
      throw new AdminAccountError('At least one active administrator must remain.');
    }
  }

  await ensureEmailAvailable(email, id);
  await ensureUsernameAvailable(username, id);

  if (password) {
    const passwordHash = await bcrypt.hash(password, 10);
    await query(
      `UPDATE admins
       SET username = ?, name = ?, email = ?, role = ?, status = ?, password_hash = ?
       WHERE id = ?`,
      [username, name, email, role, status, passwordHash, id],
    );
  } else {
    await query(
      `UPDATE admins
       SET username = ?, name = ?, email = ?, role = ?, status = ?
       WHERE id = ?`,
      [username, name, email, role, status, id],
    );
  }

  return getAdminAccountById(id);
}

export async function deleteAdminAccount(id: number, currentAdminId?: number | null) {
  await migrateAdminAccountsIfNeeded();

  const existing = await getAdminAccountById(id);
  if (!existing) {
    throw new AdminAccountError('Administrator account not found.', 404);
  }

  if (currentAdminId === id) {
    throw new AdminAccountError('You cannot delete your own account.');
  }

  if (existing.status === 'Active') {
    const otherActiveAdmins = await countOtherActiveAdmins(id);
    if (otherActiveAdmins < 1) {
      throw new AdminAccountError('At least one active administrator must remain.');
    }
  }

  await query('DELETE FROM admins WHERE id = ?', [id]);
}
