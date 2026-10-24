'use client';

import { DashboardModal } from './DashboardModal';
import { AdminGhostButton } from './AdminButtons';
import { AdminPrimaryButton } from './AdminButtons';

export function ConfirmModal({
  open,
  onClose,
  title,
  message,
  confirmLabel = 'Delete',
  danger,
  loading,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <DashboardModal
      open={open}
      onClose={loading ? () => {} : onClose}
      title={title}
      description={message}
      size="sm"
      footer={
        <>
          <AdminGhostButton type="button" onClick={onClose} disabled={loading}>
            Cancel
          </AdminGhostButton>
          <AdminPrimaryButton
            type="button"
            variant={danger ? 'danger' : 'primary'}
            loading={loading}
            onClick={() => void onConfirm()}
          >
            {confirmLabel}
          </AdminPrimaryButton>
        </>
      }
    />
  );
}
