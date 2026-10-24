-- Extend the existing chapter funds schema with T-shirt campaign metadata and recorded orders.
-- Run once on an existing database after db-migration-funds.sql:
--   mysql -u root -p demolayweb < db-migration-tshirt-campaign-orders.sql

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS slug VARCHAR(255) NULL UNIQUE AFTER name,
  ADD COLUMN IF NOT EXISTS campaign_type ENUM('general', 'tshirt') NOT NULL DEFAULT 'general' AFTER status,
  ADD COLUMN IF NOT EXISTS summary TEXT NULL AFTER campaign_type,
  ADD COLUMN IF NOT EXISTS description LONGTEXT NULL AFTER summary,
  ADD COLUMN IF NOT EXISTS cover_image_url VARCHAR(512) NULL AFTER description,
  ADD COLUMN IF NOT EXISTS image_urls JSON NULL AFTER cover_image_url,
  ADD COLUMN IF NOT EXISTS unit_price DECIMAL(12,2) NULL AFTER image_urls,
  ADD COLUMN IF NOT EXISTS size_options TEXT NULL AFTER unit_price;


CREATE TABLE IF NOT EXISTS campaign_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaign_id INT NOT NULL,
  brother_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(64) NULL,
  shirt_size VARCHAR(32) NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_campaign_orders_campaign (campaign_id, created_at),
  INDEX idx_campaign_orders_email (email),
  CONSTRAINT fk_campaign_orders_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE RESTRICT
);
