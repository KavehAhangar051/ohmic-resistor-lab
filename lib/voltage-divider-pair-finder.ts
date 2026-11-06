import {
  StandardResistorPair,
  PairSortCriterion,
  DividerApplicationMode,
  ResistorSeriesOption,
  CurrentFilterOption,
  PairTableSortKey,
  SortDirection,
} from '@/types/voltage-divider';
import { formatPrecision } from './resistor-calc';
import {
  formatCurrent,
  formatPower,
  formatResistance,
  decomposeOhms,
} from './voltage-divider-format';
import {
  COMMON_E24_OHMS,
  COMMON_E96_OHMS,
  OHMS_DECOMPOSED_MAP,
} from './e-series';
import {
  RawCandidate,
  MIN_PRACTICAL_CURRENT_AMPS,
  MAX_PRACTICAL_CURRENT_AMPS,
  MAX_E96_ERROR_PCT,
  MAX_E24_ERROR_PCT,
  classifyAdcSuitability,
  classifyBiasStability,
  classifyDomainCategory,
  evaluateLoadStiffness,
  calculateCandidateScore,
  resolveCandidateBadge,
} from './voltage-divider-pair-scoring';

const PAIR_CACHE = new Map<string, StandardResistorPair[]>();
const MAX_PAIR_CACHE = 64;

function evaluateResistorPairCandidate(
  r1: number,
  r2: number,
  vinVolts: number,
  targetVoutVolts: number,
  tolerance: number,
  maxAllowedErr: number,
  appMode: DividerApplicationMode,
  rlOhms?: number | null
): RawCandidate | null {
  const hasLoad = rlOhms !== null && rlOhms !== undefined && rlOhms > 0;
  const r2Eff = hasLoad && rlOhms ? (r2 * rlOhms) / (r2 + rlOhms) : r2;
  const sum = r1 + r2Eff;

  if (sum <= 0) return null;

  const current = vinVolts / sum;

  if (current < MIN_PRACTICAL_CURRENT_AMPS || current > MAX_PRACTICAL_CURRENT_AMPS) {
    return null;
  }

  const actualVout = vinVolts * (r2Eff / sum);
  const errorPct = Math.abs((actualVout - targetVoutVolts) / targetVoutVolts) * 100;

  if (errorPct > maxAllowedErr) return null;

  const vR1 = vinVolts - actualVout;
  const powerR1 = (vR1 * vR1) / r1;
  const powerR2 = (actualVout * actualVout) / r2;
  const power = powerR1 + powerR2;
  const thevenin = (r1 * r2) / (r1 + r2);

  const tolHigh = 1 + tolerance;
  const tolLow = 1 - tolerance;
  const r1Max = r1 * tolHigh;
  const r1Min = r1 * tolLow;
  const r2Min = r2 * tolLow;
  const r2Max = r2 * tolHigh;

  const r2EffMin = hasLoad && rlOhms ? (r2Min * rlOhms) / (r2Min + rlOhms) : r2Min;
  const r2EffMax = hasLoad && rlOhms ? (r2Max * rlOhms) / (r2Max + rlOhms) : r2Max;
  const wcVoutMin = vinVolts * (r2EffMin / (r1Max + r2EffMin));
  const wcVoutMax = vinVolts * (r2EffMax / (r1Min + r2EffMax));
  const wcErrMin = Math.abs((wcVoutMin - targetVoutVolts) / targetVoutVolts) * 100;
  const wcErrMax = Math.abs((wcVoutMax - targetVoutVolts) / targetVoutVolts) * 100;
  const worstCaseErrorPct = Math.max(wcErrMin, wcErrMax);

  const stiffness = evaluateLoadStiffness(thevenin, rlOhms);
  const adc = classifyAdcSuitability(thevenin);
  const bias = classifyBiasStability(thevenin, current);
  const domain = classifyDomainCategory(current);

  const score = calculateCandidateScore(
    appMode,
    errorPct,
    worstCaseErrorPct,
    thevenin,
    current,
    power,
    stiffness.penalty
  );

  return {
    r1,
    r2,
    actualVout,
    errorPct,
    worstCaseVoutMin: wcVoutMin,
    worstCaseVoutMax: wcVoutMax,
    worstCaseErrorPct,
    divisionRatio: actualVout / vinVolts,
    current,
    power,
    powerR1,
    powerR2,
    thevenin,
    stiffnessRatio: stiffness.ratio,
    stiffnessStatus: stiffness.status,
    adcSuitability: adc.status,
    adcSuitabilityLabel: adc.label,
    biasStability: bias.status,
    biasStabilityLabel: bias.label,
    domainCategory: domain.category,
    domainCategoryLabel: domain.label,
    score,
  };
}

