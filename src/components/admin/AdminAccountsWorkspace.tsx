'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Pencil, Plus, Search, ShieldUser, Trash2 } from 'lucide-react';
import {
  ADMIN_ACCOUNT_STATUSES,
  DEFAULT_ADMIN_ACCOUNT_STATUS,
  type AdminAccountStatus,
} from '@/lib/adminAccountConfig';
import { isValidEmail, validatePasswordRule } from '@/lib/validation';
import type { AdminUserItem } from '@/components/admin/types';
import { AdminBadge } from '@/components/admin/AdminBadge';
import { AdminGhostButton, AdminPrimaryButton } from '@/components/admin/AdminButtons';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { DashboardModal } from '@/components/admin/DashboardModal';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminField, adminInputClass } from '@/components/admin/AdminFormFields';
import { AdminIconButton } from '@/components/admin/AdminIconButton';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { useAdminToast } from '@/components/admin/ToastContext';

type AdminFormState = {
  id: number;
  name: string;
  email: string;
  password: string;
  status: AdminAccountStatus;
};

type PendingDelete = { id: number; name: string } | null;

const pageSize = 8;

function emptyAdminForm(): AdminFormState {
  return {
    id: 0,
    name: '',
    email: '',
    password: '',
    status: DEFAULT_ADMIN_ACCOUNT_STATUS,
  };
}

