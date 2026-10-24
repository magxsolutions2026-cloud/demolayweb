'use client';

import { motion } from 'framer-motion';
import { Loader2, MailCheck } from 'lucide-react';
import { useId, useState } from 'react';
import { useJoinUsModal } from '@/components/site/JoinUsModalContext';

type NewsletterSubscribeFormProps = {
  variant?: 'hero' | 'compact';
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  placeholder?: string;
  buttonLabel?: string;
};

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function NewsletterSubscribeForm({
  variant = 'hero',
  className,
  inputClassName,
  buttonClassName,
  placeholder = 'Your email address',
  buttonLabel = 'Subscribe',
}: NewsletterSubscribeFormProps) {
  const inputId = useId();
  const { showToast } = useJoinUsModal();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isCompact = variant === 'compact';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const safeEmail = email.trim().toLowerCase();

    setError('');
    setSuccessMessage('');

    if (!safeEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: safeEmail }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error || 'Could not save your subscription right now.');
      }

      const message = payload?.alreadySubscribed
        ? 'This email is already subscribed to chapter updates.'
        : 'You are now subscribed to chapter updates.';

      setSuccessMessage(message);
      showToast(message);

      if (!payload?.alreadySubscribed) {
        setEmail('');
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not save your subscription right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-2.5', className)} noValidate>
      <label htmlFor={inputId} className="sr-only">
        Email address
      </label>

      <div className={cn('flex gap-3', isCompact ? 'flex-col sm:flex-row sm:gap-0' : 'flex-col sm:flex-row')}>
        <input
          id={inputId}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={placeholder}
          disabled={submitting}
          className={cn(
            'input disabled:cursor-not-allowed disabled:opacity-70',
            isCompact
              ? 'flex-1 rounded-lg border border-[var(--secondary-color)]/20 bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-[var(--secondary-color)] focus:outline-none sm:rounded-r-none'
              : 'flex-1 px-3.5 py-2.5',
            inputClassName,
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-message` : undefined}
        />

        <motion.button
          type="submit"
          disabled={submitting}
          whileHover={submitting ? undefined : { scale: 1.02 }}
          whileTap={submitting ? undefined : { scale: 0.98 }}
          className={cn(
            'btn-shine inline-flex shrink-0 items-center justify-center gap-2 font-bold disabled:cursor-not-allowed disabled:opacity-70',
            isCompact
              ? 'rounded-lg bg-[linear-gradient(135deg,#d4af37_0%,#a8742a_42%,#730e1b_100%)] px-4 py-2 text-sm text-[#0b090d] shadow-[0_14px_34px_rgba(115,14,27,0.35)] transition-all hover:shadow-[0_18px_38px_rgba(115,14,27,0.42)] sm:rounded-l-none'
              : 'cta-primary min-w-[10.5rem]',
            buttonClassName,
          )}
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          <span>{submitting ? 'Subscribing...' : buttonLabel}</span>
        </motion.button>
      </div>

      {error ? (
        <p id={`${inputId}-message`} className="text-sm text-rose-300">
          {error}
        </p>
      ) : null}

      {!error && successMessage ? (
        <p className="inline-flex items-center gap-2 text-sm text-emerald-300">
          <MailCheck className="h-4 w-4" aria-hidden />
          <span>{successMessage}</span>
        </p>
      ) : null}
    </form>
  );
}
