export const CAP_LIMIT_MIN = 50000;
export const CAP_LIMIT_MAX = 5000000;
export const PERCENTAGE_MIN = 0;
export const PERCENTAGE_MAX = 100;

function parseDateParts(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  return { year, month, day };
}

export function isValidIsoDate(value: string) {
  const parts = parseDateParts(value.trim());

  if (!parts) {
    return false;
  }

  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));

  return (
    Number.isFinite(date.getTime()) &&
    date.getUTCFullYear() === parts.year &&
    date.getUTCMonth() === parts.month - 1 &&
    date.getUTCDate() === parts.day
  );
}

export function parseNumericInput(value: string) {
  const normalized = value.trim();

  if (normalized === '') {
    return null;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

export function validateTransferAmount(value: string) {
  const amount = parseNumericInput(value);

  if (amount === null) {
    return 'Ingresa un monto.';
  }

  if (amount <= 0) {
    return 'El monto debe ser mayor a cero.';
  }

  return null;
}

export function validateCapLimit(value: string) {
  const capLimit = parseNumericInput(value);

  if (capLimit === null) {
    return 'Ingresa un cap.';
  }

  if (capLimit < CAP_LIMIT_MIN || capLimit > CAP_LIMIT_MAX) {
    return `El cap debe quedar entre ${CAP_LIMIT_MIN} y ${CAP_LIMIT_MAX}.`;
  }

  return null;
}

export function validatePercentage(value: string, required = true) {
  const percentage = parseNumericInput(value);

  if (percentage === null) {
    return required ? 'Ingresa un porcentaje valido.' : null;
  }

  if (percentage < PERCENTAGE_MIN || percentage > PERCENTAGE_MAX) {
    return `El porcentaje debe quedar entre ${PERCENTAGE_MIN} y ${PERCENTAGE_MAX}.`;
  }

  return null;
}
