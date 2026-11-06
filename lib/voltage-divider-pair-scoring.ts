import {
  DividerApplicationMode,
  PairSortCriterion,
  ResistorSeriesOption,
} from '@/types/voltage-divider';

export const MIN_PRACTICAL_CURRENT_AMPS = 1e-6;
export const MAX_PRACTICAL_CURRENT_AMPS = 100e-3;
export const MAX_E96_ERROR_PCT = 4.0;
export const MAX_E24_ERROR_PCT = 8.0;

const ADC_DIRECT_MAX_RTH_OHMS = 10e3;
const ADC_BUFFERED_MAX_RTH_OHMS = 50e3;
const BIAS_STIFF_MAX_RTH_OHMS = 20e3;
const BIAS_STIFF_MIN_CURRENT_AMPS = 0.8e-3;
const BIAS_MODERATE_MAX_RTH_OHMS = 80e3;
const BIAS_MODERATE_MIN_CURRENT_AMPS = 0.15e-3;
const LOW_POWER_MAX_CURRENT_AMPS = 100e-6;
const GENERAL_MAX_CURRENT_AMPS = 2.5e-3;
const EXCELLENT_STIFFNESS_RATIO = 50;
const GOOD_STIFFNESS_RATIO = 10;

export interface RawCandidate {
  r1: number;
  r2: number;
  actualVout: number;
  errorPct: number;
  worstCaseVoutMin: number;
  worstCaseVoutMax: number;
  worstCaseErrorPct: number;
  divisionRatio: number;
  current: number;
  power: number;
  powerR1: number;
  powerR2: number;
  thevenin: number;
  stiffnessRatio?: number;
  stiffnessStatus: 'excellent' | 'good' | 'poor' | 'unloaded';
  adcSuitability: 'direct' | 'buffered' | 'high_impedance';
  adcSuitabilityLabel: string;
  biasStability: 'stiff' | 'moderate' | 'soft';
  biasStabilityLabel: string;
  domainCategory: 'low_power' | 'general' | 'high_drive';
  domainCategoryLabel: string;
  score: number;
}

export interface AdcSuitabilityClassification {
  status: 'direct' | 'buffered' | 'high_impedance';
  label: string;
}

export interface BiasStabilityClassification {
  status: 'stiff' | 'moderate' | 'soft';
  label: string;
}

export interface DomainCategoryClassification {
  category: 'low_power' | 'general' | 'high_drive';
  label: string;
}

export interface LoadStiffnessEvaluation {
  ratio?: number;
  status: 'excellent' | 'good' | 'poor' | 'unloaded';
  penalty: number;
}

const ADC_DIRECT: AdcSuitabilityClassification = Object.freeze({
  status: 'direct',
  label: 'سازگار مستقیم (بدون بافر)',
});

const ADC_BUFFERED: AdcSuitabilityClassification = Object.freeze({
  status: 'buffered',
  label: 'نیاز به خازن نویزگیر / فرکانس کم',
});

const ADC_HIGH_IMP: AdcSuitabilityClassification = Object.freeze({
  status: 'high_impedance',
  label: 'امپدانس بالا (نیازمند بافر Op-Amp)',
});

const BIAS_STIFF: BiasStabilityClassification = Object.freeze({
  status: 'stiff',
  label: 'بایاس سفت و پایدار (Stiff)',
});

const BIAS_MODERATE: BiasStabilityClassification = Object.freeze({
  status: 'moderate',
  label: 'بایاس متوسط (Moderate)',
});

const BIAS_SOFT: BiasStabilityClassification = Object.freeze({
  status: 'soft',
  label: 'بایاس حساس به تغییرات بتا (Soft)',
});

const DOMAIN_LOW_POWER: DomainCategoryClassification = Object.freeze({
  category: 'low_power',
  label: 'کم‌مصرف (سنسور/باتری)',
});

const DOMAIN_GENERAL: DomainCategoryClassification = Object.freeze({
  category: 'general',
  label: 'عمومی (سیگنال/ADC)',
});

const DOMAIN_HIGH_DRIVE: DomainCategoryClassification = Object.freeze({
  category: 'high_drive',
  label: 'درایو قوی (بایاس)',
});

const UNLOADED_STIFFNESS: LoadStiffnessEvaluation = Object.freeze({
  status: 'unloaded',
  penalty: 0,
});

export function classifyAdcSuitability(theveninOhms: number): AdcSuitabilityClassification {
  if (theveninOhms <= ADC_DIRECT_MAX_RTH_OHMS) {
    return ADC_DIRECT;
  }

  if (theveninOhms <= ADC_BUFFERED_MAX_RTH_OHMS) {
    return ADC_BUFFERED;
  }

  return ADC_HIGH_IMP;
}

