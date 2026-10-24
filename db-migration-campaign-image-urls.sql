USE demolayweb;

ALTER TABLE campaigns
  ADD COLUMN image_urls JSON NULL AFTER cover_image_url;

