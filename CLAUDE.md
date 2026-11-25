@AGENTS.md

# Project

Website and admin dashboard for DeMolay T. De Leon Chapter No. 47. Next.js 16.2 (App Router), React 19, TypeScript, Tailwind v4.

## Commands

- `npm run dev` / `npm run build` / `npm run lint`
- No test suite. Check changes with `npm run build` and `npm run lint`.

## Layout

- `app/(site)/` – public pages
- `app/admin/` – admin dashboard (`AdminDashboardClient.tsx`, `admin-theme.css`)
- `app/api/` – public routes; `app/api/admin/` – admin-only routes
- `components/` – public components; `components/site/`; `components/admin/` (with `layout/`, `funds/`)
- `lib/` – server helpers
- root `db-*.sql` – schema, migrations and seeds, applied by hand

## Conventions

- Run DB queries through `query()` in `lib/db.ts` (`pg` on Supabase Postgres, mysql-style `?` placeholders). Type parsers return COUNT as number, JSON as string, DATE as `'YYYY-MM-DD'` string.
- Admin routes start with `await requireAdmin(request)` or `requireAdminSession` from `lib/auth.ts` (`admin_session` cookie).
- Clean request input with `lib/validation.ts` (`cleanText`, `cleanLongText`, ...).
- Uploads go to the Supabase Storage `uploads` bucket (`app/api/admin/upload/route.ts`).
- Emails use nodemailer (`lib/newsletterEmail.ts`, `lib/petitionerApprovalEmail.ts`).

## Env vars (names only)

DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SMTP_HOST, SMTP_USER, SMTP_PASS, NEWSLETTER_FROM, NEWSLETTER_REPLY_TO, PETITIONER_CONSENT_FROM, PETITIONER_CONSENT_REPLY_TO, SITE_URL, NEXT_PUBLIC_SITE_URL, ADMIN_SETUP_KEY

## Design

Brand palette: maroon `#730e1b`, gold `#d4af37`, obsidian `#0a0a0a`. Reuse the CSS variables in `app/globals.css` and `components/ThemeProvider.tsx` before adding new ones.

## Notes

The README's MySQL/XAMPP section is outdated. Postgres is the source of truth.