export function classifyBiasStability(
  theveninOhms: number,
  currentAmps: number
): BiasStabilityClassification {
  if (theveninOhms <= BIAS_STIFF_MAX_RTH_OHMS && currentAmps >= BIAS_STIFF_MIN_CURRENT_AMPS) {
    return BIAS_STIFF;
  }

  if (
    theveninOhms <= BIAS_MODERATE_MAX_RTH_OHMS &&
    currentAmps >= BIAS_MODERATE_MIN_CURRENT_AMPS
  ) {
    return BIAS_MODERATE;
  }

  return BIAS_SOFT;
}

export function classifyDomainCategory(currentAmps: number): DomainCategoryClassification {
  if (currentAmps < LOW_POWER_MAX_CURRENT_AMPS) {
    return DOMAIN_LOW_POWER;
  }

  if (currentAmps <= GENERAL_MAX_CURRENT_AMPS) {
    return DOMAIN_GENERAL;
  }

  return DOMAIN_HIGH_DRIVE;
}

export function evaluateLoadStiffness(
  theveninOhms: number,
  rlOhms?: number | null
): LoadStiffnessEvaluation {
  if (!rlOhms || rlOhms <= 0) {
    return UNLOADED_STIFFNESS;
  }

  const ratio = rlOhms / (theveninOhms > 0 ? theveninOhms : 1);

  const status =
    ratio >= EXCELLENT_STIFFNESS_RATIO
      ? 'excellent'
      : ratio >= GOOD_STIFFNESS_RATIO
      ? 'good'
      : 'poor';

  const penalty = ratio < GOOD_STIFFNESS_RATIO ? ((GOOD_STIFFNESS_RATIO - ratio) / GOOD_STIFFNESS_RATIO) * 3.0 : 0;

  return { ratio, status, penalty };
}

export function calculateCandidateScore(
  appMode: DividerApplicationMode,
  errorPct: number,
  worstCaseErrorPct: number,
  theveninOhms: number,
  currentAmps: number,
  powerWatts: number,
  stiffnessPenalty: number
): number {
  const normalizedPowerMw = powerWatts * 1e3;

  if (appMode === 'sampling') {
    const rthPenalty =
      theveninOhms > ADC_DIRECT_MAX_RTH_OHMS
        ? Math.log10(theveninOhms / ADC_DIRECT_MAX_RTH_OHMS) * 4.0
        : 0;

    const currentPenalty =
      currentAmps > 2e-3 ? (currentAmps - 2e-3) * 1000 : currentAmps < 20e-6 ? 0.5 : 0;

    return errorPct * 4.0 + worstCaseErrorPct * 1.5 + rthPenalty + currentPenalty + stiffnessPenalty;
  }

  if (appMode === 'biasing') {
    const rthPenalty = theveninOhms > 25e3 ? Math.log10(theveninOhms / 25e3) * 2.5 : 0;
    const currentDiff = Math.abs(Math.log10(currentAmps / 1.5e-3));

    return (
      errorPct * 2.5 +
      rthPenalty +
      currentDiff * 2.0 +
      normalizedPowerMw * 0.08 +
      stiffnessPenalty
    );
  }

  return errorPct * 4.0 + worstCaseErrorPct * 3.0 + normalizedPowerMw * 0.06 + stiffnessPenalty;
}

export function resolveCandidateBadge(
  cand: RawCandidate,
  rankIndex: number,
  appMode: DividerApplicationMode,
  criterion: PairSortCriterion,
  series: ResistorSeriesOption
): string | undefined {
  if (cand.errorPct === 0) return 'دقیق‌ترین (۰٪ خطا)';

  if (rankIndex !== 0) return undefined;

  if (appMode === 'sampling' && cand.thevenin <= ADC_DIRECT_MAX_RTH_OHMS) {
    return 'ایده‌آل ADC (امپدانس کم)';
  }

  if (appMode === 'biasing' && cand.biasStability === 'stiff') {
    return 'بایاس سفت و پایدار';
  }

  const maxReferenceWcErr = series === 'E96' ? 1.2 : 5.2;

  if (appMode === 'reference' && cand.worstCaseErrorPct <= maxReferenceWcErr) {
    return 'رفرنس کم‌نوسان';
  }

  if (criterion === 'power') return 'کم‌مصرف‌ترین';

  if (criterion === 'thevenin') return 'کمترین امپدانس';

  if (criterion === 'overall') return 'بهترین تعادل کلی';

  return undefined;
}
