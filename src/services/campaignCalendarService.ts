/**
 * @file campaignCalendarService.ts
 * @description Custom Sci-Fi Campaign Calendar, Moon Phase & Era Timeline Math Engine.
 */

export interface CalendarMonthConfig {
  name: string;
  days: number;
}

export interface CalendarMoonConfig {
  name: string;
  cycleDays: number;
  phaseOffset?: number;
}

export interface CalendarConfig {
  presetId: 'galactic_standard' | 'terran_metric' | 'orbital_cycle' | 'custom';
  name: string;
  eraName: string;
  epochYear: number;
  daysPerWeek: number;
  dayNames: string[];
  months: CalendarMonthConfig[];
  moons: CalendarMoonConfig[];
}

export interface CalendarDate {
  year: number;
  monthIndex: number; // 0-based
  day: number; // 1-based
  hour?: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: CalendarDate;
  category: 'mission' | 'faction' | 'celestial' | 'deadline' | 'log';
  notes?: string;
  linkedScenarioId?: string;
}

export interface CampaignCalendarState {
  config: CalendarConfig;
  currentDate: CalendarDate;
  events: CalendarEvent[];
}

export const CALENDAR_PRESETS: Record<'galactic_standard' | 'terran_metric' | 'orbital_cycle', CalendarConfig> = {
  galactic_standard: {
    presetId: 'galactic_standard',
    name: 'Galactic Standard (360d)',
    eraName: 'GSY',
    epochYear: 3140,
    daysPerWeek: 6,
    dayNames: ['Solis', 'Vek', 'Taris', 'Kael', 'Nyx', 'Aegis'],
    months: [
      { name: 'Helios I', days: 36 },
      { name: 'Helios II', days: 36 },
      { name: 'Riftward I', days: 36 },
      { name: 'Riftward II', days: 36 },
      { name: 'Zenith I', days: 36 },
      { name: 'Zenith II', days: 36 },
      { name: 'Umbra I', days: 36 },
      { name: 'Umbra II', days: 36 },
      { name: 'Vanguard I', days: 36 },
      { name: 'Vanguard II', days: 36 }
    ],
    moons: [
      { name: 'Selenium Minor', cycleDays: 18, phaseOffset: 2 },
      { name: 'Cryo-Station Moon', cycleDays: 30, phaseOffset: 9 }
    ]
  },
  terran_metric: {
    presetId: 'terran_metric',
    name: 'Terran Unified (365d)',
    eraName: 'A.T.',
    epochYear: 2492,
    daysPerWeek: 7,
    dayNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    months: [
      { name: 'January', days: 31 },
      { name: 'February', days: 28 },
      { name: 'March', days: 31 },
      { name: 'April', days: 30 },
      { name: 'May', days: 31 },
      { name: 'June', days: 30 },
      { name: 'July', days: 31 },
      { name: 'August', days: 31 },
      { name: 'September', days: 30 },
      { name: 'October', days: 31 },
      { name: 'November', days: 30 },
      { name: 'December', days: 31 }
    ],
    moons: [{ name: 'Luna', cycleDays: 29, phaseOffset: 0 }]
  },
  orbital_cycle: {
    presetId: 'orbital_cycle',
    name: 'Habitat Orbital Cycle (360d)',
    eraName: 'CYC',
    epochYear: 812,
    daysPerWeek: 5,
    dayNames: ['Shift-1', 'Shift-2', 'Shift-3', 'Shift-4', 'Maintenance'],
    months: [
      { name: 'Aphelion Q1', days: 45 },
      { name: 'Transit Q2', days: 45 },
      { name: 'Perihelion Q3', days: 45 },
      { name: 'Eclipse Q4', days: 45 },
      { name: 'Resupply Q5', days: 45 },
      { name: 'Drift Q6', days: 45 },
      { name: 'Conjunction Q7', days: 45 },
      { name: 'Burn Q8', days: 45 }
    ],
    moons: [{ name: 'Gas Giant Primary', cycleDays: 12, phaseOffset: 4 }]
  }
};

export function getDaysPerYear(config: CalendarConfig): number {
  return config.months.reduce((sum, m) => sum + Math.max(1, m.days), 0);
}

