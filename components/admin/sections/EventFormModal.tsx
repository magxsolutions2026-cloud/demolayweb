'use client';

import { useState } from 'react';
import { AdminGhostButton, AdminPrimaryButton } from '@/components/admin/AdminButtons';
import { useAdminData } from '@/components/admin/AdminDataProvider';
import { AdminField, adminInputClass } from '@/components/admin/AdminFormFields';
import { DashboardModal } from '@/components/admin/DashboardModal';
import { useAdminToast } from '@/components/admin/ToastContext';
import type { EventCategory, EventItem } from '@/components/admin/types';
import { formatSqlDate } from '@/lib/formatDb';

const emptyEvent = () => ({
  id: 0,
  title: '',
  event_date: '',
  event_time: '',
  location: '',
  description: '',
  category: 'activity' as EventCategory,
});

/** Create or edit an event. Remount with a new `key` to load another record. */
export function EventFormModal({ event, onClose }: { event: EventItem | null; onClose: () => void }) {
  const { saveEvent } = useAdminData();
  const { toast } = useAdminToast();
  const [form, setForm] = useState(() =>
    event
      ? { ...event, event_date: formatSqlDate(event.event_date), category: (event.category as EventCategory) || 'activity' }
      : emptyEvent(),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((p) => ({ ...p, [key]: value }));

  const submit = async () => {
    const err: Record<string, string> = {};
    if (!form.title.trim()) err.title = 'Required';
    if (!form.event_date) err.event_date = 'Required';
    if (!form.event_time.trim()) err.event_time = 'Required';
    if (!form.location.trim()) err.location = 'Required';
    setErrors(err);
    if (Object.keys(err).length) return;

    setSaving(true);
    try {
      await saveEvent(form);
      toast('success', form.id ? 'Event updated.' : 'Event created.');
      onClose();
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Could not save event.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardModal
      open
      onClose={() => !saving && onClose()}
      title={form.id ? 'Edit event' : 'New event'}
      description="Details appear on the public events calendar."
      size="lg"
      footer={
        <>
          <AdminGhostButton disabled={saving} onClick={onClose}>
            Cancel
          </AdminGhostButton>
          <AdminPrimaryButton loading={saving} onClick={() => void submit()}>
            Save event
          </AdminPrimaryButton>
        </>
      }
    >
      <form
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <AdminField label="Title" htmlFor="ev-title" required error={errors.title} className="md:col-span-2">
          <input
            id="ev-title"
            autoFocus
            className={adminInputClass(!!errors.title)}
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
          />
        </AdminField>
        <AdminField label="Date" htmlFor="ev-date" required error={errors.event_date}>
          <input
            id="ev-date"
            type="date"
            className={adminInputClass(!!errors.event_date)}
            value={form.event_date}
            onChange={(e) => set('event_date', e.target.value)}
          />
        </AdminField>
        <AdminField label="Time" htmlFor="ev-time" required error={errors.event_time}>
          <input
            id="ev-time"
            className={adminInputClass(!!errors.event_time)}
            value={form.event_time}
            onChange={(e) => set('event_time', e.target.value)}
            placeholder="e.g. 7:00 PM"
          />
        </AdminField>
        <AdminField label="Location" htmlFor="ev-loc" required error={errors.location}>
          <input
            id="ev-loc"
            className={adminInputClass(!!errors.location)}
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
          />
        </AdminField>
        <AdminField label="Type" htmlFor="ev-cat">
          <select
            id="ev-cat"
            className={adminInputClass()}
            value={form.category}
            onChange={(e) => set('category', e.target.value as EventCategory)}
          >
            <option value="important">Important</option>
            <option value="formal">Formal</option>
            <option value="activity">Activity</option>
          </select>
        </AdminField>
        <AdminField label="Description" htmlFor="ev-desc" className="md:col-span-2">
          <textarea
            id="ev-desc"
            className={adminInputClass()}
            rows={4}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </AdminField>
        <button type="submit" hidden />
      </form>
    </DashboardModal>
  );
}
