-- Sample data for T. De Leon Chapter No. 47 (demolayweb)
-- Run after db-init.sql, with the same database:
--   mysql -u root -p demolayweb < db-seed.sql
-- Or in phpMyAdmin: import this file.
--
-- Replaces rows in events, officers, and news (demo reset).
-- Updates or inserts landing_content sections: hero, about, theme.

USE demolayweb;

SET NAMES utf8mb4;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE events;
TRUNCATE TABLE officers;
TRUNCATE TABLE news;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO landing_content (section, content) VALUES
  ('hero', JSON_OBJECT(
    'title', 'T. De Leon Chapter No. 47',
    'subtitle', 'Order of DeMolay — building leaders through brotherhood, civic service, and timeless values.',
    'cta', 'Join the Chapter'
  )),
  ('about', JSON_OBJECT(
    'text', 'T. De Leon Chapter No. 47 is a brotherhood where young men learn to lead, serve, and grow with purpose. Through meetings, ritual work, community service, and shared responsibility, our members build character, confidence, and lasting friendships. Whether you are discovering DeMolay for the first time or reconnecting with the chapter, you will find a place shaped by respect, tradition, and meaningful action.'
  )),
  ('theme', JSON_OBJECT(
    'primary_color', '#730e1b',
    'secondary_color', '#d4af37'
  ))
ON DUPLICATE KEY UPDATE content = VALUES(content);

INSERT INTO events (title, event_date, event_time, location, description, category) VALUES
  ('Spring Induction & Open House', '2026-04-12', '2:00 PM', 'Masonic Temple — Main Hall', 'Prospective members and families are invited to meet officers, tour the temple, and learn about the petitioning process.', 'important'),
  ('Community Blood Drive (Chapter Service)', '2026-04-26', '8:00 AM – 12:00 PM', 'City Civic Center', 'Joint service project with sister organizations. Volunteers arrive 30 minutes early for setup.', 'activity'),
  ('Ritual Proficiency Night', '2026-05-03', '7:00 PM', 'Chapter Room', 'Officers and members rehearse degrees and floor work. Dress: business casual.', 'formal'),
  ('Founders'' Day Commemoration', '2026-03-18', '6:30 PM', 'Masonic Temple', 'Annual observance honoring Frank S. Land and the founding ideals of the Order of DeMolay.', 'formal');

INSERT INTO officers (name, position, photo_url) VALUES
  ('Marcus A. Reyes', 'Master Councilor', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=750&fit=crop&q=80'),
  ('Julian C. Santos', 'Senior Councilor', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=750&fit=crop&q=80'),
  ('Ethan D. Villarin', 'Junior Councilor', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=750&fit=crop&q=80'),
  ('Noah K. Mendoza', 'Scribe', 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=600&h=750&fit=crop&q=80'),
  ('Gabriel L. Torres', 'Treasurer', 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=600&h=750&fit=crop&q=80'),
  ('Adrian P. Cruz', 'Chaplain', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=750&fit=crop&q=80');

INSERT INTO news (title, slug, summary, content, image_urls, is_published, published_at) VALUES
  (
    'Chapter opens petition period for 2026',
    'petition-period-2026',
    'Young men ages 12–21 may apply; information sessions scheduled in April.',
    '<p>We are accepting petitions for the spring term. Attend the Open House on April 12 for a walkthrough of expectations, uniforms, and the Dad Advisory Council.</p>',
    JSON_ARRAY(
      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&h=800&fit=crop&q=80'
    ),
    1,
    '2026-03-20 10:00:00'
  ),
  (
    'Service hours milestone reached',
    'service-hours-milestone',
    'Members contributed over 400 combined service hours this quarter.',
    '<p>From literacy drives to environmental projects, thank you to everyone who showed up. Special recognition goes to the Junior Councilor for coordination.</p>',
    JSON_ARRAY('https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=800&fit=crop&q=80'),
    1,
    '2026-03-15 14:30:00'
  ),
  (
    'Inter-chapter visit: fellowship and ritual exchange',
    'inter-chapter-visit-march',
    'We hosted brothers from neighboring chapters for a joint proficiency night.',
    '<p>Shared best practices for floor work and welcomed feedback from visiting Dad Advisors. More joint events are planned for the summer.</p>',
    JSON_ARRAY(
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=1200&h=800&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=1200&h=800&fit=crop&q=80'
    ),
    1,
    '2026-03-08 09:00:00'
  ),
  (
    'Reminder: proper attire for stated meetings',
    'dress-code-reminder',
    'Business casual minimum; full dress for degree work as announced by the Master Councilor.',
    '<p>When in doubt, ask the Senior Councilor before the meeting. Clean, respectful appearance reflects our values.</p>',
    NULL,
    1,
    '2026-03-01 16:00:00'
  );