export function createDefaultCalendarState(
  presetId: 'galactic_standard' | 'terran_metric' | 'orbital_cycle' = 'galactic_standard'
): CampaignCalendarState {
  const cfg = CALENDAR_PRESETS[presetId] || CALENDAR_PRESETS.galactic_standard;
  return {
    config: {
      ...cfg,
      dayNames: [...cfg.dayNames],
      months: cfg.months.map((m) => ({ ...m })),
      moons: cfg.moons.map((m) => ({ ...m }))
    },
    currentDate: {
      year: cfg.epochYear,
      monthIndex: 0,
      day: 1,
      hour: 8
    },
    events: []
  };
}

export function getTotalDaysSinceEpoch(date: CalendarDate, config: CalendarConfig): number {
  const daysInYear = Math.max(1, getDaysPerYear(config));
  const yearDelta = date.year - config.epochYear;
  let dayOfYear = 0;
  const maxMonth = Math.max(0, Math.min(config.months.length - 1, date.monthIndex));
  for (let i = 0; i < maxMonth; i++) {
    dayOfYear += Math.max(1, config.months[i]?.days || 30);
  }
  dayOfYear += Math.max(0, date.day - 1);
  return yearDelta * daysInYear + dayOfYear;
}

export function advanceCalendarDate(
  date: CalendarDate,
  deltaDays: number,
  config: CalendarConfig
): CalendarDate {
  const months = config.months.length > 0 ? config.months : [{ name: 'Cycle 1', days: 30 }];
  const daysInYear = Math.max(1, getDaysPerYear(config));
  const totalDays = getTotalDaysSinceEpoch(date, config) + Math.trunc(deltaDays);

  const yearOffset = Math.floor(totalDays / daysInYear);
  let rem = ((totalDays % daysInYear) + daysInYear) % daysInYear;

  let monthIndex = 0;
  while (monthIndex < months.length - 1) {
    const mDays = Math.max(1, months[monthIndex]?.days || 30);
    if (rem < mDays) break;
    rem -= mDays;
    monthIndex++;
  }

  return {
    year: config.epochYear + yearOffset,
    monthIndex,
    day: rem + 1,
    ...(date.hour !== undefined ? { hour: date.hour } : {})
  };
}

export function compareCalendarDates(a: CalendarDate, b: CalendarDate): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.monthIndex !== b.monthIndex) return a.monthIndex - b.monthIndex;
  if (a.day !== b.day) return a.day - b.day;
  return (a.hour ?? 0) - (b.hour ?? 0);
}

export function formatCalendarDate(date: CalendarDate, config: CalendarConfig): string {
  const month = config.months[date.monthIndex]?.name || `Month ${date.monthIndex + 1}`;
  const totalDays = getTotalDaysSinceEpoch(date, config);
  const weekLen = Math.max(1, config.daysPerWeek || config.dayNames.length || 6);
  const dayIdx = ((totalDays % weekLen) + weekLen) % weekLen;
  const weekday = config.dayNames[dayIdx] || `Day ${dayIdx + 1}`;
  const hourSuffix = date.hour !== undefined ? ` · ${String(date.hour).padStart(2, '0')}:00` : '';
  return `${weekday}, ${date.day} ${month}, ${date.year} ${config.eraName}${hourSuffix}`;
}

export function getMoonPhases(
  date: CalendarDate,
  config: CalendarConfig
): Array<{ name: string; phaseLabel: string; illuminationPct: number }> {
  const totalDays = getTotalDaysSinceEpoch(date, config);
  return (config.moons || []).map((moon) => {
    const cycle = Math.max(2, moon.cycleDays || 28);
    const phaseDay = (((totalDays + (moon.phaseOffset || 0)) % cycle) + cycle) % cycle;
    const ratio = phaseDay / cycle;
    const illuminationPct = Math.round((1 - Math.cos(ratio * Math.PI * 2)) * 50);
    let phaseLabel = 'New Moon';
    if (ratio >= 0.45 && ratio <= 0.55) phaseLabel = 'Full Moon';
    else if (ratio > 0.05 && ratio < 0.45) phaseLabel = ratio < 0.25 ? 'Waxing Crescent' : 'Waxing Gibbous';
    else if (ratio > 0.55 && ratio < 0.95) phaseLabel = ratio < 0.75 ? 'Waning Gibbous' : 'Waning Crescent';

    return {
      name: moon.name,
      phaseLabel,
      illuminationPct
    };
  });
}
