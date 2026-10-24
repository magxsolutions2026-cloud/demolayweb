-- Optional detail when source_type = 'other'. Run once:
--   mysql -u root -p demolayweb < db-migration-funds-source-specify.sql

ALTER TABLE fund_sources
  ADD COLUMN source_specify VARCHAR(255) NULL DEFAULT NULL
  AFTER source_type;
