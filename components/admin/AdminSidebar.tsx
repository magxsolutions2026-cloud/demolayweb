'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  ChevronDown,
  ClipboardList,
  Mail,
  Menu,
  Newspaper,
  PanelLeftClose,
  PanelLeft,
  ShieldUser,
  Users,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { AdminBrandMark } from '@/components/admin/AdminBrandMark';
import type { LandingSection, NavGroup, NavSection } from './types';

const iconFor = (id: LandingSection) => {
  const map: Record<LandingSection, typeof Calendar> = {
    funds: Wallet,
    events: Calendar,
    officers: Users,
    news: Newspaper,
    sirKnights: ShieldUser,
    petitioners: ClipboardList,
    subscribers: Mail,
    accounts: ShieldUser,
  };
  return map[id];
};

function isNavGroup(section: NavSection): section is NavGroup {
  return 'children' in section;
}

export function AdminSidebar({
  sections,
  active,
  onSelect,
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onMobileOpenChange,
  chapterName,
  logoUrl,
}: {
  sections: NavSection[];
  active: LandingSection;
  onSelect: (id: LandingSection) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  /** Public hero title — chapter name */
  chapterName?: string | null;
  logoUrl?: string | null;
}) {
  const widthCls = collapsed ? 'lg:w-[76px]' : 'lg:w-[248px]';
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  return (
    <>
      <AnimatePresence>
        {mobileOpen ? (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm lg:hidden"
            onClick={() => onMobileOpenChange(false)}
          />
        ) : null}
      </AnimatePresence>

      <aside
        className={`admin-sidebar fixed bottom-0 left-0 top-0 z-50 flex h-full flex-col border-r border-gold/15 bg-[#0e0c14]/95 backdrop-blur-xl transition-[width,transform] duration-300 ease-out lg:static lg:z-0 lg:translate-x-0 ${widthCls} ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className={`flex items-center gap-2 border-b border-white/10 py-4 ${collapsed ? 'lg:justify-center lg:px-2' : 'px-4'}`}>
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="text-foreground/60 hover:text-gold hidden rounded-xl border border-transparent p-2 transition duration-200 hover:border-gold/25 hover:bg-white/5 lg:inline-flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
          <button
            type="button"
            className="text-foreground/70 hover:text-gold ml-auto rounded-xl p-2 lg:hidden"
            aria-label="Close navigation"
            onClick={() => onMobileOpenChange(false)}
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
        </div>

        {chapterName?.trim() || logoUrl?.trim() ? (
          <div
            className={`border-b border-white/10 px-3 py-3 ${collapsed ? 'lg:flex lg:justify-center lg:px-2' : ''}`}
          >
            <div
              className={`flex items-center gap-3 ${collapsed ? 'lg:flex-col lg:items-center lg:gap-2' : 'flex-row'}`}
            >
              <AdminBrandMark
                logoUrl={logoUrl}
                fallbackSrc="/logo.png"
                alt={chapterName || 'Chapter'}
                size={collapsed ? 'sm' : 'md'}
                className={collapsed ? 'lg:mx-auto' : ''}
              />
              {chapterName?.trim() && !collapsed ? (
                <p className="text-gold/90 min-w-0 flex-1 line-clamp-6 text-xs font-semibold leading-snug tracking-tight">
                  {chapterName}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        <nav className={`flex-1 space-y-1 overflow-y-auto py-4 ${collapsed ? 'lg:px-2' : 'px-3'}`}>
          <p className={`text-foreground/45 mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] ${collapsed ? 'lg:hidden' : ''}`}>
            Modules
          </p>
          {sections.map((section) => {
            if (isNavGroup(section)) {
              const groupActive = section.children.some((child) => child.id === active);
              const groupOpen = groupActive || openGroups[section.id] === true;

              return (
                <div key={section.id} className="space-y-1">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenGroups((current) => ({
                        ...current,
                        [section.id]: !groupOpen,
                      }))
                    }
                    className={`relative flex w-full items-center gap-3 rounded-xl py-2.5 text-left text-sm font-medium transition duration-200 ease-out ${
                      collapsed ? 'lg:justify-center lg:px-0 lg:py-3' : 'px-3'
                    } ${
                      groupActive
                        ? 'text-gold bg-gold/[0.12]'
                        : 'text-foreground/75 hover:bg-white/[0.06] hover:text-foreground'
                    }`}
                    aria-expanded={groupOpen}
                    aria-controls={`${section.id}-submenu`}
                  >
                    {groupActive ? (
                      <span className="bg-gold absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full shadow-[0_0_12px_rgba(212,175,55,0.5)] lg:left-1" />
                    ) : null}
                    <Users className={`h-5 w-5 shrink-0 ${groupActive ? 'text-gold' : 'text-foreground/55'}`} aria-hidden />
                    <span className={`min-w-0 flex-1 truncate ${collapsed ? 'lg:hidden' : ''}`}>{section.label}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition duration-200 ${groupOpen ? 'rotate-180 text-gold' : 'text-foreground/45'} ${
                        collapsed ? 'lg:hidden' : ''
                      }`}
                      aria-hidden
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {groupOpen ? (
                      <motion.div
                        id={`${section.id}-submenu`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className={`space-y-1 ${collapsed ? '' : 'pl-4'}`}>
                          {section.children.map((child) => {
                            const ChildIcon = iconFor(child.id);
                            const isChildActive = active === child.id;

                            return (
                              <button
                                key={child.id}
                                type="button"
                                onClick={() => {
                                  onSelect(child.id);
                                  onMobileOpenChange(false);
                                }}
                                className={`relative flex w-full items-center gap-3 rounded-xl py-2.5 text-left text-sm font-medium transition duration-200 ease-out ${
                                  collapsed ? 'lg:justify-center lg:px-0 lg:py-3' : 'px-3'
                                } ${
                                  isChildActive
                                    ? 'text-gold bg-gold/[0.12]'
                                    : 'text-foreground/70 hover:bg-white/[0.05] hover:text-foreground'
                                }`}
                              >
                                {isChildActive ? (
                                  <span className="bg-gold absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full shadow-[0_0_10px_rgba(212,175,55,0.45)] lg:left-1" />
                                ) : null}
                                <ChildIcon
                                  className={`h-4 w-4 shrink-0 ${isChildActive ? 'text-gold' : 'text-foreground/50'}`}
                                  aria-hidden
                                />
                                <span className={`truncate ${collapsed ? 'lg:hidden' : ''}`}>{child.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            }

            const Icon = iconFor(section.id);
            const isActive = active === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  onSelect(section.id);
                  onMobileOpenChange(false);
                }}
                className={`relative flex w-full items-center gap-3 rounded-xl py-2.5 text-left text-sm font-medium transition duration-200 ease-out ${
                  collapsed ? 'lg:justify-center lg:px-0 lg:py-3' : 'px-3'
                } ${
                  isActive
                    ? 'text-gold bg-gold/[0.12]'
                    : 'text-foreground/75 hover:bg-white/[0.06] hover:text-foreground'
                }`}
              >
                {isActive ? (
                  <span className="bg-gold absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full shadow-[0_0_12px_rgba(212,175,55,0.5)] lg:left-1" />
                ) : null}
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-gold' : 'text-foreground/55'}`} aria-hidden />
                <span className={`truncate ${collapsed ? 'lg:hidden' : ''}`}>{section.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export function AdminSidebarMobileTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-foreground/80 hover:text-gold inline-flex rounded-xl border border-white/15 bg-black/25 p-2 transition duration-200 hover:border-gold/35 lg:hidden"
      aria-label="Open navigation"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
