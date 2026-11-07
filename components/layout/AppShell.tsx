'use client';

import * as React from 'react';
import { LazyMotion, domMax } from 'motion/react';
import {
  Cpu,
  Menu,
  X,
  Compass,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ActiveToolBreadcrumb,
  HeaderToolTabs,
  SidebarToolsNav,
  MobileToolsDrawer,
  AppFooter,
} from './AppShellNavigation';

interface AppShellProps {
  children: React.ReactNode;
  activeToolId?: string;
  onSelectTool?: (toolId: string) => void;
  onPreloadTool?: (toolId: string) => void;
}

export function AppShell({
  children,
  activeToolId = 'parallel-resistor',
  onSelectTool,
  onPreloadTool,
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  const handleCloseMobileMenu = React.useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <LazyMotion features={domMax}>
      <div className="min-h-dvh bg-[#09090b] text-zinc-100 flex flex-col font-vazir" dir="rtl">
        {/* Skip to Main Content Link for Keyboard Accessibility */}
        <a
          href="#main-workspace"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-emerald-500 focus:text-zinc-950 focus:text-xs focus:font-semibold focus:shadow-lg"
        >
          پرش به محتوای اصلی آزمایشگاه
        </a>

        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 h-14 border-b border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
          {/* Zone 1: Brand & Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-tools-drawer"
              className="md:hidden p-2 text-zinc-400 hover:text-zinc-100 rounded-md hover:bg-zinc-800/50 transition-colors duration-200 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              aria-label="منوی ابزارها"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              aria-expanded={!isSidebarCollapsed}
              className="hidden md:flex items-center justify-center h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md border border-zinc-800 transition-[color,background-color,border-color,transform] duration-200 cursor-pointer active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              title={isSidebarCollapsed ? 'باز کردن پنل ابزارها' : 'بستن پنل ابزارها (افزایش عرض فضای کار)'}
              aria-label={isSidebarCollapsed ? 'باز کردن منو' : 'بستن منو'}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4 text-emerald-400" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>

            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-emerald-400 shadow-2xs">
                <Cpu className="h-4 w-4" />
              </div>
              <span className="font-mono text-sm font-bold tracking-tight text-white">
                OHMIC
              </span>
            </div>

            <ActiveToolBreadcrumb activeToolId={activeToolId} />
          </div>

          {/* Zone 2: Direct Top Workbench Tool Switcher */}
          <HeaderToolTabs
            activeToolId={activeToolId}
            onSelectTool={onSelectTool}
            onPreloadTool={onPreloadTool}
          />
        </header>

        {/* Main Workspace Body */}
        <div className="flex-1 flex max-w-[1440px] w-full mx-auto">
          {/* Collapsible Inspector Sidebar (Desktop) */}
          <aside
            className={cn(
              'hidden md:flex flex-col border-l border-zinc-800 bg-[#09090b] shrink-0 transition-[width,padding,opacity] duration-300 ease-in-out overflow-hidden',
              isSidebarCollapsed ? 'w-0 p-0 border-l-0 opacity-0 pointer-events-none' : 'w-64 p-4 opacity-100'
            )}
          >
            <div className="mb-4 px-1">
              <span className="text-[11px] text-zinc-400 font-semibold select-none">
                ابزارهای محاسباتی
              </span>
            </div>

            <SidebarToolsNav
              activeToolId={activeToolId}
              onSelectTool={onSelectTool}
              onPreloadTool={onPreloadTool}
            />

            <div className="mt-auto pt-6 border-t border-zinc-800">
              <div className="rounded-lg border border-zinc-800/90 bg-zinc-900/35 p-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                  <Compass className="h-3.5 w-3.5 text-emerald-400" />
                  <span>راهنمای کاربری</span>
                </div>
                <p className="mt-1.5 text-[11px] text-zinc-400 leading-relaxed text-pretty">
                  برای تغییر واحد مقاومت یا ولتاژ، از منوی کشویی روبروی هر مقدار استفاده کنید.
                </p>
              </div>
            </div>
          </aside>

          {/* Mobile Sidebar Drawer */}
          <MobileToolsDrawer
            open={mobileMenuOpen}
            activeToolId={activeToolId}
            onSelectTool={onSelectTool}
            onPreloadTool={onPreloadTool}
            onClose={handleCloseMobileMenu}
          />

          {/* Content Viewport */}
          <main id="main-workspace" className="flex-1 p-4 sm:p-8 sm:pb-10 min-w-0 transition-[padding] duration-300">
            <div
              className={cn(
                'mx-auto transition-[max-width] duration-300',
                isSidebarCollapsed ? 'max-w-7xl' : 'max-w-6xl'
              )}
            >
              {children}
            </div>
          </main>
        </div>

        {/* Footer with Quick Navigation & Local Computation Privacy Disclosure */}
        <AppFooter activeToolId={activeToolId} onSelectTool={onSelectTool} />
      </div>
    </LazyMotion>
  );
}