function formatCreatedAt(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown';
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function escapeCsvValue(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function AdminAccountsWorkspace({
  admins,
  currentAdminId,
  onRefresh,
  loading = false,
}: {
  admins: AdminUserItem[];
  currentAdminId: number;
  onRefresh: () => Promise<void>;
  loading?: boolean;
}) {
  const { toast } = useAdminToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | AdminAccountStatus>('All');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [adminForm, setAdminForm] = useState<AdminFormState>(emptyAdminForm);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);

  const filteredAdmins = useMemo(() => {
    const queryText = search.trim().toLowerCase();

    return admins.filter((admin) => {
      const matchesSearch =
        !queryText ||
        [admin.name, admin.email, admin.status, admin.username].some((value) =>
          String(value ?? '')
            .toLowerCase()
            .includes(queryText),
        );
      const matchesStatus = statusFilter === 'All' || admin.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [admins, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAdmins.length / pageSize));
  const pagedAdmins = filteredAdmins.slice((page - 1) * pageSize, page * pageSize);
  const activeCount = admins.filter((admin) => admin.status === 'Active').length;
  const inactiveCount = admins.length - activeCount;

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages));
  }, [totalPages]);

  const openCreate = () => {
    setFieldErrors({});
    setAdminForm(emptyAdminForm());
    setModalOpen(true);
  };

  const openEdit = (admin: AdminUserItem) => {
    setFieldErrors({});
    setAdminForm({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      password: '',
      status: admin.status,
    });
    setModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!adminForm.name.trim()) {
      errors.name = 'Name is required.';
    }

    if (!adminForm.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!isValidEmail(adminForm.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }

    if (!adminForm.id || adminForm.password.trim()) {
      const passwordError = validatePasswordRule(adminForm.password.trim());
      if (passwordError) {
        errors.password = passwordError;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitAdmin = async () => {
    if (!validateForm()) return;

    setModalSaving(true);
    const isEditing = adminForm.id > 0;

    try {
      const response = await fetch(isEditing ? `/api/admin/accounts/${adminForm.id}` : '/api/admin/accounts', {
        method: isEditing ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: adminForm.name,
          email: adminForm.email,
          password: adminForm.password.trim(),
          status: adminForm.status,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || 'Could not save administrator.');
      }

      setModalOpen(false);
      setAdminForm(emptyAdminForm());
      await onRefresh();
      toast('success', isEditing ? 'Administrator updated.' : 'Administrator created.');
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Could not save administrator.');
    } finally {
      setModalSaving(false);
    }
  };

  const runDelete = async () => {
    if (!pendingDelete) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/admin/accounts/${pendingDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || 'Could not delete administrator.');
      }

      setPendingDelete(null);
      await onRefresh();
      toast('success', 'Administrator deleted.');
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Could not delete administrator.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleStatus = async (admin: AdminUserItem) => {
    setStatusUpdatingId(admin.id);
    const nextStatus: AdminAccountStatus = admin.status === 'Active' ? 'Inactive' : 'Active';

    try {
      const response = await fetch(`/api/admin/accounts/${admin.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: admin.name,
          email: admin.email,
          status: nextStatus,
          password: '',
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || 'Could not update status.');
      }

      await onRefresh();
      toast('success', `${admin.name} is now ${nextStatus.toLowerCase()}.`);
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Could not update administrator status.');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const exportCsv = () => {
    if (filteredAdmins.length === 0) {
      toast('error', 'There are no administrators to export.');
      return;
    }

    const rows = [
      ['Name', 'Email', 'Status', 'Date Created'],
      ...filteredAdmins.map((admin) => [
        admin.name,
        admin.email,
        admin.status,
        formatCreatedAt(admin.created_at),
      ]),
    ];

    const csv = rows.map((columns) => columns.map((value) => escapeCsvValue(String(value))).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = `admin-accounts-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    toast('success', 'Administrator export downloaded.');
  };

  const rangeStart = filteredAdmins.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, filteredAdmins.length);

  return (
    <div className="space-y-6">
      <section className="admin-data-shell relative overflow-hidden rounded-[28px] px-5 py-5 md:px-6 md:py-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          aria-hidden
          style={{
            background:
              'radial-gradient(circle at top right, rgba(212, 175, 55, 0.16), transparent 34%), radial-gradient(circle at bottom left, rgba(115, 14, 27, 0.18), transparent 40%)',
          }}
        />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="border-gold/20 bg-gold/10 text-gold inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
              <ShieldUser className="h-3.5 w-3.5" aria-hidden />
              Administration
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white md:text-3xl">Account Management</h2>
            <p className="text-foreground/65 mt-2 text-sm md:text-base">Manage administrator accounts</p>
          </div>

          <AdminPrimaryButton type="button" onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden />
            Add Admin
          </AdminPrimaryButton>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Total Admins', value: admins.length },
            { label: 'Active Accounts', value: activeCount },
            { label: 'Inactive Accounts', value: inactiveCount },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-gold/15 bg-black/25 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <p className="text-foreground/55 text-xs font-medium uppercase tracking-[0.18em]">{item.label}</p>
              <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-data-shell rounded-[28px] p-4 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="text-foreground/40 pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" aria-hidden />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search admin users..."
              className="input focus:border-gold/55 w-full rounded-2xl border-white/12 bg-black/30 py-3 pl-12 pr-3 text-sm transition duration-200 placeholder:text-foreground/40"
              style={{ paddingLeft: '3.25rem' }}
              aria-label="Search administrators"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'All' | AdminAccountStatus)}
              className={`${adminInputClass()} min-w-[160px]`}
              aria-label="Filter by status"
            >
              <option value="All">All Statuses</option>
              {ADMIN_ACCOUNT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={exportCsv}
              className="border-gold/18 text-foreground/85 hover:border-gold/35 hover:text-gold inline-flex items-center justify-center gap-2 rounded-2xl border bg-black/25 px-4 py-3 text-sm font-medium transition duration-200"
            >
              <Download className="h-4 w-4" aria-hidden />
              Export
            </button>
          </div>
        </div>
      </section>

      <section className="admin-data-shell overflow-hidden rounded-[28px]">
        <div className="border-b border-gold/10 px-4 py-4 md:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-gold/80 text-xs font-semibold uppercase tracking-[0.18em]">Administrator Directory</p>
              <p className="text-foreground/55 mt-1 text-sm">
                {filteredAdmins.length === 0
                  ? 'No administrators match the current filters.'
                  : `Showing ${rangeStart}-${rangeEnd} of ${filteredAdmins.length} administrator${filteredAdmins.length === 1 ? '' : 's'}.`}
              </p>
            </div>
            {loading ? <p className="text-gold text-xs font-medium uppercase tracking-[0.14em]">Refreshing accounts...</p> : null}
          </div>
        </div>

        {filteredAdmins.length === 0 ? (
          <div className="px-4 py-8 md:px-5 md:py-10">
            <AdminEmptyState
              title="No administrator accounts"
              description="Create an administrator, or adjust your search and filter settings."
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-left">
                <thead>
                  <tr className="text-foreground/55 bg-black/25 text-xs uppercase tracking-[0.18em]">
                    <th className="px-4 py-3 font-medium md:px-5">Name</th>
                    <th className="hidden px-4 py-3 font-medium md:table-cell">Email</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="hidden px-4 py-3 font-medium xl:table-cell">Date Created</th>
                    <th className="px-4 py-3 text-right font-medium md:px-5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedAdmins.map((admin) => {
                    const isCurrentAdmin = admin.id === currentAdminId;
                    const isStatusUpdating = statusUpdatingId === admin.id;

                    return (
                      <motion.tr
                        layout
                        key={admin.id}
                        className="group text-sm transition duration-200 hover:bg-white/[0.04]"
                      >
                        <td className="border-b border-white/6 px-4 py-4 align-top md:px-5">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-foreground font-semibold">{admin.name}</p>
                              {isCurrentAdmin ? (
                                <span className="rounded-full border border-gold/20 bg-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-gold">
                                  You
                                </span>
                              ) : null}
                            </div>
                            <p className="text-foreground/50 text-xs md:hidden">{admin.email}</p>
                          </div>
                        </td>
                        <td className="text-foreground/70 hidden border-b border-white/6 px-4 py-4 align-top md:table-cell">
                          {admin.email}
                        </td>
                        <td className="border-b border-white/6 px-4 py-4 align-top">
                          <AdminBadge variant={admin.status.toLowerCase()}>{admin.status}</AdminBadge>
                        </td>
                        <td className="text-foreground/55 hidden border-b border-white/6 px-4 py-4 align-top text-sm xl:table-cell">
                          {formatCreatedAt(admin.created_at)}
                        </td>
                        <td className="border-b border-white/6 px-4 py-4 align-top md:px-5">
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => void toggleStatus(admin)}
                              disabled={isStatusUpdating || isCurrentAdmin}
                              className="border-gold/18 text-foreground/75 hover:border-gold/35 hover:text-gold rounded-xl border bg-black/25 px-3 py-2 text-xs font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-45"
                            >
                              {isCurrentAdmin ? 'Current' : isStatusUpdating ? 'Saving...' : admin.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <AdminIconButton label="Edit admin" onClick={() => openEdit(admin)}>
                              <Pencil className="h-4 w-4" />
                            </AdminIconButton>
                            <AdminIconButton
                              label={isCurrentAdmin ? 'Delete disabled for current account' : 'Delete admin'}
                              destructive
                              disabled={isCurrentAdmin}
                              onClick={() => setPendingDelete({ id: admin.id, name: admin.name })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </AdminIconButton>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-4 md:px-5">
              <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </section>

      <DashboardModal
        open={modalOpen}
        onClose={() => !modalSaving && setModalOpen(false)}
        title={adminForm.id ? 'Edit administrator' : 'Add administrator'}
        description={
          adminForm.id
            ? 'Update the administrator profile or access status.'
            : 'Create a new administrator account for the control panel.'
        }
        size="lg"
        footer={
          <>
            <AdminGhostButton type="button" disabled={modalSaving} onClick={() => setModalOpen(false)}>
              Cancel
            </AdminGhostButton>
            <AdminPrimaryButton type="button" loading={modalSaving} onClick={() => void submitAdmin()}>
              Save
            </AdminPrimaryButton>
          </>
        }
      >
        <form
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void submitAdmin();
          }}
        >
          <AdminField label="Name" htmlFor="admin-name" required error={fieldErrors.name}>
            <input
              id="admin-name"
              className={adminInputClass(!!fieldErrors.name)}
              value={adminForm.name}
              onChange={(event) => setAdminForm((current) => ({ ...current, name: event.target.value }))}
            />
          </AdminField>

          <AdminField label="Email" htmlFor="admin-email" required error={fieldErrors.email}>
            <input
              id="admin-email"
              type="email"
              className={adminInputClass(!!fieldErrors.email)}
              value={adminForm.email}
              onChange={(event) => setAdminForm((current) => ({ ...current, email: event.target.value }))}
            />
          </AdminField>

          <AdminField
            label={adminForm.id ? 'New Password' : 'Password'}
            htmlFor="admin-password"
            required={!adminForm.id}
            error={fieldErrors.password}
          >
            <div className="space-y-2">
              <input
                id="admin-password"
                type="password"
                className={adminInputClass(!!fieldErrors.password)}
                value={adminForm.password}
                onChange={(event) => setAdminForm((current) => ({ ...current, password: event.target.value }))}
                placeholder={adminForm.id ? 'Leave blank to keep the current password' : 'Minimum 8 characters'}
              />
              <p className="text-foreground/45 text-xs">Use at least 8 characters with uppercase, lowercase, and a number.</p>
            </div>
          </AdminField>

          <AdminField label="Status" htmlFor="admin-status" className="md:max-w-xs">
            <select
              id="admin-status"
              className={adminInputClass()}
              value={adminForm.status}
              onChange={(event) =>
                setAdminForm((current) => ({ ...current, status: event.target.value as AdminAccountStatus }))
              }
            >
              {ADMIN_ACCOUNT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </AdminField>
        </form>
      </DashboardModal>

      <ConfirmModal
        open={!!pendingDelete}
        onClose={() => !deleteLoading && setPendingDelete(null)}
        title="Delete administrator?"
        message={pendingDelete ? `Permanently remove ${pendingDelete.name}'s administrator account? This cannot be undone.` : ''}
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
        onConfirm={runDelete}
      />
    </div>
  );
}
