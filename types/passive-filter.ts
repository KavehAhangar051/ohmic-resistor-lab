export type FilterTopology = 'rc' | 'rl';

export type FilterType = 'lowpass' | 'highpass';

export type ResistanceUnit = 'Ohm' | 'kOhm' | 'MOhm';

export type CapacitanceUnit = 'pF' | 'nF' | 'uF';

export type InductanceUnit = 'uH' | 'mH' | 'H';

export type FrequencyUnit = 'Hz' | 'kHz' | 'MHz';

export interface FilterState {
  topology: FilterTopology;
  type: FilterType;
  resistance: string;
  resistanceUnit: ResistanceUnit;
  capacitance: string;
  capacitanceUnit: CapacitanceUnit;
  inductance: string;
  inductanceUnit: InductanceUnit;
  testFrequency: string;
  testFrequencyUnit: FrequencyUnit;
  vinPeak: string;
}

export interface BodePoint {
  freq: number;
  gainDb: number;
  gainLinear: number;
  phaseDeg: number;
}

export interface FilterCalculationResult {
  isValid: boolean;
  errorMsg?: string;
  cutoffFreqHz: number;
  displayFc: string;
  displayFcUnit: string;
  timeConstantSec: number;
  displayTau: string;
  displayTauUnit: string;
  testFreqHz: number;
  gainAtTestDb: number;
  gainAtTestLinear: number;
  phaseAtTestDeg: number;
  voutPeak: number;
  attenuationPct: number;
  reactanceAtCutoffOhms: number;
  bodePoints: BodePoint[];
  standardPairs: StandardFilterPair[];
}

export interface StandardFilterPair {
  resistorOhms: number;
  resistorValue: string;
  resistorUnit: ResistanceUnit;
  resistorDisplay: string;
  reactiveOhmsOrValue: number;
  reactiveDisplay: string;
  reactiveUnit: string;
  reactiveUnitCode: CapacitanceUnit | InductanceUnit;
  actualFc: number;
  displayActualFc: string;
  errorPct: number;
}

export interface BodeViewport {
  width: number;
  height: number;
  padLeft: number;
  padRight: number;
  padTop: number;
  padBottom: number;
}

export interface BodeDecadeTick {
  freq: number;
  label: string;
  x: number;
}

export interface BodeHorizontalGridLine {
  value: number;
  label: string;
  y: number;
}

export interface BodePlotSamplePoint extends BodePoint {
  x: number;
  magY: number;
  phaseY: number;
}

export interface BodePlotProjection {
  plotWidth: number;
  plotHeight: number;
  magPath: string;
  phasePath: string;
  decadeTicks: BodeDecadeTick[];
  magnitudeGrid: BodeHorizontalGridLine[];
  phaseGrid: BodeHorizontalGridLine[];
  fcX: number;
  cutMagY: number;
  cutPhaseY: number;
  testX: number;
  testMagY: number;
  testPhaseY: number;
  samples: BodePlotSamplePoint[];
}


