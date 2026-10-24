'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { useCallback, useEffect, useId, useState } from 'react';
import { useJoinUsModal } from './JoinUsModalContext';

type FieldErrors = Partial<Record<'name' | 'email' | 'phone' | 'address' | 'age' | 'school' | 'reason', string>>;

function validate(
  data: Record<string, string>,
): { ok: true } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  if (!data.name.trim()) errors.name = 'Name is required';
  if (!data.email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Enter a valid email';
  if (!data.phone.trim()) errors.phone = 'Contact number is required';
  if (!data.address.trim()) errors.address = 'Address is required';
  const ageNum = Number(data.age);
  if (!data.age.trim()) errors.age = 'Age is required';
  else if (Number.isNaN(ageNum) || ageNum < 12 || ageNum > 25) errors.age = 'Age must be between 12 and 25';
  if (!data.school.trim()) errors.school = 'School is required';
  if (!data.reason.trim()) errors.reason = 'Message is required';

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true };
}

export default function JoinUsModal() {
  const { isOpen, close, showToast } = useJoinUsModal();
  const baseId = useId();
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    age: '',
    school: '',
    reason: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const reset = useCallback(() => {
    setValues({
      name: '',
      email: '',
      phone: '',
      address: '',
      age: '',
      school: '',
      reason: '',
    });
    setErrors({});
  }, []);

  useEffect(() => {
    if (!isOpen) {
      const t = window.setTimeout(reset, 320);
      return () => window.clearTimeout(t);
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, close]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate(values);
    if (!v.ok) {
      setErrors(v.errors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch('/api/petitioners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          address: values.address.trim(),
          age: Number(values.age),
          school: values.school.trim(),
          reason: values.reason.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'Submission failed');
      }
      close();
      showToast('Application received. The chapter will review your petition and contact you soon.');
    } catch {
      setErrors({ reason: 'Could not submit. Try again later.' });
    } finally {
      setSubmitting(false);
    }
  };

  const field = (key: keyof typeof values) => ({
    value: values[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((s) => ({ ...s, [key]: e.target.value }));
      if (errors[key as keyof FieldErrors]) {
        setErrors((e0) => ({ ...e0, [key]: undefined }));
      }
    },
  });

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-0 backdrop-blur-md sm:items-center sm:p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${baseId}-title`}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="join-modal-surface border-gold/25 text-foreground relative max-h-[min(92dvh,880px)] w-full max-w-lg overflow-hidden rounded-t-3xl border shadow-2xl sm:max-h-[90vh] sm:rounded-3xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="join-modal-glow pointer-events-none absolute inset-0" aria-hidden />
            <div className="relative flex max-h-[inherit] flex-col">
              <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
                <div>
                  <h2 id={`${baseId}-title`} className="font-serif text-xl font-bold tracking-tight text-gold sm:text-2xl">
                    Join Us
                  </h2>
                  <p className="text-foreground/65 mt-1 text-sm">Petition to join T. De Leon Chapter No. 47</p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-xl p-2 text-foreground/60 transition hover:bg-white/10 hover:text-gold"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
                <form className="space-y-5" onSubmit={onSubmit} noValidate>
                    <FloatingField
                      id={`${baseId}-name`}
                      label="Full name"
                      error={errors.name}
                      inputProps={{ ...field('name'), autoComplete: 'name' }}
                    />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <FloatingField
                        id={`${baseId}-email`}
                        label="Email"
                        error={errors.email}
                        inputProps={{ ...field('email'), type: 'email', autoComplete: 'email' }}
                      />
                      <FloatingField
                        id={`${baseId}-phone`}
                        label="Contact number"
                        error={errors.phone}
                        inputProps={{ ...field('phone'), type: 'tel', autoComplete: 'tel' }}
                      />
                    </div>
                    <FloatingField
                      id={`${baseId}-address`}
                      label="Address"
                      error={errors.address}
                      inputProps={{ ...field('address'), autoComplete: 'street-address' }}
                    />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <FloatingField
                        id={`${baseId}-age`}
                        label="Age"
                        error={errors.age}
                        inputProps={{ ...field('age'), inputMode: 'numeric' }}
                      />
                      <FloatingField
                        id={`${baseId}-school`}
                        label="School"
                        error={errors.school}
                        inputProps={{ ...field('school'), autoComplete: 'organization' }}
                      />
                    </div>
                    <FloatingTextarea
                      id={`${baseId}-reason`}
                      label="Message"
                      error={errors.reason}
                      textareaProps={{ ...field('reason'), rows: 4 }}
                    />

                    <button
                      type="submit"
                      disabled={submitting}
                      className="cta-primary relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-3.5 text-sm font-bold shadow-lg transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          Submitting…
                        </>
                      ) : (
                        'Submit application'
                      )}
                    </button>
                  </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function FloatingField({
  id,
  label,
  error,
  inputProps,
}: {
  id: string;
  label: string;
  error?: string;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = Boolean(inputProps.value);

  return (
    <div className="relative">
      <input
        id={id}
        className={`input join-float-input w-full rounded-xl px-3 pb-2.5 pt-6 ${error ? 'border-rose-400/60' : ''}`}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...inputProps}
      />
      <label
        htmlFor={id}
        className={`join-float-label pointer-events-none absolute left-3 z-10 origin-left transition-all duration-200 ${
          focused || hasValue
            ? 'top-2.5 translate-y-0 text-[11px] font-semibold uppercase tracking-wider text-gold/90'
            : 'top-1/2 -translate-y-1/2 text-base text-foreground/55'
        }`}
      >
        {label}
      </label>
      {error ? <p className="text-rose-300 mt-1.5 text-xs">{error}</p> : null}
    </div>
  );
}

function FloatingTextarea({
  id,
  label,
  error,
  textareaProps,
}: {
  id: string;
  label: string;
  error?: string;
  textareaProps: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = Boolean(textareaProps.value);

  return (
    <div className="relative">
      <textarea
        id={id}
        className={`input join-float-input min-h-[120px] w-full resize-y rounded-xl px-3 pb-2.5 pt-7 ${error ? 'border-rose-400/60' : ''}`}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...textareaProps}
      />
      <label
        htmlFor={id}
        className={`join-float-label pointer-events-none absolute left-3 z-10 origin-left text-sm transition-all duration-200 ${
          focused || hasValue
            ? 'top-2 translate-y-0 text-[11px] font-semibold uppercase tracking-wider text-gold/90'
            : 'top-5 text-foreground/55'
        }`}
      >
        {label}
      </label>
      {error ? <p className="text-rose-300 mt-1.5 text-xs">{error}</p> : null}
    </div>
  );
}
