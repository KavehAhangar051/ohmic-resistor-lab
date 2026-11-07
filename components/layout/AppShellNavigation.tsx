'use client';

import * as React from 'react';
import { m, AnimatePresence } from 'motion/react';
import {
  GitBranch,
  Sliders,
  Zap,
  Waves,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface ToolItem {
  id: string;
  name: string;
  enName: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  comingSoon?: boolean;
}

const TOOLS_LIST: ToolItem[] = [
  {
    id: 'parallel-resistor',
    name: 'مقاومت موازی',
    enName: 'Parallel Resistors',
    icon: GitBranch,
    active: true,
  },
  {
    id: 'voltage-divider',
    name: 'مقسم ولتاژ',
    enName: 'Voltage Divider',
    icon: Sliders,
    active: true,
  },
  {
    id: 'passive-filter',
    name: 'فیلتر فرکانسی',
    enName: 'RC / RL Filter',
    icon: Waves,
    active: true,
  },
  {
    id: 'ohms-law',
    name: 'قانون اهم',
    enName: 'Ohm’s Law',
    icon: Zap,
    active: false,
    comingSoon: true,
  },
];

export const ActiveToolBreadcrumb = React.memo(function ActiveToolBreadcrumb({
  activeToolId,
}: {
  activeToolId: string;
}) {
  const currentTool = TOOLS_LIST.find((t) => t.id === activeToolId) || TOOLS_LIST[0];

  return (
    <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 ms-2">
      <span aria-hidden="true">/</span>
      <span>تحلیل مدار</span>
      <span aria-hidden="true">/</span>
      <span className="text-zinc-200 font-medium">{currentTool.name}</span>
    </div>
  );
});

interface ToolNavigationProps {
  activeToolId: string;
  onSelectTool?: (toolId: string) => void;
  onPreloadTool?: (toolId: string) => void;
}

export const HeaderToolTabs = React.memo(function HeaderToolTabs({
  activeToolId,
  onSelectTool,
  onPreloadTool,
}: ToolNavigationProps) {
  return (
    <nav
      aria-label="تب‌های سریع ابزارهای آزمایشگاه"
      className="hidden lg:flex items-center gap-1 rounded-lg border border-zinc-800/90 bg-zinc-950/90 p-1"
    >
      {TOOLS_LIST.map((tool) => {
        if (!tool.active) return null;
        const Icon = tool.icon;
        const isSelected = activeToolId === tool.id;

        return (
          <button
            key={tool.id}
            type="button"
            aria-current={isSelected ? 'page' : undefined}
            onMouseEnter={() => onPreloadTool?.(tool.id)}
            onFocus={() => onPreloadTool?.(tool.id)}
            onClick={() => onSelectTool?.(tool.id)}
            className={cn(
              'relative z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50',
              isSelected ? 'text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            {isSelected ? (
              <m.span
                layoutId="header-active-tool-pill"
                className="absolute inset-0 rounded-md bg-zinc-800/95 border border-zinc-700/70 shadow-xs -z-10"
                transition={{ type: 'spring', stiffness: 480, damping: 34 }}
              />
            ) : null}
            <Icon className={cn('h-3.5 w-3.5', isSelected ? 'text-emerald-400' : 'text-zinc-400')} />
            <span>{tool.name}</span>
          </button>
        );
      })}
    </nav>
  );
});

export const SidebarToolsNav = React.memo(function SidebarToolsNav({
  activeToolId,
  onSelectTool,
  onPreloadTool,
}: ToolNavigationProps) {
  return (
    <nav aria-label="ابزارهای محاسباتی مدار" className="space-y-1">
      {TOOLS_LIST.map((tool) => {
        const Icon = tool.icon;
        const isSelected = activeToolId === tool.id;

        return (
          <button
            key={tool.id}
            type="button"
            aria-current={isSelected ? 'page' : undefined}
            onMouseEnter={() => {
              if (tool.active) onPreloadTool?.(tool.id);
            }}
            onFocus={() => {
              if (tool.active) onPreloadTool?.(tool.id);
            }}
            onClick={() => {
              if (tool.active) onSelectTool?.(tool.id);
            }}
            disabled={!tool.active}
            className={cn(
              'w-full group flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-[color,background-color,border-color,transform] duration-200 text-right active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500/50',
              isSelected
                ? 'bg-zinc-800/90 text-white border border-zinc-700/80 shadow-xs'
                : tool.active
                ? 'text-zinc-300 hover:text-white hover:bg-zinc-800/50 cursor-pointer'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 cursor-not-allowed opacity-60'
            )}
          >
            <div className="flex items-center gap-2.5">
              <Icon
                className={cn(
                  'h-4 w-4 transition-transform duration-200 group-hover:scale-105',
                  isSelected ? 'text-emerald-400' : tool.active ? 'text-zinc-400' : 'text-zinc-500'
                )}
              />
              <span>{tool.name}</span>
            </div>

            {tool.comingSoon ? (
              <Badge variant="subtle" className="text-[10px] py-0 px-1.5">
                به‌زودی
              </Badge>
            ) : isSelected ? (
              <span className="h-1.5 w-1.5 rounded-sm bg-emerald-400" />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
});

interface MobileToolsDrawerProps extends ToolNavigationProps {
  open: boolean;
  onClose: () => void;
}

export const MobileToolsDrawer = React.memo(function MobileToolsDrawer({
  open,
  activeToolId,
  onSelectTool,
  onPreloadTool,
  onClose,
}: MobileToolsDrawerProps) {
  return (
    <AnimatePresence>
      {open ? (
        <m.div
          id="mobile-tools-drawer"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10, transition: { duration: 0.16, ease: [0.3, 0, 1, 1] } }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 top-14 z-50 bg-[#09090b]/95 backdrop-blur-md md:hidden p-4 border-t border-zinc-800"
        >
          <div className="mb-4 px-2">
            <span className="text-[11px] text-zinc-400 font-semibold">ابزارهای محاسباتی</span>
          </div>
          <nav aria-label="ابزارهای محاسباتی مدار (موبایل)" className="space-y-1.5">
            {TOOLS_LIST.map((tool, idx) => {
              const Icon = tool.icon;
              const isSelected = activeToolId === tool.id;

              return (
                <m.button
                  key={tool.id}
                  type="button"
                  disabled={!tool.active}
                  aria-current={isSelected ? 'page' : undefined}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  onMouseEnter={() => {
                    if (tool.active) onPreloadTool?.(tool.id);
                  }}
                  onFocus={() => {
                    if (tool.active) onPreloadTool?.(tool.id);
                  }}
                  onClick={() => {
                    if (tool.active) {
                      onSelectTool?.(tool.id);
                      onClose();
                    }
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm font-medium transition-[color,background-color,border-color,transform] duration-200 text-right active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50',
                    isSelected
                      ? 'bg-zinc-800 text-white border border-zinc-700 cursor-pointer'
                      : tool.active
                      ? 'text-zinc-300 hover:text-white hover:bg-zinc-800/50 cursor-pointer'
                      : 'text-zinc-400 opacity-60 cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn('h-4 w-4', isSelected && 'text-emerald-400')} />
                    <span>{tool.name}</span>
                  </div>
                  {tool.comingSoon ? (
                    <Badge variant="subtle" className="text-[10px]">
                      به‌زودی
                    </Badge>
                  ) : isSelected ? (
                    <span className="h-1.5 w-1.5 rounded-sm bg-emerald-400" />
                  ) : null}
                </m.button>
              );
            })}
          </nav>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
});

export const AppFooter = React.memo(function AppFooter({
  activeToolId,
  onSelectTool,
}: ToolNavigationProps) {
  const [showLegalNote, setShowLegalNote] = React.useState(false);

  return (
    <footer className="border-t border-zinc-800/80 bg-[#09090b]/90 backdrop-blur-xs py-4 px-6 text-xs text-zinc-400">
      <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
          <span className="font-mono text-zinc-300 font-semibold" suppressHydrationWarning>
            OHMIC &copy; {new Date().getFullYear()}
          </span>
          <span className="text-zinc-700" aria-hidden="true">&middot;</span>
          <span className="font-mono text-[11px] text-zinc-400">IEC 60062 / EIA-96</span>
        </div>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          {TOOLS_LIST.map((tool) => {
            if (!tool.active) return null;
            const isSelected = activeToolId === tool.id;

            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => onSelectTool?.(tool.id)}
                className={cn(
                  'text-xs transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 rounded px-1',
                  isSelected ? 'text-emerald-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
                )}
              >
                {tool.name}
              </button>
            );
          })}
          <span className="text-zinc-700" aria-hidden="true">&middot;</span>
          <button
            type="button"
            aria-expanded={showLegalNote}
            onClick={() => setShowLegalNote((prev) => !prev)}
            className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 rounded px-1"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>حریم خصوصی و شرایط استفاده</span>
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {showLegalNote ? (
          <m.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="max-w-[1440px] mx-auto mt-3 pt-3 border-t border-zinc-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-zinc-400"
          >
            <p className="text-pretty max-w-[75ch]">
              تمامی محاسبات مداری به‌صورت محلی در مرورگر شما اجرا می‌شوند و هیچ داده‌ای به سرور ارسال یا ذخیره نمی‌شود. مقادیر پیشنهادی بر پایه جداول استاندارد IEC 60063 (E12/E24/E96) محاسبه شده‌اند.
            </p>
            <span className="font-mono text-[10px] text-emerald-400 shrink-0">
              100% LOCAL CLIENT COMPUTATION
            </span>
          </m.div>
        ) : null}
      </AnimatePresence>
    </footer>
  );
});
