'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Sliders } from 'lucide-react';
import {
  VoltageDividerState,
  VoltageUnit,
  PairSortCriterion,
  StandardResistorPair,
} from '@/types/voltage-divider';
import { ResistorUnit } from '@/types/resistor';
import {
  evaluateVoltageDividerWorkspace,
  applySelectedPairToState,
} from '@/lib/voltage-divider-calc';
import { DividerSchematic } from './DividerSchematic';
import { DividerResultDisplay } from './DividerResultDisplay';
import { DividerParameterRow } from './DividerParameterRow';
import { DividerStandardPairPicker } from './DividerStandardPairPicker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const DEFAULT_DIVIDER_STATE: VoltageDividerState = {
  appMode: 'sampling',
  series: 'E24',
  solveMode: 'vout',
  vin: '5',
  vinUnit: 'V',
  vout: '2.5',
  voutUnit: 'V',
  r1: '10',
  r1Unit: 'kOhm',
  r2: '10',
  r2Unit: 'kOhm',
  hasLoad: false,
  rl: '100',
  rlUnit: 'kOhm',
};

export function VoltageDividerView() {
  const [state, setState] = React.useState<VoltageDividerState>(DEFAULT_DIVIDER_STATE);
  const [pairCriterion, setPairCriterion] = React.useState<PairSortCriterion>('overall');
  const [selectedPair, setSelectedPair] = React.useState<StandardResistorPair | null>(null);

  const { effectiveState, result, suggestedPairs } = React.useMemo(
    () => evaluateVoltageDividerWorkspace(state, pairCriterion, selectedPair),
    [state, pairCriterion, selectedPair]
  );

  const updateField = React.useCallback(
    <K extends keyof VoltageDividerState>(field: K, value: VoltageDividerState[K]) => {
      setState((prev) => ({ ...prev, [field]: value }));

      if (field === 'vin' || field === 'vout' || field === 'hasLoad' || field === 'rl' || field === 'rlUnit') {
        setSelectedPair(null);
      }
    },
    []
  );

  const handleApplyPair = React.useCallback(
    (r1: string, r1Unit: ResistorUnit, r2: string, r2Unit: ResistorUnit) => {
      setState((prev) => {
        const selection = applySelectedPairToState(prev, suggestedPairs, r1, r1Unit, r2, r2Unit);
        setSelectedPair(selection.selectedPair);

        return selection.nextState;
      });
    },
    [suggestedPairs]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
      className="space-y-6"
    >
      {/* Title & Scope Header */}
      <div className="border-b border-zinc-800/80 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5 text-balance">
          <Sliders className="h-6 w-6 text-emerald-400" />
          <span>محاسبه‌گر مقسم ولتاژ</span>
          <Badge variant="subtle" className="text-[11px] font-mono border-emerald-900/50 bg-emerald-950/40 text-emerald-400 pt-1 pb-0.5 leading-none">
            Voltage Divider
          </Badge>
        </h1>
      </div>

      {/* Dynamic Circuit Schematic (Live EDA visualization with calculated R1 and R2) */}
      <DividerSchematic state={effectiveState} result={result} />

          {/* Main Grid: Inputs Workspace & Output Monitor */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Circuit Inputs */}
            <div className="lg:col-span-7 space-y-3">
              <div className="space-y-2.5">
                {/* Input 1: Vin (Supply Voltage) */}
                <DividerParameterRow
                  id="vin"
                  label="ولتاژ ورودی مدار (تغذیه Vin)"
                  tag="Vin"
                  value={state.vin}
                  unit={state.vinUnit}
                  unitType="voltage"
                  placeholder="5 یا 12"
                  onChangeValue={(val) => updateField('vin', val)}
                  onChangeUnit={(unit) => {
                    // SAFETY: unitType="voltage" restricts options to VoltageUnit
                    updateField('vinUnit', unit as VoltageUnit);
                  }}
                  showColorCode={false}
                />

                {/* Input 2: Target Vout (Desired Output Voltage) */}
                <DividerParameterRow
                  id="vout"
                  label="ولتاژ خروجی مورد نظر (Vout هدف)"
                  tag="Vout"
                  value={state.vout}
                  unit={state.voutUnit}
                  unitType="voltage"
                  placeholder="2.5 یا 3.3"
                  onChangeValue={(val) => updateField('vout', val)}
                  onChangeUnit={(unit) => {
                    // SAFETY: unitType="voltage" restricts options to VoltageUnit
                    updateField('voutUnit', unit as VoltageUnit);
                  }}
                  showColorCode={false}
                />

                {/* Input 3: RL (Optional Load Resistor) */}
                <AnimatePresence>
                  {state.hasLoad && (
                    <DividerParameterRow
                      id="rl"
                      label="مقاومت بار خروجی (RL)"
                      tag="RL"
                      value={state.rl}
                      unit={state.rlUnit}
                      unitType="resistor"
                      placeholder="100"
                      canDelete={true}
                      onDelete={() => updateField('hasLoad', false)}
                      onChangeValue={(val) => updateField('rl', val)}
                      onChangeUnit={(unit) => {
                        // SAFETY: unitType="resistor" restricts options to ResistorUnit
                        updateField('rlUnit', unit as ResistorUnit);
                      }}
                      showColorCode={true}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Add Load Resistor Button */}
              {!state.hasLoad && (
                <div className="pt-1">
                  <Button
                    type="button"
                    variant="solid"
                    size="md"
                    onClick={() => updateField('hasLoad', true)}
                    className="w-full justify-center text-xs font-medium bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm group cursor-pointer"
                  >
                    <Plus className="h-4 w-4 ms-1.5 transition-transform duration-200 group-hover:rotate-90" />
                    <span>افزودن مقاومت بار (RL) به مدار</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Right Column: Calculated Deliverable (R1 & R2) and Circuit Telemetry */}
            <div className="lg:col-span-5 sticky top-6">
              <DividerResultDisplay state={effectiveState} result={result} />
            </div>
          </div>

          {/* Top Commercial E24 / E96 Resistor Pairs Tailored to Application Mode (Full Width) */}
          <div className="w-full">
            <DividerStandardPairPicker
              pairs={suggestedPairs}
              currentCriterion={pairCriterion}
              onChangeCriterion={setPairCriterion}
              appMode={state.appMode}
              onChangeAppMode={(mode) => updateField('appMode', mode)}
              series={state.series}
              onChangeSeries={(series) => updateField('series', series)}
              hasLoad={state.hasLoad}
              rlValue={state.rl}
              rlUnit={state.rlUnit}
              onApplyPair={handleApplyPair}
              activeR1={{ value: effectiveState.r1, unit: effectiveState.r1Unit }}
              activeR2={{ value: effectiveState.r2, unit: effectiveState.r2Unit }}
            />
          </div>
    </motion.div>
  );
}
