-- Chapter funds (non-profit transparency). Run after db-init.sql:
--   mysql -u root -p demolayweb < db-migration-funds.sql

CREATE TABLE IF NOT EXISTS campaigns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NULL UNIQUE,
  goal_amount DECIMAL(12,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('draft', 'active', 'completed') NOT NULL DEFAULT 'active',
  campaign_type ENUM('general', 'tshirt') NOT NULL DEFAULT 'general',
  summary TEXT NULL,
  description LONGTEXT NULL,
  cover_image_url VARCHAR(512) NULL,
  image_urls JSON NULL,
  unit_price DECIMAL(12,2) NULL,
  size_options TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS fund_sources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  source_type ENUM('donations', 'events', 'contributions', 'sponsors', 'other') NOT NULL DEFAULT 'donations',
  source_specify VARCHAR(255) NULL DEFAULT NULL,
  source_date DATE NOT NULL,
  description TEXT,
  campaign_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_fund_sources_date (source_date),
  INDEX idx_fund_sources_campaign (campaign_id),
  CONSTRAINT fk_fund_sources_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS disbursements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  category VARCHAR(64) NOT NULL,
  disbursement_date DATE NOT NULL,
  purpose TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_disbursements_date (disbursement_date),
  INDEX idx_disbursements_category (category)
);

CREATE TABLE IF NOT EXISTS fund_activity (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action_type VARCHAR(32) NOT NULL,
  message VARCHAR(512) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_fund_activity_created (created_at)
);
