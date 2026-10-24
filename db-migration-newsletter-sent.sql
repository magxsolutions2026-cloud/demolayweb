USE demolayweb;

ALTER TABLE news
  ADD COLUMN newsletter_sent_at TIMESTAMP NULL DEFAULT NULL AFTER published_at;
