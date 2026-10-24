This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Admin login + MySQL (XAMPP)

1. Install extra deps:

```bash
npm install mysql2 bcryptjs nodemailer
```

2. Create `.env.local` in project root:

```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=demolayweb
ADMIN_SETUP_KEY=your-super-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=tdeleonchapter47@gmail.com
SMTP_PASS=your-16-character-gmail-app-password
PETITIONER_CONSENT_FROM="T. De Leon Chapter 47 <tdeleonchapter47@gmail.com>"
PETITIONER_CONSENT_REPLY_TO=tdeleonchapter47@gmail.com
NEWSLETTER_FROM="T. De Leon Chapter 47 <tdeleonchapter47@gmail.com>"
NEWSLETTER_REPLY_TO=tdeleonchapter47@gmail.com
SITE_URL=https://your-domain.example
```

For Gmail, `SMTP_PASS` should be a Gmail App Password, not your normal Gmail login password.

3. Run DB script in phpMyAdmin / MySQL CLI:

```sql
SOURCE db-init.sql;
```

If you already have an older `admins` table, you can also run:

```sql
SOURCE db-migration-admin-accounts.sql;
```

4. Create admin user (one-time):

```bash
curl -X POST http://localhost:3000/api/admin/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","name":"Primary Administrator","email":"admin@chapter.local","password":"YourSecurePass123","setupKey":"your-super-secret-key"}'
```

5. Visit `http://localhost:3000/admin` to login. The login form accepts either the admin email or the legacy username.

6. Logout with dashboard button.
