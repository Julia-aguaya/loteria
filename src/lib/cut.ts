import type { TemporalRange } from '@/lib/temporal';
import type { DemoState } from '@/types/domain';

export interface CutWindow {
  start: string;
  end: string;
  dates: string[];
  frequencyDays: number;
}

function uniqueSortedDates(values: string[]) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

export function getCutWindows(state: DemoState): CutWindow[] {
  const dates = uniqueSortedDates(state.dailySales.map((sale) => sale.date));
  const frequencyDays = state.configuration.consolidationFrequencyDays;
  const windows: CutWindow[] = [];

  for (let index = 0; index < dates.length; index += frequencyDays) {
    const windowDates = dates.slice(index, index + frequencyDays);
    if (windowDates.length === 0) {
      continue;
    }

    windows.push({
      start: windowDates[0],
      end: windowDates[windowDates.length - 1],
      dates: windowDates,
      frequencyDays,
    });
  }

  return windows;
}

export function getCutWindowForDate(state: DemoState, selectedDate: string) {
  const windows = getCutWindows(state);
  const exactMatch = windows.find((window) => window.start <= selectedDate && selectedDate <= window.end);

  if (exactMatch) {
    return exactMatch;
  }

  return windows.filter((window) => window.end <= selectedDate).slice(-1)[0] ?? windows[0] ?? null;
}

export function getCutWindowCoverage(range: TemporalRange, cut: CutWindow | null) {
  if (!cut) {
    return {
      visibleDays: 0,
      totalDays: 0,
      coversFullCut: false,
      selectedDayIndex: -1,
    };
  }

  return {
    visibleDays: cut.dates.filter((date) => range.start <= date && date <= range.end).length,
    totalDays: cut.dates.length,
    coversFullCut: range.start <= cut.start && cut.end <= range.end,
    selectedDayIndex: cut.dates.indexOf(range.end),
  };
}