function compareCandidatesByCriterion(
  a: RawCandidate,
  b: RawCandidate,
  criterion: PairSortCriterion
): number {
  switch (criterion) {
    case 'accuracy': {
      const errDiff = a.errorPct - b.errorPct;

      return Math.abs(errDiff) > 0.001 ? errDiff : a.score - b.score;
    }

    case 'power': {
      const pwrDiff = a.power - b.power;

      return Math.abs(pwrDiff) > 1e-6 ? pwrDiff : a.errorPct - b.errorPct;
    }

    case 'current': {
      const curA = Math.abs(a.current - 1e-3);
      const curB = Math.abs(b.current - 1e-3);

      return Math.abs(curA - curB) > 1e-5 ? curA - curB : a.errorPct - b.errorPct;
    }

    case 'thevenin': {
      const thDiff = a.thevenin - b.thevenin;

      return Math.abs(thDiff) > 1 ? thDiff : a.errorPct - b.errorPct;
    }

    case 'overall':
    default:
      return a.score - b.score;
  }
}

function selectTopDistinctCandidates(
  candidates: RawCandidate[],
  maxResults: number
): RawCandidate[] {
  const selected: RawCandidate[] = [];
  const ratioCounts = new Map<string, number>();

  for (let i = 0; i < candidates.length; i++) {
    const cand = candidates[i];
    const ratioKey = (cand.r1 / cand.r2).toPrecision(3);
    const count = ratioCounts.get(ratioKey) ?? 0;

    if (count >= 2) continue;

    ratioCounts.set(ratioKey, count + 1);
    selected.push(cand);

    if (selected.length >= maxResults) return selected;
  }

  for (let i = 0; i < candidates.length; i++) {
    const cand = candidates[i];

    if (!selected.includes(cand)) {
      selected.push(cand);

      if (selected.length >= maxResults) break;
    }
  }

  return selected;
}

/**
 * Finds top optimal commercial E24 (5%) or E96 (1%) resistor pairs tailored to real-world electronics applications.
 */
export function findBestE24Pairs(
  vinVolts: number,
  targetVoutVolts: number,
  criterion: PairSortCriterion = 'overall',
  maxResults = 20,
  rlOhms?: number | null,
  appMode: DividerApplicationMode = 'sampling',
  series: ResistorSeriesOption = 'E24'
): StandardResistorPair[] {
  if (vinVolts <= 0 || targetVoutVolts <= 0 || targetVoutVolts >= vinVolts) {
    return [];
  }

  const hasLoad = rlOhms !== null && rlOhms !== undefined && rlOhms > 0;
  const cacheKey = `${vinVolts}_${targetVoutVolts}_${criterion}_${maxResults}_${rlOhms ?? 0}_${appMode}_${series}`;
  const cached = PAIR_CACHE.get(cacheKey);

  if (cached !== undefined) return cached;

  const ohmsList = series === 'E96' ? COMMON_E96_OHMS : COMMON_E24_OHMS;
  const tolerance = series === 'E96' ? 0.01 : 0.05;
  const maxAllowedErr = series === 'E96' ? MAX_E96_ERROR_PCT : MAX_E24_ERROR_PCT;
  const candidates: RawCandidate[] = [];

  for (let i = 0; i < ohmsList.length; i++) {
    const r1 = ohmsList[i];

    for (let j = 0; j < ohmsList.length; j++) {
      const candidate = evaluateResistorPairCandidate(
        r1,
        ohmsList[j],
        vinVolts,
        targetVoutVolts,
        tolerance,
        maxAllowedErr,
        appMode,
        rlOhms
      );

      if (candidate) {
        candidates.push(candidate);
      }
    }
  }

  candidates.sort((a, b) => compareCandidatesByCriterion(a, b, criterion));

  const selected = selectTopDistinctCandidates(candidates, maxResults);
  const results: StandardResistorPair[] = [];

  for (let k = 0; k < selected.length; k++) {
    const cand = selected[k];
    const r1Dec = OHMS_DECOMPOSED_MAP.get(cand.r1) ?? decomposeOhms(cand.r1);
    const r2Dec = OHMS_DECOMPOSED_MAP.get(cand.r2) ?? decomposeOhms(cand.r2);
    const curFmt = formatCurrent(cand.current);
    const rthFmt = formatResistance(cand.thevenin);
    const badge = resolveCandidateBadge(cand, k, appMode, criterion, series);

    results.push({
      r1Value: r1Dec.value,
      r1Unit: r1Dec.unit,
      r2Value: r2Dec.value,
      r2Unit: r2Dec.unit,
      r1Ohms: cand.r1,
      r2Ohms: cand.r2,
      actualVout: cand.actualVout,
      displayVout: formatPrecision(cand.actualVout, 2),
      errorPercentage: parseFloat(cand.errorPct.toFixed(2)),
      worstCaseVoutMin: cand.worstCaseVoutMin,
      worstCaseVoutMax: cand.worstCaseVoutMax,
      worstCaseVoutMinFormatted: formatPrecision(cand.worstCaseVoutMin, 2),
      worstCaseVoutMaxFormatted: formatPrecision(cand.worstCaseVoutMax, 2),
      worstCaseErrorPct: parseFloat(cand.worstCaseErrorPct.toFixed(2)),
      divisionRatio: cand.divisionRatio,
      divisionRatioFormatted: `${formatPrecision(cand.divisionRatio * 100, 1)}%`,
      currentAmperes: cand.current,
      currentFormatted: `${curFmt.value} ${curFmt.unit}`,
      powerWatts: cand.power,
      powerFormatted: formatPower(cand.power),
      powerR1Watts: cand.powerR1,
      powerR1Formatted: formatPower(cand.powerR1),
      powerR2Watts: cand.powerR2,
      powerR2Formatted: formatPower(cand.powerR2),
      theveninOhms: cand.thevenin,
      theveninFormatted: `${rthFmt.value} ${rthFmt.unit}`,
      stiffnessRatio: cand.stiffnessRatio ? parseFloat(cand.stiffnessRatio.toFixed(2)) : undefined,
      stiffnessStatus: cand.stiffnessStatus,
      adcSuitability: cand.adcSuitability,
      adcSuitabilityLabel: cand.adcSuitabilityLabel,
      biasStability: cand.biasStability,
      biasStabilityLabel: cand.biasStabilityLabel,
      domainCategory: cand.domainCategory,
      domainCategoryLabel: cand.domainCategoryLabel,
      series,
      tolerancePct: series === 'E96' ? 1 : 5,
      overallScore: cand.score,
      badge,
      isLoaded: hasLoad,
    });
  }

  if (PAIR_CACHE.size >= MAX_PAIR_CACHE) {
    PAIR_CACHE.delete(PAIR_CACHE.keys().next().value!);
  }

  PAIR_CACHE.set(cacheKey, results);

  return results;
}

