'use client';

import * as React from 'react';

/**
 * Layout-matched skeleton loader for dynamic laboratory tool views.
 * Replaces blank loading states with structural placeholders matching the schematic and telemetry grid.
 */
export function WorkspaceSkeleton() {
  return (
    <div
      role="status"
      aria-label="در حال بارگذاری ابزار آزمایشگاهی"
      className="space-y-6 animate-pulse select-none"
    >
      {/* Header Skeleton */}
      <div className="border-b border-zinc-800/80 pb-5 space-y-2.5">
        <div className="flex items-center gap-3">
          <div className="h-7 w-52 rounded-lg bg-zinc-800/70" />
          <div className="h-5 w-28 rounded-md bg-emerald-950/50 border border-emerald-900/30" />
        </div>
        <div className="h-4 w-80 max-w-full rounded-md bg-zinc-900" />
      </div>

      {/* Schematic Stage Skeleton */}
      <div className="rounded-xl border border-zinc-800 bg-[#0e0e11] overflow-hidden">
        <div className="h-12 border-b border-zinc-800/80 bg-zinc-950 px-4 flex items-center justify-between">
          <div className="h-5 w-40 rounded-md bg-zinc-800/60" />
          <div className="flex items-center gap-2">
            <div className="h-6 w-20 rounded-md bg-zinc-900" />
            <div className="h-6 w-24 rounded-md bg-zinc-900" />
          </div>
        </div>
        <div className="h-[220px] bg-[#09090b] flex items-center justify-center">
          <div className="h-28 w-3/4 rounded-lg border border-zinc-800/50 bg-zinc-900/20" />
        </div>
        <div className="h-9 border-t border-zinc-800/60 bg-zinc-950/40 px-4 flex items-center gap-4">
          <div className="h-3 w-24 rounded bg-zinc-800/50" />
          <div className="h-3 w-28 rounded bg-zinc-800/50" />
        </div>
      </div>

      {/* Two-Column Inputs & Monitor Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-3">
          <div className="h-16 rounded-xl border border-zinc-800/80 bg-[#121215]" />
          <div className="h-16 rounded-xl border border-zinc-800/80 bg-[#121215]" />
          <div className="h-10 rounded-lg bg-zinc-800/60" />
        </div>
        <div className="lg:col-span-5">
          <div className="h-56 rounded-xl border border-zinc-800 bg-[#121215]" />
        </div>
      </div>
    </div>
  );
}
