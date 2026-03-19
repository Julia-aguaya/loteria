import type { DemoState } from '@/types/domain';

export type TemporalPreset = 'today' | 'yesterday' | 'latest_cut' | 'last_7_days' | 'current_month' | 'custom';

export interface TemporalRange {
  preset: TemporalPreset;
  start: string;
  end: string;
}

function parseIsoDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(value: string, amount: number) {
  const date = parseIsoDate(value);
  date.setUTCDate(date.getUTCDate() + amount);
  return toIsoDate(date);
}

function addMonths(value: string, amount: number) {
  const date = parseIsoDate(value);
  date.setUTCMonth(date.getUTCMonth() + amount, 1);
  return toIsoDate(date);
}

function diffDays(start: string, end: string) {
  const startTime = parseIsoDate(start).getTime();
  const endTime = parseIsoDate(end).getTime();
  return Math.round((endTime - startTime) / 86400000);
}

function clampDate(value: string, minDate: string, maxDate: string) {
  if (value < minDate) {
    return minDate;
  }

  if (value > maxDate) {
    return maxDate;
  }

  return value;
}

function clampRange(start: string, end: string, minDate: string, maxDate: string) {
  let nextStart = start;
  let nextEnd = end;

  if (nextStart > nextEnd) {
    nextStart = nextEnd;
  }

  if (nextEnd > maxDate) {
    const overflow = diffDays(maxDate, nextEnd);
    nextStart = addDays(nextStart, overflow);
    nextEnd = maxDate;
  }

  if (nextStart < minDate) {
    const underflow = diffDays(nextStart, minDate);
    nextStart = minDate;
    nextEnd = addDays(nextEnd, -underflow);
  }

  return {
    start: clampDate(nextStart, minDate, maxDate),
    end: clampDate(nextEnd, minDate, maxDate),
  };
}

export function getTemporalBounds(state: DemoState) {
  const allDates = [...state.dailySales.map((sale) => sale.date), ...state.transfers.map((transfer) => transfer.date)].sort((a, b) => a.localeCompare(b));
  const minDate = allDates[0] ?? toIsoDate(new Date());
  const maxDate = allDates[allDates.length - 1] ?? minDate;

  return { minDate, maxDate };
}

export function getClosedCutRanges(state: DemoState, referenceDate?: string) {
  const ranges = new Map<string, TemporalRange>();

  state.snapshots
    .filter((snapshot) => (!referenceDate ? true : snapshot.periodEnd <= referenceDate))
    .forEach((snapshot) => {
      const current = ranges.get(snapshot.periodEnd);

      if (!current) {
        ranges.set(snapshot.periodEnd, {
          preset: 'latest_cut',
          start: snapshot.periodStart,
          end: snapshot.periodEnd,
        });
        return;
      }

      if (snapshot.periodStart < current.start) {
        ranges.set(snapshot.periodEnd, {
          ...current,
          start: snapshot.periodStart,
        });
      }
    });

  return [...ranges.values()].sort((a, b) => a.end.localeCompare(b.end));
}

export function resolveTemporalPreset(state: DemoState, preset: Exclude<TemporalPreset, 'custom'>, referenceDate?: string): TemporalRange {
  const { minDate, maxDate } = getTemporalBounds(state);
  const anchor = clampDate(referenceDate ?? maxDate, minDate, maxDate);

  switch (preset) {
    case 'today':
      return { preset, start: anchor, end: anchor };
    case 'yesterday': {
      const previous = clampDate(addDays(anchor, -1), minDate, maxDate);
      return { preset, start: previous, end: previous };
    }
    case 'latest_cut': {
      const latestCut = getClosedCutRanges(state, anchor).slice(-1)[0];
      return latestCut ?? { preset, start: anchor, end: anchor };
    }
    case 'last_7_days':
      return {
        preset,
        start: clampDate(addDays(anchor, -6), minDate, maxDate),
        end: anchor,
      };
    case 'current_month': {
      const monthStart = parseIsoDate(anchor);
      monthStart.setUTCDate(1);

      return {
        preset,
        start: clampDate(toIsoDate(monthStart), minDate, maxDate),
        end: anchor,
      };
    }
  }
}

export function shiftTemporalRange(state: DemoState, range: TemporalRange, direction: -1 | 1) {
  const { minDate, maxDate } = getTemporalBounds(state);

  if (range.preset === 'latest_cut') {
    const cuts = getClosedCutRanges(state);
    const currentIndex = cuts.findIndex((item) => item.start === range.start && item.end === range.end);

    if (currentIndex >= 0) {
      const target = cuts[currentIndex + direction];
      if (target) {
        return target;
      }
      return range;
    }
  }

  if (range.preset === 'current_month') {
    const nextAnchor = clampDate(addMonths(range.end, direction), minDate, maxDate);
    return resolveTemporalPreset(state, 'current_month', nextAnchor);
  }

  const step = Math.max(diffDays(range.start, range.end) + 1, 1) * direction;
  const shifted = clampRange(addDays(range.start, step), addDays(range.end, step), minDate, maxDate);

  return {
    ...range,
    start: shifted.start,
    end: shifted.end,
  };
}

export function buildCustomTemporalRange(state: DemoState, start: string, end: string): TemporalRange {
  const { minDate, maxDate } = getTemporalBounds(state);
  const normalizedStart = clampDate(start, minDate, maxDate);
  const normalizedEnd = clampDate(end, minDate, maxDate);

  return {
    preset: 'custom',
    start: normalizedStart <= normalizedEnd ? normalizedStart : normalizedEnd,
    end: normalizedEnd >= normalizedStart ? normalizedEnd : normalizedStart,
  };
}
