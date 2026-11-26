'use client';

import { KeyRound, RefreshCw, UserRound } from 'lucide-react';
import { useState } from 'react';
import { AdminPrimaryButton } from '@/components/admin/AdminButtons';
import { useAdminData } from '@/components/admin/AdminDataProvider';
import { AdminField, adminInputClass } from '@/components/admin/AdminFormFields';
import { useAdminToast } from '@/components/admin/ToastContext';
import type { AdminUserItem } from '@/components/admin/types';
import { PageHeader } from '@/components/admin/ui/PageHeader';
import { StatusChip } from '@/components/admin/ui/StatusChip';

const SHORTCUTS = [
  { keys: 'Ctrl K', label: 'Search pages, actions and members' },
  { keys: 'Ctrl B', label: 'Collapse or expand the sidebar' },
  { keys: 'Esc', label: 'Close a dialog, drawer or menu' },
  { keys: '↑ ↓ Enter', label: 'Move and pick in the search palette' },
];

function TileTitle({ icon: Icon, title, sub }: { icon: typeof KeyRound; title: string; sub: string }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="cs-avatar-sm">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="cs-tile-title">{title}</p>
        <p className="cs-tile-sub">{sub}</p>
      </div>
    </div>
  );
}

/** Name, email and password for the signed-in admin; saved through the accounts API. */
function ProfileForm({ me, onSaved }: { me: AdminUserItem; onSaved: () => Promise<void> }) {
  const { toast } = useAdminToast();
  const [form, setForm] = useState({ name: me.name, email: me.email, password: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (form.password && form.password !== form.confirm) {
      toast('error', 'The two passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/accounts/${me.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, username: me.username, status: me.status, password: form.password }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'Could not save your profile.');
      setForm((p) => ({ ...p, password: '', confirm: '' }));
      await onSaved();
      toast('success', form.password ? 'Profile and password updated.' : 'Profile updated.');
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <AdminField label="Name" htmlFor="me-name" required>
        <input id="me-name" className={adminInputClass()} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
      </AdminField>
      <AdminField label="Email" htmlFor="me-email" required>
        <input
          id="me-email"
          type="email"
          className={adminInputClass()}
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        />
      </AdminField>
      <AdminField label="New password" htmlFor="me-pass">
        <input
          id="me-pass"
          type="password"
          autoComplete="new-password"
          className={adminInputClass()}
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          placeholder="Leave empty to keep it"
        />
      </AdminField>
      <AdminField label="Confirm password" htmlFor="me-pass2">
        <input
          id="me-pass2"
          type="password"
          autoComplete="new-password"
          className={adminInputClass(!!form.confirm && form.confirm !== form.password)}
          value={form.confirm}
          onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
        />
      </AdminField>
      <div className="sm:col-span-2">
        <AdminPrimaryButton type="submit" loading={saving}>
          Save changes
        </AdminPrimaryButton>
      </div>
    </form>
  );
}

export function SettingsSection() {
  const { admins, currentAdminId, username, refresh, fetchAll, refreshing } = useAdminData();
  const me = admins.find((a) => a.id === currentAdminId);

  return (
    <>
      <PageHeader kicker="System" title="Settings" lead="Your admin profile, password and console shortcuts." />

      <div className="grid gap-[14px] xl:grid-cols-12">
        <section className="cs-tile p-5 xl:col-span-8">
          <TileTitle icon={UserRound} title="Your profile" sub={`Signed in as ${username}`} />
          {me ? (
            <ProfileForm key={me.id} me={me} onSaved={() => fetchAll({ silent: true })} />
          ) : (
            <p className="text-sm text-white/50">Your account details could not be loaded.</p>
          )}
        </section>

        <div className="grid content-start gap-[14px] xl:col-span-4">
          <section className="cs-tile p-5">
            <TileTitle icon={RefreshCw} title="Data" sub="The console updates itself when petitions or orders arrive." />
            <div className="flex flex-wrap items-center gap-3">
              <StatusChip tone="green">Live updates on</StatusChip>
              <button type="button" className="cs-btn cs-btn-ghost cs-btn-sm" disabled={refreshing} onClick={() => void refresh()}>
                <RefreshCw className={refreshing ? 'animate-spin' : ''} /> Refresh now
              </button>
            </div>
          </section>

          <section className="cs-tile p-5">
            <TileTitle icon={KeyRound} title="Shortcuts" sub="Use Cmd instead of Ctrl on a Mac." />
            <dl className="grid gap-2.5">
              {SHORTCUTS.map((s) => (
                <div key={s.keys} className="flex items-center justify-between gap-4 text-sm">
                  <dt className="text-white/70">{s.label}</dt>
                  <dd>
                    <kbd className="cs-kbd whitespace-nowrap">{s.keys}</kbd>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}
