'use client';

import { ImagePlus } from 'lucide-react';
import { useState } from 'react';
import { AdminGhostButton, AdminPrimaryButton } from '@/components/admin/AdminButtons';
import { uploadAdminFile, useAdminData } from '@/components/admin/AdminDataProvider';
import { AdminField, adminInputClass } from '@/components/admin/AdminFormFields';
import { DashboardModal } from '@/components/admin/DashboardModal';
import { useAdminToast } from '@/components/admin/ToastContext';
import type { NewsItem } from '@/components/admin/types';
import { cleanNewsImageUrls, MAX_NEWS_IMAGES } from '@/lib/newsImages';

const fromNews = (item: NewsItem | null) =>
  item
    ? {
        ...item,
        summary: item.summary || '',
        content: item.content || '',
        image_urls: item.image_urls || [],
        published_at: item.published_at ? item.published_at.slice(0, 16) : '',
        is_published: !!item.is_published,
      }
    : { id: 0, title: '', slug: '', summary: '', content: '', image_urls: [] as string[], is_published: true, published_at: '' };

/** Create or edit a news post, with multi-photo upload (the first photo is the feed cover). */
export function NewsFormModal({ item, onClose }: { item: NewsItem | null; onClose: () => void }) {
  const { saveNews } = useAdminData();
  const { toast } = useAdminToast();
  const [form, setForm] = useState(() => fromNews(item));
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [saving, setSaving] = useState(false);
  const uploading = progress.total > 0;
  const full = form.image_urls.length >= MAX_NEWS_IMAGES;

  const uploadImages = async (files: FileList | null) => {
    const selected = Array.from(files ?? []);
    if (!selected.length) return;
    const slots = Math.max(0, MAX_NEWS_IMAGES - form.image_urls.length);
    if (!slots) {
      toast('error', `You can upload up to ${MAX_NEWS_IMAGES} photos per post.`);
      return;
    }
    const queue = selected.slice(0, slots);
    if (queue.length < selected.length) {
      toast('error', `Only ${slots} more photo${slots === 1 ? '' : 's'} can be added to this post.`);
    }
    let done = 0;
    try {
      for (const [index, file] of queue.entries()) {
        setProgress({ current: index + 1, total: queue.length });
        const url = await uploadAdminFile(file);
        done += 1;
        setForm((p) => ({ ...p, image_urls: cleanNewsImageUrls([...p.image_urls, url]) }));
      }
      toast('success', done === 1 ? 'Photo uploaded.' : `${done} photos uploaded.`);
    } catch (e) {
      toast('error', `Upload failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setProgress({ current: 0, total: 0 });
    }
  };

  const submit = async () => {
    if (uploading) return;
    if (!form.title.trim()) {
      toast('error', 'A title is required.');
      return;
    }
    setSaving(true);
    try {
      const payload = await saveNews(form);
      toast('success', form.id ? 'News updated.' : 'News published.');
      if (payload?.mailError) toast('error', payload.mailError);
      else if (payload?.mailSent) toast('success', 'Newsletter sent to subscribers.');
      onClose();
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Could not save news.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardModal
      open
      onClose={() => !saving && !uploading && onClose()}
      title={form.id ? 'Edit news post' : 'New news post'}
      description="Published posts show in the public news feed."
      size="xl"
      footer={
        <>
          <AdminGhostButton disabled={saving || uploading} onClick={onClose}>
            Cancel
          </AdminGhostButton>
          <AdminPrimaryButton loading={saving} disabled={uploading} onClick={() => void submit()}>
            {form.is_published ? 'Save & publish' : 'Save draft'}
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
        <AdminField label="Title" htmlFor="nw-title" required className="md:col-span-2">
          <input
            id="nw-title"
            autoFocus
            className={adminInputClass()}
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          />
        </AdminField>
        <AdminField label="Slug" htmlFor="nw-slug">
          <input
            id="nw-slug"
            className={adminInputClass()}
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            placeholder="Generated from the title if empty"
          />
        </AdminField>
        <div className="grid grid-cols-2 gap-3">
          <AdminField label="Status" htmlFor="nw-st">
            <select
              id="nw-st"
              className={adminInputClass()}
              value={form.is_published ? '1' : '0'}
              onChange={(e) => setForm((p) => ({ ...p, is_published: e.target.value === '1' }))}
            >
              <option value="1">Published</option>
              <option value="0">Draft</option>
            </select>
          </AdminField>
          <AdminField label="Publish date" htmlFor="nw-pub">
            <input
              id="nw-pub"
              type="datetime-local"
              className={adminInputClass()}
              value={form.published_at}
              onChange={(e) => setForm((p) => ({ ...p, published_at: e.target.value }))}
            />
          </AdminField>
        </div>
        <AdminField label="Summary" htmlFor="nw-sum" className="md:col-span-2">
          <textarea
            id="nw-sum"
            className={adminInputClass()}
            rows={2}
            value={form.summary}
            onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
          />
        </AdminField>

        <div className="md:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <span className="cs-label">
              Photos · {form.image_urls.length}/{MAX_NEWS_IMAGES}
            </span>
            {uploading ? (
              <span className="cs-label !text-gold">
                Uploading {progress.current} of {progress.total}…
              </span>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {form.image_urls.map((url, index) => (
              <div key={url} className="group relative overflow-hidden rounded-2xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                <div className="aspect-[4/3] bg-cover bg-center" style={{ backgroundImage: `url(${url})` }} />
                {index === 0 ? (
                  <span className="cs-chip absolute left-2 top-2">Cover</span>
                ) : null}
                <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1.5 bg-gradient-to-t from-black/85 to-transparent p-2 pt-6 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                  {index !== 0 ? (
                    <button
                      type="button"
                      className="cs-btn cs-btn-ghost cs-btn-sm"
                      onClick={() => setForm((p) => ({ ...p, image_urls: [url, ...p.image_urls.filter((u) => u !== url)] }))}
                    >
                      Cover
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="cs-btn cs-btn-danger cs-btn-sm"
                    onClick={() => setForm((p) => ({ ...p, image_urls: p.image_urls.filter((u) => u !== url) }))}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {!full ? (
              <label
                className={`grid aspect-[4/3] cursor-pointer place-items-center rounded-2xl border border-dashed border-gold/30 text-center text-xs text-white/55 transition hover:border-gold/60 hover:bg-gold/[0.05] ${
                  uploading ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="sr-only"
                  disabled={uploading}
                  onChange={(e) => {
                    void uploadImages(e.currentTarget.files);
                    e.currentTarget.value = '';
                  }}
                />
                <span className="grid justify-items-center gap-1.5">
                  <ImagePlus className="h-6 w-6 text-gold/70" />
                  Add photos
                </span>
              </label>
            ) : null}
          </div>
        </div>

        <AdminField label="Content" htmlFor="nw-body" className="md:col-span-2">
          <textarea
            id="nw-body"
            className={adminInputClass()}
            rows={8}
            value={form.content}
            onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
          />
        </AdminField>
        <button type="submit" hidden />
      </form>
    </DashboardModal>
  );
}
