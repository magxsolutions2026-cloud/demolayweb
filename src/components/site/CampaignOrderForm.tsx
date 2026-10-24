'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/formatCurrency';

export default function CampaignOrderForm({
  slug,
  title,
  sizes,
  unitPrice,
}: {
  slug: string;
  title: string;
  sizes: string[];
  unitPrice: number;
}) {
  const [brotherName, setBrotherName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [shirtSize, setShirtSize] = useState(sizes[0] || 'M');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const quantityValue = Math.max(1, Number.parseInt(quantity || '1', 10) || 1);
  const total = unitPrice * quantityValue;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/campaigns/${slug}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brother_name: brotherName,
          email,
          phone,
          shirt_size: shirtSize,
          quantity: quantityValue,
          notes,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string; message?: string };

      if (!response.ok) {
        throw new Error(payload.error || 'Could not place your order.');
      }

      setBrotherName('');
      setEmail('');
      setPhone('');
      setShirtSize(sizes[0] || 'M');
      setQuantity('1');
      setNotes('');
      setSuccess(payload.message || `Your order for ${title} has been recorded.`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not place your order.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="mt-6 space-y-4 rounded-2xl border border-gold/20 bg-black/25 p-4 sm:p-5" onSubmit={handleSubmit}>
      <div>
        <p className="text-gold text-xs font-semibold uppercase tracking-[0.18em]">Order T-Shirts</p>
        <p className="text-foreground/65 mt-2 text-sm">
          {formatCurrency(unitPrice)} each. Choose your preferred size and quantity, then submit your order.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-foreground/80 mb-1 block">Brother name</span>
          <input
            className="input w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2.5"
            value={brotherName}
            onChange={(e) => setBrotherName(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="text-foreground/80 mb-1 block">Email</span>
          <input
            className="input w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2.5"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="text-foreground/80 mb-1 block">Phone number</span>
          <input
            className="input w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2.5"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Optional"
          />
        </label>
        <label className="block text-sm">
          <span className="text-foreground/80 mb-1 block">Preferred size</span>
          <select
            className="input w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2.5"
            value={shirtSize}
            onChange={(e) => setShirtSize(e.target.value)}
            required
          >
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-foreground/80 mb-1 block">Quantity</span>
          <input
            className="input w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2.5"
            type="number"
            min={1}
            max={24}
            step={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </label>
        <div className="rounded-xl border border-gold/15 bg-gold/10 px-4 py-3 text-sm">
          <p className="text-foreground/55 uppercase tracking-[0.14em]">Total</p>
          <p className="text-gold mt-1 text-xl font-bold">{formatCurrency(total)}</p>
        </div>
      </div>

      <label className="block text-sm">
        <span className="text-foreground/80 mb-1 block">Notes</span>
        <textarea
          className="input min-h-[88px] w-full rounded-xl border border-white/12 bg-black/30 px-3 py-2.5"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional pickup or sizing notes"
        />
      </label>

      {error ? <p className="rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{error}</p> : null}
      {success ? <p className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{success}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="cta-primary w-full rounded-xl px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? 'Submitting order…' : 'Place order'}
      </button>
    </form>
  );
}
