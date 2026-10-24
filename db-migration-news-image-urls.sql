USE demolayweb;

ALTER TABLE news
  ADD COLUMN image_urls JSON NULL AFTER content;

