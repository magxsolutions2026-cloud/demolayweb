import 'server-only';

import { jsPDF } from 'jspdf';
import nodemailer from 'nodemailer';

import { cleanEmail, cleanText, isValidEmail } from '@/lib/validation';

const DEFAULT_CHAPTER_EMAIL = 'tdeleonchapter47@gmail.com';
const DEFAULT_SMTP_HOST = 'smtp.gmail.com';
const DEFAULT_SMTP_PORT = 465;

export type PetitionerApprovalRecipient = {
  id: number;
  name: string;
  age: number | null;
  email: string;
  phone?: string | null;
  address?: string | null;
  school?: string | null;
  reason?: string | null;
  submitted_at?: string | null;
};

export class PetitionerApprovalMailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PetitionerApprovalMailError';
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

function toFileSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'petitioner';
}

function getMailConfig() {
  const host = cleanText(process.env.SMTP_HOST, 255) || DEFAULT_SMTP_HOST;
  const port = readNumberEnv('SMTP_PORT', DEFAULT_SMTP_PORT);
  const secure = readBooleanEnv('SMTP_SECURE', port === 465);
  const user = cleanEmail(process.env.SMTP_USER || DEFAULT_CHAPTER_EMAIL, 255);
  const pass = String(process.env.SMTP_PASS ?? '').replace(/\s+/g, '');
  const replyTo = cleanEmail(process.env.PETITIONER_CONSENT_REPLY_TO || user || DEFAULT_CHAPTER_EMAIL, 255);
  const from =
    cleanText(process.env.PETITIONER_CONSENT_FROM, 255) || `T. De Leon Chapter 47 <${replyTo}>`;

  if (!user || !pass) {
    throw new PetitionerApprovalMailError(
      'Approval email is not configured. Add SMTP_USER and SMTP_PASS to .env.local before approving petitioners.',
    );
  }

  return { host, port, secure, user, pass, from, replyTo };
}

function buildParentConsentPdf(recipient: PetitionerApprovalRecipient, contactEmail: string) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 54;
  const maxWidth = pageWidth - margin * 2;
  let y = 58;

  const petitionerName = cleanText(recipient.name, 255) || '______________________________';
  const petitionerAge = recipient.age ?? null;
  const petitionerEmail = cleanEmail(recipient.email, 255);
  const petitionerPhone = cleanText(recipient.phone, 80) || '______________________________';
  const petitionerSchool = cleanText(recipient.school, 255) || '______________________________';
  const petitionerAddress = cleanText(recipient.address, 500) || '______________________________';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('T. De Leon Chapter 47', margin, y);
  y += 22;

  doc.setFontSize(14);
  doc.text('Parent / Guardian Consent Form', margin, y);
  y += 20;

  doc.setDrawColor(40, 40, 40);
  doc.line(margin, y, pageWidth - margin, y);
  y += 24;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const intro = doc.splitTextToSize(
    'Please print, complete, and sign this form. Return the signed copy to the chapter leadership to continue the petitioner approval process.',
    maxWidth,
  );
  doc.text(intro, margin, y);
  y += intro.length * 14 + 16;

  const fields: Array<[string, string]> = [
    ['Petitioner Name', petitionerName],
    ['Age', petitionerAge ? String(petitionerAge) : '______________________________'],
    ['Email', petitionerEmail || '______________________________'],
    ['Phone', petitionerPhone],
    ['School', petitionerSchool],
    ['Address', petitionerAddress],
    ['Approval Date', formatDate(new Date())],
    ['Submitted', formatDate(recipient.submitted_at)],
  ];

  doc.setFont('helvetica', 'bold');
  doc.text('Petitioner Information', margin, y);
  y += 18;

  doc.setFont('helvetica', 'normal');
  fields.forEach(([label, value]) => {
    const line = `${label}: ${value}`;
    const wrapped = doc.splitTextToSize(line, maxWidth);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 13 + 6;
  });

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Consent Statement', margin, y);
  y += 18;

  doc.setFont('helvetica', 'normal');
  const statement = doc.splitTextToSize(
    `I, ________________________________________, am the parent / legal guardian of ${petitionerName}. I give my consent for my child to continue the membership process and participate in the activities of T. De Leon Chapter 47, Order of DeMolay. I understand that chapter officers may contact me if additional information is needed.`,
    maxWidth,
  );
  doc.text(statement, margin, y);
  y += statement.length * 14 + 28;

  const signatureLines = [
    'Parent / Guardian Name: _________________________________________________',
    'Relationship to Petitioner: ______________________________________________',
    'Signature: _______________________________________________________________',
    'Date Signed: _____________________________________________________________',
    'Parent / Guardian Contact Number: ________________________________________',
  ];

  signatureLines.forEach((line) => {
    doc.text(line, margin, y);
    y += 24;
  });

  y += 8;
  const note = doc.splitTextToSize(
    `Questions or completed-form follow-up: ${contactEmail}`,
    maxWidth,
  );
  doc.text(note, margin, y);

  return Buffer.from(doc.output('arraybuffer'));
}

export async function sendPetitionerApprovalEmail(recipient: PetitionerApprovalRecipient) {
  const safeEmail = cleanEmail(recipient.email, 255);
  if (!safeEmail || !isValidEmail(safeEmail)) {
    throw new PetitionerApprovalMailError('The petitioner does not have a valid email address.');
  }

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

  const attachment = buildParentConsentPdf({ ...recipient, email: safeEmail }, config.replyTo);
  const petitionerName = cleanText(recipient.name, 255) || 'Petitioner';

  try {
    await transporter.sendMail({
      from: config.from,
      replyTo: config.replyTo,
      to: safeEmail,
      subject: 'T. De Leon Chapter 47 parent consent form',
      text: [
        `Hello ${petitionerName},`,
        '',
        'Thank you for submitting your membership petition to T. De Leon Chapter 47.',
        'We reviewed your petition and attached the parent / guardian consent form needed for the next step.',
        '',
        'Please print the form, ask your parent or guardian to sign it, and send the signed copy back to the chapter.',
        'If the attachment does not open or you need another copy, just reply to this email.',
        '',
        `This message was sent to ${safeEmail} because this address was used on the petition form.`,
        '',
        `If you have questions, reply to ${config.replyTo}.`,
        '',
        'Sincerely,',
        'T. De Leon Chapter 47',
      ].join('\n'),
      html: [
        `<p>Hello ${petitionerName},</p>`,
        '<p>Thank you for submitting your membership petition to T. De Leon Chapter 47.</p>',
        '<p>We reviewed your petition and attached the <strong>parent / guardian consent form</strong> needed for the next step.</p>',
        '<p>Please print the form, ask your parent or guardian to sign it, and send the signed copy back to the chapter.</p>',
        '<p>If the attachment does not open or you need another copy, just reply to this email.</p>',
        `<p>This message was sent to <strong>${safeEmail}</strong> because this address was used on the petition form.</p>`,
        `<p>If you have questions, reply to <a href="mailto:${config.replyTo}">${config.replyTo}</a>.</p>`,
        '<p>Sincerely,<br />T. De Leon Chapter 47</p>',
      ].join(''),
      attachments: [
        {
          filename: `parent-consent-${toFileSlug(petitionerName)}.pdf`,
          content: attachment,
          contentType: 'application/pdf',
        },
      ],
    });
  } catch (error) {
    console.error('Failed to send petitioner approval email', error);
    throw new PetitionerApprovalMailError(
      'The petitioner was not approved because the consent email could not be sent. Check your SMTP settings and try again.',
    );
  }
}
