'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { AppShell } from '@/components/layout/AppShell';
import { VoltageDividerView } from '@/components/voltage-divider/VoltageDividerView';

const PassiveFilterView = dynamic(
  () => import('@/components/passive-filter/PassiveFilterView').then((m) => m.PassiveFilterView)
);

const ResistorCalculatorView = dynamic(
  () => import('@/components/resistor-calculator/ResistorCalculatorView').then((m) => m.ResistorCalculatorView)
);

export default function HomePage() {
  const [activeToolId, setActiveToolId] = React.useState('voltage-divider');

  const handleSelectTool = React.useCallback((toolId: string) => {
    React.startTransition(() => {
      setActiveToolId(toolId);
    });
  }, []);

  const handlePreloadTool = React.useCallback((toolId: string) => {
    if (typeof window === 'undefined') {
      return;
    }

    if (toolId === 'passive-filter') {
      void import('@/components/passive-filter/PassiveFilterView');
    } else if (toolId === 'parallel-resistor') {
      void import('@/components/resistor-calculator/ResistorCalculatorView');
    }
  }, []);

  return (
    <AppShell
      activeToolId={activeToolId}
      onSelectTool={handleSelectTool}
      onPreloadTool={handlePreloadTool}
    >
      {activeToolId === 'voltage-divider' ? (
        <VoltageDividerView />
      ) : activeToolId === 'passive-filter' ? (
        <PassiveFilterView />
      ) : (
        <ResistorCalculatorView />
      )}
    </AppShell>
  );
}

