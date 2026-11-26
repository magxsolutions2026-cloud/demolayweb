'use client';

import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAdminData } from '@/components/admin/AdminDataProvider';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminIconButton } from '@/components/admin/AdminIconButton';
import { PageHeader } from '@/components/admin/ui/PageHeader';
import { StatusChip } from '@/components/admin/ui/StatusChip';
import { officerPhotoBackgroundStyle } from '@/lib/officerPhoto';
import { OfficerFormModal } from './OfficerFormModal';
import { useRecordEditor } from './useRecordEditor';

/** Officers as portrait cards, the way they appear on the public site. */
export function OfficersSection() {
  const { officers } = useAdminData();
  const editor = useRecordEditor('officer', officers, (o) => o.name);
  const withPhoto = officers.filter((o) => o.photo_url).length;

  return (
    <>
      <PageHeader
        kicker="Members"
        title="Officers"
        lead="The chapter's leadership roster, shown on the public officers page. Click a card to edit it."
        meta={
          <>
            <StatusChip>{officers.length} officers</StatusChip>
            {withPhoto < officers.length ? (
              <StatusChip tone="amber">{officers.length - withPhoto} missing a photo</StatusChip>
            ) : null}
          </>
        }
        actions={
          <button type="button" className="cs-btn cs-btn-primary" onClick={editor.openNew}>
            <Plus /> New officer
          </button>
        }
      />

      {officers.length === 0 ? (
        <AdminEmptyState title="No officers yet" description="Add the chapter officers for the public roster." />
      ) : (
        <ul className="grid grid-cols-2 gap-[14px] sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {officers.map((o) => (
            <li key={o.id} className="cs-tile group overflow-hidden transition hover:shadow-[inset_0_0_0_1px_var(--cs-edge)]">
              <button type="button" className="block w-full text-left" onClick={() => editor.openEdit(o)}>
                <div
                  className="aspect-[4/5] w-full bg-[#1e1518]"
                  style={o.photo_url ? officerPhotoBackgroundStyle(o) : undefined}
                >
                  {!o.photo_url ? (
                    <span className="grid h-full place-items-center font-[family-name:var(--font-display)] text-4xl font-extrabold text-gold/40">
                      {o.name.trim().charAt(0).toUpperCase()}
                    </span>
                  ) : null}
                </div>
                <div className="p-3.5">
                  <p className="cs-label !text-gold/80">{o.position}</p>
                  <p className="mt-1.5 truncate text-sm font-semibold">{o.name}</p>
                </div>
              </button>
              <div className="absolute right-2 top-2 flex gap-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                <AdminIconButton label="Edit officer" className="!bg-black/60" onClick={() => editor.openEdit(o)}>
                  <Pencil />
                </AdminIconButton>
                <AdminIconButton label="Delete officer" destructive className="!bg-black/60" onClick={() => editor.askDelete(o)}>
                  <Trash2 />
                </AdminIconButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editor.formOpen ? <OfficerFormModal key={editor.formKey} officer={editor.editing} onClose={editor.closeForm} /> : null}
      {editor.confirmDialog}
    </>
  );
}
