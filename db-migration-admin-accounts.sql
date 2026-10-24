ALTER TABLE admins
  ADD COLUMN IF NOT EXISTS name VARCHAR(160) NULL AFTER username,
  ADD COLUMN IF NOT EXISTS email VARCHAR(255) NULL AFTER name,
  ADD COLUMN IF NOT EXISTS role VARCHAR(64) NOT NULL DEFAULT 'Super Admin' AFTER email,
  ADD COLUMN IF NOT EXISTS status VARCHAR(16) NOT NULL DEFAULT 'Active' AFTER role,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

UPDATE admins
SET name = COALESCE(NULLIF(TRIM(name), ''), username);

UPDATE admins
SET email = CASE
  WHEN email IS NULL OR TRIM(email) = '' THEN
    CASE
      WHEN username REGEXP '^[^[:space:]@]+@[^[:space:]@]+\\.[^[:space:]@]+$' THEN LOWER(TRIM(username))
      ELSE CONCAT('admin-', id, '@admin.local')
    END
  ELSE LOWER(TRIM(email))
END;

UPDATE admins
SET role = CASE
  WHEN role IN ('Super Admin', 'Finance Admin', 'Communications Admin', 'Membership Admin') THEN role
  ELSE 'Super Admin'
END;

UPDATE admins
SET status = CASE
  WHEN LOWER(TRIM(COALESCE(status, ''))) = 'inactive' THEN 'Inactive'
  ELSE 'Active'
END;

ALTER TABLE admins
  MODIFY COLUMN name VARCHAR(160) NOT NULL,
  MODIFY COLUMN email VARCHAR(255) NOT NULL,
  MODIFY COLUMN role VARCHAR(64) NOT NULL DEFAULT 'Super Admin',
  MODIFY COLUMN status VARCHAR(16) NOT NULL DEFAULT 'Active';

ALTER TABLE admins
  ADD UNIQUE KEY admins_email_unique (email);
