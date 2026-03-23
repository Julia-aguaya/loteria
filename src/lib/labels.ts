import type { AgencyMetrics, AgencyStatus } from '@/types/domain';

const agencyStatusLabels: Record<AgencyStatus, string> = {
  active: 'Operativa normal',
  watch: 'Seguimiento manual',
  critical: 'Critica manual',
};

const riskLevelLabels: Record<AgencyMetrics['riskLevel'], string> = {
  healthy: 'Estable',
  attention: 'Riesgo medio',
  critical: 'Riesgo alto',
};

export function getAgencyStatusLabel(status: AgencyStatus) {
  return agencyStatusLabels[status];
}

export function getRiskLevelLabel(riskLevel: AgencyMetrics['riskLevel']) {
  return riskLevelLabels[riskLevel];
}

export function getAgencySituationHelper(metric: Pick<AgencyMetrics, 'capUsage' | 'capRemaining'>) {
  if (metric.capUsage >= 100) {
    return `Tope superado por ${Math.abs(metric.capRemaining).toLocaleString('es-AR')}`;
  }

  return `Faltan ${Math.max(metric.capRemaining, 0).toLocaleString('es-AR')} para llegar al tope`;
}
