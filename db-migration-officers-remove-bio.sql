-- Run once on existing databases to remove the unused officer bio field:
--   mysql -u root -p demolayweb < db-migration-officers-remove-bio.sql

USE demolayweb;

SET @bio_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'officers'
    AND COLUMN_NAME = 'bio'
);

SET @drop_sql := IF(
  @bio_exists > 0,
  'ALTER TABLE officers DROP COLUMN bio',
  'SELECT ''officers.bio already removed'' AS message'
);

PREPARE stmt FROM @drop_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
