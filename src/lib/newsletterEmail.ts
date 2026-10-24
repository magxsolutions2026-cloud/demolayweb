import 'server-only';

import nodemailer from 'nodemailer';

import { cleanEmail, cleanText, isValidEmail } from '@/lib/validation';

const DEFAULT_CHAPTER_EMAIL = 'tdeleonchapter47@gmail.com';
const DEFAULT_SMTP_HOST = 'smtp.gmail.com';
const DEFAULT_SMTP_PORT = 465;

export type NewsletterNews = {
  title: string;
  summary?: string | null;
  publishedAt?: string | Date | null;
};

export class NewsletterMailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NewsletterMailError';
  }
}

function readBooleanEnv(name: string, fallback: boolean) {
  const value = process.env[name];
  if (!value) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function readNumberEnv(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatDate(value?: string | Date | null) {
  const date = value ? new Date(value) : new Date();
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function getMailConfig() {
  const host = cleanText(process.env.SMTP_HOST, 255) || DEFAULT_SMTP_HOST;
  const port = readNumberEnv('SMTP_PORT', DEFAULT_SMTP_PORT);
  const secure = readBooleanEnv('SMTP_SECURE', port === 465);
  const user = cleanEmail(process.env.SMTP_USER || DEFAULT_CHAPTER_EMAIL, 255);
  const pass = String(process.env.SMTP_PASS ?? '').replace(/\s+/g, '');
  const replyTo = cleanEmail(process.env.NEWSLETTER_REPLY_TO || user || DEFAULT_CHAPTER_EMAIL, 255);
  const from = cleanText(process.env.NEWSLETTER_FROM, 255) || `T. De Leon Chapter 47 <${replyTo}>`;

  if (!user || !pass) {
    throw new NewsletterMailError(
      'Newsletter email is not configured. Add SMTP_USER and SMTP_PASS to .env.local before publishing news.',
    );
  }

  return { host, port, secure, user, pass, from, replyTo };
}

export async function sendNewsPublishedEmail({
  recipients,
  news,
  siteUrl,
}: {
  recipients: string[];
  news: NewsletterNews;
  siteUrl: string;
}) {
  const config = getMailConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  const safeRecipients = recipients
    .map((email) => cleanEmail(email, 255))
    .filter((email) => !!email && isValidEmail(email));

  if (safeRecipients.length === 0) {
    return { sent: 0, skipped: recipients.length };
  }

  const title = cleanText(news.title, 255) || 'Chapter news update';
  const summary = cleanText(news.summary || '', 1200);
  const trimmedSiteUrl = siteUrl.replace(/\/+$/, '');
  const newsUrl = `${trimmedSiteUrl}/news`;
  const publishedLabel = formatDate(news.publishedAt);

  let sent = 0;

  for (const email of safeRecipients) {
    try {
      await transporter.sendMail({
        from: config.from,
        replyTo: config.replyTo,
        to: email,
        subject: `New chapter update: ${title}`,
        text: [
          'Hello,',
          '',
          `A new chapter update was published on ${publishedLabel}.`,
          '',
          title,
          summary ? '' : undefined,
          summary || undefined,
          '',
          `Read the update: ${newsUrl}`,
          '',
          `This message was sent to ${email} because you subscribed to chapter updates.`,
          `To stop receiving these emails, reply to ${config.replyTo}.`,
          '',
          'T. De Leon Chapter 47',
        ]
          .filter(Boolean)
          .join('\n'),
        html: [
          '<p>Hello,</p>',
          `<p>A new chapter update was published on <strong>${publishedLabel}</strong>.</p>`,
          `<p><strong>${title}</strong></p>`,
          summary ? `<p>${summary}</p>` : '',
          `<p><a href="${newsUrl}">Read the update on the website</a></p>`,
          `<p>This message was sent to <strong>${email}</strong> because you subscribed to chapter updates.</p>`,
          `<p>To stop receiving these emails, reply to <a href="mailto:${config.replyTo}">${config.replyTo}</a>.</p>`,
          '<p>T. De Leon Chapter 47</p>',
        ]
          .filter(Boolean)
          .join(''),
        headers: {
          'List-Unsubscribe': `<mailto:${config.replyTo}>`,
        },
      });
      sent += 1;
    } catch (error) {
      console.error('Failed to send newsletter email', error);
      throw new NewsletterMailError('Newsletter emails could not be sent. Check SMTP settings and try again.');
    }
  }

  return { sent, skipped: recipients.length - safeRecipients.length };
}
