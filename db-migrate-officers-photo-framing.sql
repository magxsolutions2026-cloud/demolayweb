-- Run once on existing databases (after db-init from before this feature):
--   mysql -u root -p demolayweb < db-migrate-officers-photo-framing.sql

USE demolayweb;

ALTER TABLE officers
  ADD COLUMN photo_pos_x TINYINT UNSIGNED NOT NULL DEFAULT 50 COMMENT '0-100 horizontal focal' AFTER photo_url,
  ADD COLUMN photo_pos_y TINYINT UNSIGNED NOT NULL DEFAULT 45 COMMENT '0-100 vertical focal' AFTER photo_pos_x,
  ADD COLUMN photo_zoom TINYINT UNSIGNED NOT NULL DEFAULT 100 COMMENT '100=cover, up to 200=tighter zoom' AFTER photo_pos_y;
