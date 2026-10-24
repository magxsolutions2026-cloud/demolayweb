-- Sample chapter funds data (DeMolay demo). Run after db-migration-funds.sql.
-- Replaces existing rows in funds tables only.

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE campaign_orders;
TRUNCATE TABLE fund_activity;
TRUNCATE TABLE fund_sources;
TRUNCATE TABLE disbursements;
TRUNCATE TABLE campaigns;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO campaigns (
  id, name, slug, goal_amount, start_date, end_date, status, campaign_type, summary, description, cover_image_url, image_urls, unit_price, size_options
) VALUES
(1, 'Annual Leadership Camp 2026', NULL, 150000.00, '2026-01-10', '2026-09-30', 'active', 'general', NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'Scholarship Fund Drive', NULL, 80000.00, '2025-09-01', '2025-12-20', 'completed', 'general', NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'Chapter Facility Refresh', NULL, 50000.00, '2026-03-01', '2026-12-31', 'draft', 'general', NULL, NULL, NULL, NULL, NULL, NULL),
(4, 'Brotherhood T-Shirt Drive 2026', 'brotherhood-t-shirt-drive-2026', 30000.00, '2026-03-15', '2026-06-15', 'active', 'tshirt',
 'Order the official chapter shirt and help fund youth programs, travel, and chapter activities.',
 'This limited-run chapter shirt fundraiser supports program travel, leadership materials, and service projects. Brothers can pick a preferred size, place multiple shirts in one order, and every order is recorded in the admin dashboard automatically.',
 '/logo.png',
 JSON_ARRAY('/logo.png', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&h=800&fit=crop&q=80', 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1200&h=800&fit=crop&q=80'),
 650.00, '["S","M","L","XL","2XL"]');

INSERT INTO fund_sources (title, amount, source_type, source_specify, source_date, description, campaign_id) VALUES
('Member dues — Q1 collection', 18500.00, 'contributions', NULL, '2026-01-08', 'Chapter operating support from members.', NULL),
('Founding Patrons dinner', 42000.00, 'events', NULL, '2026-02-14', 'Ticket sales and silent auction.', 1),
('Alumni association pledge', 25000.00, 'donations', NULL, '2026-02-01', 'Annual pledge toward programs.', NULL),
('Local Masonic lodge sponsorship', 15000.00, 'sponsors', NULL, '2026-02-20', 'Sponsor banner + opening ceremony.', 1),
('Youth leadership workshop fees', 12800.00, 'events', NULL, '2026-03-01', 'Registration surplus after venue costs.', 1),
('Community fun run net proceeds', 33200.00, 'events', NULL, '2025-10-12', 'Charity run co-hosted with Rotary.', 2),
('Parent council donation', 12000.00, 'donations', NULL, '2025-11-05', 'General chapter fund.', 2),
('Equipment & supplies (misc)', 4500.00, 'other', 'Uniform & ritual supply co-op', '2026-01-30', 'Chapter co-op purchases.', NULL),
('Corporate matching — Tech PH Inc.', 20000.00, 'sponsors', NULL, '2026-03-10', 'CSR matching for scholarship line.', 1),
('Sunday service collection', 8750.00, 'donations', NULL, '2026-03-15', 'Designated for outreach.', NULL);

INSERT INTO campaign_orders (campaign_id, brother_name, email, phone, shirt_size, quantity, unit_price, total_amount, notes, created_at) VALUES
(4, 'John Ramirez', 'john.ramirez@example.com', '09171234567', 'L', 2, 650.00, 1300.00, 'Please reserve for next stated meeting.', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(4, 'Miguel Santos', 'miguel.santos@example.com', '09179876543', 'XL', 1, 650.00, 650.00, NULL, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(4, 'Paolo Reyes', 'paolo.reyes@example.com', '09175550123', 'M', 3, 650.00, 1950.00, 'Need one extra for my younger brother.', DATE_SUB(NOW(), INTERVAL 1 DAY));

INSERT INTO disbursements (title, amount, category, disbursement_date, purpose) VALUES
('Venue deposit — leadership camp', 22000.00, 'Events', '2026-02-05', 'Non-refundable deposit for retreat site.'),
('Scholarship awards (4 recipients)', 24000.00, 'Charity', '2025-12-10', 'Semester grants from Scholarship Fund.'),
('Chapter supplies & materials', 6800.00, 'Supplies', '2026-01-18', 'Ritual books, cords, and printing.'),
('Transport — provincial conclave', 9500.00, 'Travel', '2026-02-28', 'Bus rental for delegates.'),
('Utilities — chapter hall', 4200.00, 'Utilities', '2026-03-01', 'Electric and water (shared building).'),
('Catering — Founding Patrons dinner', 18500.00, 'Events', '2026-02-14', 'Meal service for 120 guests.'),
('Insurance installment', 6000.00, 'Administrative', '2026-01-05', 'Annual liability policy.'),
('Sound system rental', 3500.00, 'Events', '2026-03-08', 'PA for installation ceremony.');

INSERT INTO fund_activity (action_type, message, created_at) VALUES
('campaign', 'Sample: Created campaign Annual Leadership Camp 2026', DATE_SUB(NOW(), INTERVAL 12 DAY)),
('fund_source', 'Sample: Added fund source Founding Patrons dinner (42000)', DATE_SUB(NOW(), INTERVAL 10 DAY)),
('disbursement', 'Sample: Recorded disbursement Venue deposit — leadership camp (22000)', DATE_SUB(NOW(), INTERVAL 8 DAY)),
('fund_source', 'Sample: Added fund source Corporate matching — Tech PH Inc. (20000)', DATE_SUB(NOW(), INTERVAL 5 DAY)),
('order', 'Sample: Recorded T-shirt order for Brotherhood T-Shirt Drive 2026: John Ramirez x2 (L)', DATE_SUB(NOW(), INTERVAL 4 DAY)),
('campaign', 'Sample: Updated campaign: Scholarship Fund Drive', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('order', 'Sample: Recorded T-shirt order for Brotherhood T-Shirt Drive 2026: Miguel Santos x1 (XL)', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('disbursement', 'Sample: Recorded disbursement Catering — Founding Patrons dinner (18500)', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('order', 'Sample: Recorded T-shirt order for Brotherhood T-Shirt Drive 2026: Paolo Reyes x3 (M)', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('fund_source', 'Sample: Added fund source Sunday service collection (8750)', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('disbursement', 'Sample: Recorded disbursement Sound system rental (3500)', NOW());
