export function formatCurrency(value: number, currency = 'ARS') {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function formatCompact(value: number, currency = 'ARS') {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatCompactCurrency(value: number, currency = 'ARS') {
  return formatCompact(value, currency);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value));
}

export function formatDateRange(start?: string | null, end?: string | null) {
  if (!start && !end) {
    return 'Sin corte cerrado';
  }

  if (!start || !end || start === end) {
    return formatDate(start ?? end ?? '');
  }

  return `${formatShortDate(start)} - ${formatDate(end)}`;
}
