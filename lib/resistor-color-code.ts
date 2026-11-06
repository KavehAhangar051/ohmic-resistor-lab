import {
  ResistorItem,
  RESISTOR_UNIT_MAP as UNIT_MULTIPLIER_MAP,
} from '@/types/resistor';

export interface ResistorColorBand {
  color: string;
  name: string;
  nameFa: string;
  textColor?: string;
}

const DIGIT_COLORS: ResistorColorBand[] = [
  { color: '#18181b', name: 'Black', nameFa: 'سیاه', textColor: '#ffffff' },
  { color: '#92400e', name: 'Brown', nameFa: 'قهوه‌ای', textColor: '#ffffff' },
  { color: '#dc2626', name: 'Red', nameFa: 'قرمز', textColor: '#ffffff' },
  { color: '#ea580c', name: 'Orange', nameFa: 'نارنجی', textColor: '#ffffff' },
  { color: '#eab308', name: 'Yellow', nameFa: 'زرد', textColor: '#18181b' },
  { color: '#16a34a', name: 'Green', nameFa: 'سبز', textColor: '#ffffff' },
  { color: '#2563eb', name: 'Blue', nameFa: 'آبی', textColor: '#ffffff' },
  { color: '#9333ea', name: 'Violet', nameFa: 'بنفش', textColor: '#ffffff' },
  { color: '#64748b', name: 'Gray', nameFa: 'خاکستری', textColor: '#ffffff' },
  { color: '#f8fafc', name: 'White', nameFa: 'سفید', textColor: '#18181b' },
];

const GOLD_BAND: ResistorColorBand = {
  color: '#d97706',
  name: 'Gold',
  nameFa: 'طلایی (۵٪)',
  textColor: '#ffffff',
};

const SILVER_BAND: ResistorColorBand = {
  color: '#94a3b8',
  name: 'Silver',
  nameFa: 'نقره‌ای (۱۰٪)',
  textColor: '#18181b',
};

const MIN_COLOR_CODE_OHMS = 0.1;
const MAX_COLOR_CODE_OHMS = 99e6;
const MAX_COLOR_CACHE_SIZE = 64;

const COLOR_BAND_CACHE = new Map<string, ResistorColorBand[] | null>();

function setColorCache(
  key: string,
  value: ResistorColorBand[] | null
): ResistorColorBand[] | null {
  if (COLOR_BAND_CACHE.size >= MAX_COLOR_CACHE_SIZE) {
    COLOR_BAND_CACHE.delete(COLOR_BAND_CACHE.keys().next().value!);
  }

  COLOR_BAND_CACHE.set(key, value);

  return value;
}

function resolveMultiplierBand(multiplierExponent: number): ResistorColorBand | null {
  if (multiplierExponent === -1) return GOLD_BAND;

  if (multiplierExponent === -2) return SILVER_BAND;

  if (multiplierExponent >= 0 && multiplierExponent <= 9) {
    return DIGIT_COLORS[multiplierExponent];
  }

  return null;
}

/**
 * Calculates the standard 4-band EIA color code for a resistor value and unit.
 * Accepts any object with { value, unit } so callers do not need to fabricate
 * branch IDs or counts.
 */
export function getResistorColorBands(
  item: Pick<ResistorItem, 'value' | 'unit'>
): ResistorColorBand[] | null {
  const raw = item.value;

  if (raw.length === 0) return null;

  const cacheKey = `${raw}_${item.unit}`;
  const cached = COLOR_BAND_CACHE.get(cacheKey);

  if (cached !== undefined) return cached;

  const numericValue = parseFloat(raw);

  if (isNaN(numericValue) || numericValue <= 0) {
    return setColorCache(cacheKey, null);
  }

  const multiplier = UNIT_MULTIPLIER_MAP[item.unit] ?? 1;
  const ohms = numericValue * multiplier;

  if (!isFinite(ohms) || ohms < MIN_COLOR_CODE_OHMS || ohms > MAX_COLOR_CODE_OHMS) {
    return setColorCache(cacheKey, null);
  }

  let exponent = Math.floor(Math.log10(ohms));
  let normalized = Math.round((ohms / Math.pow(10, exponent)) * 10) / 10;

  if (normalized >= 10) {
    normalized /= 10;
    exponent += 1;
  }

  const firstDigit = Math.floor(normalized);
  const secondDigit = Math.round((normalized - firstDigit) * 10);

  if (firstDigit < 1 || firstDigit > 9 || secondDigit < 0 || secondDigit > 9) {
    return setColorCache(cacheKey, null);
  }

  const multiplierBand = resolveMultiplierBand(exponent - 1);

  if (!multiplierBand) {
    return setColorCache(cacheKey, null);
  }

  const bands: ResistorColorBand[] = [
    DIGIT_COLORS[firstDigit],
    DIGIT_COLORS[secondDigit],
    multiplierBand,
    GOLD_BAND,
  ];

  return setColorCache(cacheKey, bands);
}
