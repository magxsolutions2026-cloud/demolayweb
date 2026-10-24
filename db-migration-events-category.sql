-- Run once on existing databases (after db-init without category column):
--   mysql -u root -p demolayweb < db-migration-events-category.sql

USE demolayweb;

ALTER TABLE events
  ADD COLUMN category VARCHAR(32) NOT NULL DEFAULT 'activity' AFTER description;
