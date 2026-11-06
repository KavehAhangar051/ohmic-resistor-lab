import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateParallelResistance,
  calculateParallelBranchStats,
} from './resistor-calc';
import { calculateVoltageDivider } from './voltage-divider-calc';
import {
  findBestE24Pairs,
  filterAndSortResistorPairs,
} from './voltage-divider-pair-finder';
import {
  calculatePassiveFilter,
  findStandardFilterPairs,
} from './passive-filter-calc';

test('Parallel resistor use case computes equivalent resistance and branch current shares', () => {
  const items = [
    { id: '1', value: '100', unit: 'Ohm' as const, count: 1 },
    { id: '2', value: '100', unit: 'Ohm' as const, count: 1 },
  ];

  const result = calculateParallelResistance(items);

  assert.equal(result.isValid, true);
  assert.equal(result.totalResistanceOhms, 50);
  assert.equal(result.displayValue, '50');
  assert.equal(result.displayUnit, 'Ω');

  const branchStats = calculateParallelBranchStats(items, result.conductanceSiemens);

  assert.equal(branchStats.length, 2);
  assert.equal(branchStats[0].currentShare, '50.0%');
  assert.equal(branchStats[1].currentShare, '50.0%');
});

test('Parallel resistor use case guards short-circuit invariant when a branch is 0 Ohm', () => {
  const items = [
    { id: '1', value: '0', unit: 'Ohm' as const, count: 1 },
    { id: '2', value: '10', unit: 'kOhm' as const, count: 1 },
  ];

  const result = calculateParallelResistance(items);

  assert.equal(result.isValid, true);
  assert.equal(result.isShortCircuit, true);
  assert.equal(result.totalResistanceOhms, 0);

  const branchStats = calculateParallelBranchStats(items, result.conductanceSiemens);

  assert.equal(branchStats[0].isShort, true);
  assert.equal(branchStats[0].currentShare, '100%');
});

test('Voltage divider use case computes output telemetry, safe current, and ADC impedance status', () => {
  const result = calculateVoltageDivider({
    appMode: 'sampling',
    series: 'E24',
    solveMode: 'vout',
    vin: '5',
    vinUnit: 'V',
    vout: '2500',
    voutUnit: 'mV',
    r1: '10',
    r1Unit: 'kOhm',
    r2: '10',
    r2Unit: 'kOhm',
    hasLoad: false,
    rl: '100',
    rlUnit: 'kOhm',
  });

  assert.equal(result.isValid, true);
  assert.equal(result.voutVolts, 2.5);
  assert.equal(result.theveninResistanceOhms, 5000);
  assert.equal(result.targetErrorPct, 0);
  assert.equal(result.adcImpedanceStatus, 'direct');
  assert.equal(result.maxShortCircuitCurrentAmperes, 0.0005);
  assert.equal(result.safeOutputCurrent5PctAmperes, 0.000025);
});

test('E24 pair finder and filter/sort use case filters by current and sorts deterministically', () => {
  const pairs = findBestE24Pairs(5, 2.5, 'overall', 10, null, 'sampling', 'E24');

  assert.equal(pairs.length > 0, true);

  const sortedByR1Desc = filterAndSortResistorPairs(pairs, 'all', 'r1', 'desc');

  assert.equal(sortedByR1Desc.length, pairs.length);
  assert.equal(sortedByR1Desc[0].r1Ohms >= sortedByR1Desc[sortedByR1Desc.length - 1].r1Ohms, true);
});

test('Passive filter use case computes cutoff frequency and returns pre-decomposed standard pairs', () => {
  const filterResult = calculatePassiveFilter({
    topology: 'rc',
    type: 'lowpass',
    resistance: '10',
    resistanceUnit: 'kOhm',
    capacitance: '100',
    capacitanceUnit: 'nF',
    inductance: '10',
    inductanceUnit: 'mH',
    testFrequency: '1',
    testFrequencyUnit: 'kHz',
    vinPeak: '5',
  });

  assert.equal(filterResult.isValid, true);
  assert.equal(Math.round(filterResult.cutoffFreqHz), 159);

  const pairs = findStandardFilterPairs(filterResult.cutoffFreqHz, 'rc', 3);

  assert.equal(pairs.length, 3);
  assert.equal(pairs[0].resistorValue.length > 0, true);
  assert.equal(pairs[0].reactiveUnitCode, 'nF');
});
