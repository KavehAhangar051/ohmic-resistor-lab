import test from 'node:test';
import assert from 'node:assert/strict';
import { ResistorItem } from '@/types/resistor';
import {
  calculateParallelResistance,
  updateResistorBranch,
  appendResistorBranch,
  removeResistorBranch,
  duplicateResistorBranch,
  getResistorColorBands,
} from './resistor-calc';
import {
  calculateVoltageDivider,
  evaluateVoltageDividerWorkspace,
  applySelectedPairToState,
} from './voltage-divider-calc';
import {
  findBestE24Pairs,
  filterAndSortResistorPairs,
} from './voltage-divider-pair-finder';
import {
  calculatePassiveFilter,
  applyStandardFilterPair,
} from './passive-filter-calc';

test('Deep parallel resistor module returns equivalent resistance and branch telemetry across a single interface', () => {
  const items = [
    { id: '1', value: '100', unit: 'Ohm' as const, count: 1 },
    { id: '2', value: '100', unit: 'Ohm' as const, count: 1 },
  ];

  const result = calculateParallelResistance(items);

  assert.equal(result.isValid, true);
  assert.equal(result.totalResistanceOhms, 50);
  assert.equal(result.displayValue, '50');
  assert.equal(result.displayUnit, 'Ω');
  assert.equal(result.branchStats.length, 2);
  assert.equal(result.branchStats[0].currentShare, '50.0%');
  assert.equal(result.branchStats[1].currentShare, '50.0%');
});

test('Deep parallel resistor module enforces branch collection invariants and short-circuit detection', () => {
  let items: ResistorItem[] = [{ id: '1', value: '0', unit: 'Ohm', count: 1 }];

  // Invariant: removing the last remaining branch is a no-op
  items = removeResistorBranch(items, '1');
  assert.equal(items.length, 1);

  // Appending, updating, and duplicating branches
  items = appendResistorBranch(items, '2');
  items = updateResistorBranch(items, '2', { value: '10', unit: 'kOhm' });
  items = duplicateResistorBranch(items, items[1], '3');
  assert.equal(items.length, 3);
  assert.equal(items[2].id, '3');
  assert.equal(items[2].value, '10');

  const result = calculateParallelResistance(items);

  assert.equal(result.isValid, true);
  assert.equal(result.isShortCircuit, true);
  assert.equal(result.totalResistanceOhms, 0);
  assert.equal(result.branchStats[0].isShort, true);
  assert.equal(result.branchStats[0].currentShare, '100%');
});

test('EIA 4-band color code module encodes 4.7 kOhm accurately', () => {
  const bands = getResistorColorBands({ value: '4.7', unit: 'kOhm' });

  assert.equal(bands !== null, true);
  assert.equal(bands?.[0].name, 'Yellow');
  assert.equal(bands?.[1].name, 'Violet');
  assert.equal(bands?.[2].name, 'Red');
  assert.equal(bands?.[3].name, 'Gold');
});

test('Deep voltage divider workspace module evaluates E24/E96 pairs, effective state, and loaded telemetry in one seam', () => {
  const baseState = {
    appMode: 'sampling' as const,
    series: 'E24' as const,
    solveMode: 'vout' as const,
    vin: '5',
    vinUnit: 'V' as const,
    vout: '2500',
    voutUnit: 'mV' as const,
    r1: '10',
    r1Unit: 'kOhm' as const,
    r2: '10',
    r2Unit: 'kOhm' as const,
    hasLoad: false,
    rl: '100',
    rlUnit: 'kOhm' as const,
  };

  const workspace = evaluateVoltageDividerWorkspace(baseState, 'overall', null);

  assert.equal(workspace.suggestedPairs.length > 0, true);
  assert.equal(workspace.result.isValid, true);
  assert.equal(workspace.result.voutVolts, 2.5);
  assert.equal(workspace.result.adcImpedanceStatus, 'direct');

  // Selecting a suggested pair resolves selectedPair without mutating base state
  const targetPair = workspace.suggestedPairs[1];

  const selection = applySelectedPairToState(
    baseState,
    workspace.suggestedPairs,
    targetPair.r1Value,
    targetPair.r1Unit,
    targetPair.r2Value,
    targetPair.r2Unit
  );

  assert.equal(selection.selectedPair?.r1Ohms, targetPair.r1Ohms);

  // Direct calculation remains deterministic for explicit circuit states
  const directResult = calculateVoltageDivider(baseState);
  assert.equal(directResult.theveninResistanceOhms, 5000);
});

test('E24 pair finder and filter/sort use case filters by current and sorts deterministically', () => {
  const pairs = findBestE24Pairs(5, 2.5, 'overall', 10, null, 'sampling', 'E24');

  assert.equal(pairs.length > 0, true);

  const sortedByR1Desc = filterAndSortResistorPairs(pairs, 'all', 'r1', 'desc');

  assert.equal(sortedByR1Desc.length, pairs.length);
  assert.equal(sortedByR1Desc[0].r1Ohms >= sortedByR1Desc[sortedByR1Desc.length - 1].r1Ohms, true);
});

test('Deep passive filter module synthesizes Bode response, standard commercial pairs, and topology-aware state updates', () => {
  const initialState = {
    topology: 'rc' as const,
    type: 'lowpass' as const,
    resistance: '10',
    resistanceUnit: 'kOhm' as const,
    capacitance: '100',
    capacitanceUnit: 'nF' as const,
    inductance: '10',
    inductanceUnit: 'mH' as const,
    testFrequency: '1',
    testFrequencyUnit: 'kHz' as const,
    vinPeak: '5',
  };

  const lowpassResult = calculatePassiveFilter(initialState);
  const highpassResult = calculatePassiveFilter({ ...initialState, type: 'highpass' });

  assert.equal(lowpassResult.isValid, true);
  assert.equal(Math.round(lowpassResult.cutoffFreqHz), 159);
  assert.equal(lowpassResult.phaseAtTestDeg < 0, true);
  assert.equal(highpassResult.phaseAtTestDeg > 0, true);
  assert.equal(lowpassResult.standardPairs.length > 0, true);

  const topPair = lowpassResult.standardPairs[0];

  const updatedState = applyStandardFilterPair(
    initialState,
    topPair.resistorValue,
    topPair.resistorUnit,
    topPair.reactiveDisplay,
    topPair.reactiveUnitCode
  );

  assert.equal(updatedState.resistance, topPair.resistorValue);
  assert.equal(updatedState.capacitance, topPair.reactiveDisplay);
});
