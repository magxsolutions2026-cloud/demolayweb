'use client';

import { useEffect, useState } from 'react';
import { AdminGhostButton, AdminPrimaryButton } from '@/components/admin/AdminButtons';
import { uploadAdminFile, useAdminData } from '@/components/admin/AdminDataProvider';
import { AdminField, adminInputClass } from '@/components/admin/AdminFormFields';
import { DashboardModal } from '@/components/admin/DashboardModal';
import { useAdminToast } from '@/components/admin/ToastContext';
import type { OfficerItem } from '@/components/admin/types';
import { officerPhotoBackgroundStyle } from '@/lib/officerPhoto';

const FRAMING_RESET = { photo_pos_x: 50, photo_pos_y: 45, photo_zoom: 100 };

const fromOfficer = (officer: OfficerItem | null) =>
  officer
    ? {
        ...officer,
        photo_url: officer.photo_url || '',
        photo_pos_x: Number(officer.photo_pos_x ?? 50),
        photo_pos_y: Number(officer.photo_pos_y ?? 45),
        photo_zoom: Number(officer.photo_zoom ?? 100),
      }
    : { id: 0, name: '', position: '', photo_url: '', ...FRAMING_RESET };

const sliderLabel = { photo_pos_x: 'Horizontal', photo_pos_y: 'Vertical', photo_zoom: 'Zoom' } as const;

/** Create or edit an officer, with photo upload and focal-point framing. */
export function OfficerFormModal({ officer, onClose }: { officer: OfficerItem | null; onClose: () => void }) {
  const { saveOfficer } = useAdminData();
  const { toast } = useAdminToast();
  const [form, setForm] = useState(() => fromOfficer(officer));
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const busy = saving || uploading;

  const upload = async (file: File) => {
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const url = await uploadAdminFile(file);
      setForm((p) => ({ ...p, photo_url: url, ...FRAMING_RESET }));
      toast('success', 'Photo uploaded.');
    } catch (e) {
      toast('error', `Upload failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setPreview('');
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!form.name.trim() || !form.position.trim()) {
      toast('error', 'Name and position are required.');
      return;
    }
    setSaving(true);
    try {
      await saveOfficer(form);
      toast('success', form.id ? 'Officer updated.' : 'Officer added.');
      onClose();
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Could not save officer.');
    } finally {
      setSaving(false);
    }
  };

  const shownPhoto = preview || form.photo_url;

  return (
    <DashboardModal
      open
      onClose={() => !busy && onClose()}
      title={form.id ? 'Edit officer' : 'New officer'}
      description="Officers appear on the public officers page."
      size="xl"
      footer={
        <>
          <AdminGhostButton disabled={busy} onClick={onClose}>
            Cancel
          </AdminGhostButton>
          <AdminPrimaryButton loading={saving} disabled={uploading} onClick={() => void submit()}>
            Save officer
          </AdminPrimaryButton>
        </>
      }
    >
      <form
        className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_260px]"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="space-y-4">
          <AdminField label="Name" htmlFor="of-name" required>
            <input
              id="of-name"
              autoFocus
              className={adminInputClass()}
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </AdminField>
          <AdminField label="Position" htmlFor="of-pos" required>
            <input
              id="of-pos"
              className={adminInputClass()}
              value={form.position}
              onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
              placeholder="e.g. Master Councilor"
            />
          </AdminField>
          <AdminField label="Photo" htmlFor="of-photo">
            <input
              id="of-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className={adminInputClass()}
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
                e.target.value = '';
              }}
            />
            <p className="mt-2 text-xs text-white/45">JPG, PNG, WEBP or GIF, up to 5 MB.</p>
          </AdminField>
          {shownPhoto ? (
            <div className="space-y-3">
              {(['photo_pos_x', 'photo_pos_y', 'photo_zoom'] as const).map((key) => (
                <label key={key} className="block text-xs text-white/70">
                  <span className="cs-label flex justify-between">
                    <span>{sliderLabel[key]}</span>
                    <span>{key === 'photo_zoom' && form.photo_zoom === 100 ? 'Cover' : `${form[key]}%`}</span>
                  </span>
                  <input
                    type="range"
                    className="mt-2 w-full accent-[#d4af37]"
                    min={key === 'photo_zoom' ? 100 : 0}
                    max={key === 'photo_zoom' ? 200 : 100}
                    value={form[key]}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: Number(e.target.value) }))}
                  />
                </label>
              ))}
              <div className="flex gap-2">
                <button type="button" className="cs-btn cs-btn-ghost cs-btn-sm" onClick={() => setForm((p) => ({ ...p, ...FRAMING_RESET }))}>
                  Reset framing
                </button>
                {form.photo_url ? (
                  <button
                    type="button"
                    className="cs-btn cs-btn-danger cs-btn-sm"
                    onClick={() => setForm((p) => ({ ...p, photo_url: '', ...FRAMING_RESET }))}
                  >
                    Remove photo
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <div>
          <p className="cs-label mb-2">Preview · click to set focus</p>
          <div
            role="img"
            aria-label="Officer photo preview; click to set the focal point"
            className="relative aspect-[4/5] w-full cursor-crosshair overflow-hidden rounded-2xl bg-[var(--cs-tile-2,#1e1518)] shadow-[inset_0_0_0_1px_rgba(212,175,55,0.26)]"
            style={shownPhoto ? officerPhotoBackgroundStyle({ ...form, photo_url: shownPhoto }) : undefined}
            onClick={(e) => {
              if (!shownPhoto) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const clamp = (v: number) => Math.min(100, Math.max(0, Math.round(v)));
              setForm((p) => ({
                ...p,
                photo_pos_x: clamp(((e.clientX - rect.left) / rect.width) * 100),
                photo_pos_y: clamp(((e.clientY - rect.top) / rect.height) * 100),
              }));
            }}
          >
            {!shownPhoto ? (
              <span className="absolute inset-0 grid place-items-center text-xs text-white/35">No photo yet</span>
            ) : null}
            {uploading ? (
              <span className="absolute inset-x-0 bottom-0 bg-black/60 py-2 text-center text-xs text-gold">Uploading…</span>
            ) : null}
          </div>
        </div>
        <button type="submit" hidden />
      </form>
    </DashboardModal>
  );
}