/**
 * Filters and sorts standard commercial resistor pairs by current consumption constraint
 * and multi-column engineering criteria with deterministic tie-breaking.
 */
export function filterAndSortResistorPairs(
  pairs: StandardResistorPair[],
  currentFilter: CurrentFilterOption = 'all',
  sortKey: PairTableSortKey = 'score',
  sortDir: SortDirection = 'asc'
): StandardResistorPair[] {
  const filtered = pairs.filter((pair) => {
    if (currentFilter === 'low' && pair.currentAmperes >= 100e-6) return false;

    if (currentFilter === 'mid' && (pair.currentAmperes < 100e-6 || pair.currentAmperes > 5e-3)) {
      return false;
    }

    if (currentFilter === 'high' && pair.currentAmperes <= 5e-3) return false;

    return true;
  });

  const indexed = filtered.map((pair, originalIdx) => ({ pair, originalIdx }));

  indexed.sort((a, b) => {
    let diff = 0;

    switch (sortKey) {
      case 'r1':
        diff = a.pair.r1Ohms - b.pair.r1Ohms;
        break;
      case 'r2':
        diff = a.pair.r2Ohms - b.pair.r2Ohms;
        break;
      case 'error':
        diff = a.pair.errorPercentage - b.pair.errorPercentage;
        break;
      case 'vout':
        diff = a.pair.actualVout - b.pair.actualVout;
        break;
      case 'ratio':
        diff = a.pair.divisionRatio - b.pair.divisionRatio;
        break;
      case 'thevenin':
        diff = a.pair.theveninOhms - b.pair.theveninOhms;
        break;
      case 'current':
        diff = a.pair.currentAmperes - b.pair.currentAmperes;
        break;
      case 'power':
        diff = a.pair.powerWatts - b.pair.powerWatts;
        break;
      case 'worst_case':
        diff = a.pair.worstCaseErrorPct - b.pair.worstCaseErrorPct;
        break;
      case 'score':
      default:
        diff = a.originalIdx - b.originalIdx;
        break;
    }

    if (Math.abs(diff) < 1e-9) {
      diff = a.pair.errorPercentage - b.pair.errorPercentage;

      if (Math.abs(diff) < 1e-9) {
        diff = a.originalIdx - b.originalIdx;
      }
    }

    return sortDir === 'asc' ? diff : -diff;
  });

  return indexed.map((item) => item.pair);
}
