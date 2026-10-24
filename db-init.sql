-- Run in XAMPP phpMyAdmin or mysql CLI:
-- 1. Create database (if not already):
--     CREATE DATABASE demolayweb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- 2. Use database:
--     USE demolayweb;

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(64) NOT NULL DEFAULT 'Super Admin',
  status VARCHAR(16) NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  event_time VARCHAR(64) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(32) NOT NULL DEFAULT 'activity',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS officers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  photo_url VARCHAR(512),
  photo_pos_x TINYINT UNSIGNED NOT NULL DEFAULT 50,
  photo_pos_y TINYINT UNSIGNED NOT NULL DEFAULT 45,
  photo_zoom TINYINT UNSIGNED NOT NULL DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS petitioners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  age INT,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  school VARCHAR(255),
  reason TEXT,
  status ENUM('Pending', 'Approved', 'Declined') DEFAULT 'Pending',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  date_subscribed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS landing_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section VARCHAR(100) NOT NULL UNIQUE,
  content JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gallery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image_url VARCHAR(512) NOT NULL,
  caption TEXT,
  is_published TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  summary TEXT,
  content LONGTEXT,
  image_urls JSON NULL,
  is_published TINYINT(1) DEFAULT 1,
  published_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  newsletter_sent_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Optional seed admin (you can store manually with the register API below):
-- INSERT INTO admins (username, password_hash, name, email, role, status)
-- VALUES ('admin', '$2a$10$...', 'Primary Administrator', 'admin@admin.local', 'Super Admin', 'Active');

-- Demo content (events, officers, gallery, news, landing + theme): import db-seed.sql after this file.
