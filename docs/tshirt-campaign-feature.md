# T-Shirt Fundraising Campaign Feature

## Overview

This feature adds public T-shirt fundraising campaigns to the chapter feed and records every submitted order for admin review.

## Public Flow

1. An admin creates a campaign with `campaign_type = tshirt`.
2. Active T-shirt campaigns automatically appear in the home page chapter feed.
3. Brothers can open the campaign card, review the campaign details, choose a shirt size, set quantity, and submit an order.
4. The system validates the order window, size, quantity, and buyer information before saving the order.

## Admin Flow

1. Admins manage campaigns from the Chapter Funds workspace.
2. Campaigns can now be marked as `general` or `tshirt`.
3. T-shirt campaigns support:
   - Public slug
   - Feed summary
   - Long description
   - Cover image URL
   - Unit price
   - Available sizes
4. The Chapter Funds workspace now includes a `T-shirt orders` tab with:
   - Total amount collected
   - Number of submitted orders
   - Total shirts requested
   - Size breakdown
   - Search and campaign filtering
   - Order list with buyer, size, quantity, and totals

## Reporting Behavior

- Campaign raised totals now include:
  - Manual linked `fund_sources`
  - Recorded `campaign_orders`
- Chapter-wide funds summary now includes T-shirt order revenue in:
  - Total raised
  - Monthly raised trend
  - Source-type distribution as `merchandise`

## Database Changes

### Updated `campaigns` table

Added columns:

- `slug`
- `campaign_type`
- `summary`
- `description`
- `cover_image_url`
- `unit_price`
- `size_options`

### New `campaign_orders` table

Stores:

- Campaign reference
- Brother name
- Email
- Phone
- Shirt size
- Quantity
- Unit price snapshot
- Total amount
- Notes
- Created timestamp

## Key Routes

### Public

- `POST /api/campaigns/[slug]/orders`

### Admin

- `GET /api/admin/funds/campaigns`
- `POST /api/admin/funds/campaigns`
- `GET /api/admin/funds/campaigns/[id]`
- `PUT /api/admin/funds/campaigns/[id]`
- `DELETE /api/admin/funds/campaigns/[id]`
- `GET /api/admin/funds/orders`
- `GET /api/admin/funds/summary`

## Setup

Run these SQL files on the database:

1. `db-migration-funds.sql`
2. `db-migration-tshirt-campaign-orders.sql`

Optional sample data:

3. `db-seed-funds.sql`

## Notes

- T-shirt campaigns only accept orders while the campaign is `active` and the current date is within the configured start and end dates.
- Campaigns with recorded orders cannot be deleted from the admin UI.
- Validation passed with:
  - `./node_modules/.bin/eslint`
  - `./node_modules/.bin/tsc --noEmit`
