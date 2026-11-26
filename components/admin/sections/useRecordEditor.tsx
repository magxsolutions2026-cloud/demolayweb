'use client';

import { useState } from 'react';
import { useAdminData, type DeletableKind } from '@/components/admin/AdminDataProvider';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { useAdminToast } from '@/components/admin/ToastContext';
import { useQueryState } from '@/components/admin/ui/useQueryState';

/**
 * Create/edit/delete plumbing shared by the content pages. The open form lives in the URL
 * (`?new=1` or `?edit=<id>`), so Quick add, the command palette and dashboard links can open it.
 */
export function useRecordEditor<T extends { id: number }>(kind: DeletableKind, items: T[], titleOf: (item: T) => string) {
  const { params, set } = useQueryState();
  const { remove } = useAdminData();
  const { toast } = useAdminToast();
  const [pendingDelete, setPendingDelete] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);

  const editId = Number(params.get('edit')) || null;
  const editing = editId ? items.find((item) => item.id === editId) ?? null : null;
  const isNew = params.get('new') === '1';

  const runDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await remove(kind, pendingDelete.id);
      toast('success', `Deleted “${titleOf(pendingDelete)}”.`);
      setPendingDelete(null);
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Could not delete.');
    } finally {
      setDeleting(false);
    }
  };

  return {
    /** Render the form when this is true; key it with `formKey` so switching records resets it. */
    formOpen: isNew || !!editing,
    formKey: editing ? `edit-${editing.id}` : 'new',
    editing,
    openNew: () => set({ new: '1', edit: null }),
    openEdit: (item: T) => set({ edit: String(item.id), new: null }),
    closeForm: () => set({ new: null, edit: null }),
    askDelete: setPendingDelete,
    confirmDialog: (
      <ConfirmModal
        open={!!pendingDelete}
        onClose={() => !deleting && setPendingDelete(null)}
        title="Delete this item?"
        message={pendingDelete ? `“${titleOf(pendingDelete)}” will be removed for good. This cannot be undone.` : ''}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={runDelete}
      />
    ),
  };
}
