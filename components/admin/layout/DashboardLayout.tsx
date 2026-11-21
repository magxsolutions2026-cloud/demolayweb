'use client';

import type { ReactNode } from 'react';
import { Sidebar, type SidebarProps } from './Sidebar';
import { Topbar, type TopbarProps } from './Topbar';

export function DashboardLayout({
  sidebar,
  topbar,
  children,
}: {
  sidebar: SidebarProps;
  topbar: TopbarProps;
  children: ReactNode;
}) {
  return (
    <div className="admin-dashboard-bg flex h-[100dvh] overflow-hidden text-foreground font-sans">
      <Sidebar {...sidebar} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Topbar {...topbar} />
        <main className="admin-scroll min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">{children}</div>
        </main>
      </div>
    </div>
  );
}
