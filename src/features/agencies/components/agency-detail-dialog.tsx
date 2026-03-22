import { useMemo } from 'react';
import { ArrowRightLeft } from 'lucide-react';

import { useDemoStore } from '@/app/store/demo-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getAgencyDetailSummary } from '@/lib/business';
import { formatCurrency, formatDateRange } from '@/lib/format';
import { getRiskLevelLabel } from '@/lib/labels';
import type { AgencyMetrics } from '@/types/domain';

export function AgencyDetailDialog({
  metric,
  open,
  onOpenChange,
  onQuickTransfer,
  selectedDate,
}: {
  metric: AgencyMetrics | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuickTransfer: (metric: AgencyMetrics) => void;
  selectedDate: string;
}) {
  const state = useDemoStore();
  const detail = useMemo(() => (metric ? getAgencyDetailSummary(state, metric.agency.id, selectedDate) : null), [metric, selectedDate, state]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="[overflow-wrap:anywhere]">{detail?.metric.agency.name ?? 'Detalle de agencia'}</DialogTitle>
        </DialogHeader>

        {detail ? (
          <div className="space-y-5">
            <section className="detail-hero">
              <div className="flex flex-wrap gap-2">
                <Badge variant={getRiskBadgeVariant(detail.metric.riskLevel)}>{getRiskLevelLabel(detail.metric.riskLevel)}</Badge>
                <Badge variant={getCollectionBadgeVariant(detail.metric.latestCycleStatus)}>{detail.metric.latestCycleStatus}</Badge>
                <Badge variant="accent">{detail.metric.agency.fleetName}</Badge>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {detail.metric.pendingBalance > 0 ? 'Pendiente de cobro' : 'Estado del cierre'}
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground [overflow-wrap:anywhere] sm:text-4xl">
                  {detail.metric.pendingBalance > 0 ? formatCurrency(detail.metric.pendingBalance) : 'Sin pendiente hoy'}
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground [overflow-wrap:anywhere]">{getUrgencyNarrative(detail.metric)}</p>
              </div>

              <Button size="lg" className="w-full" onClick={() => onQuickTransfer(detail.metric)}>
                <ArrowRightLeft className="h-4 w-4" />
                Registrar transferencia
              </Button>
            </section>

            <Card>
              <CardHeader>
                <CardTitle>Ultimos cierres</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4 sm:px-6 sm:pb-6">
                {detail.cycles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin cierres anteriores registrados.</p>
                ) : (
                  detail.cycles.slice(0, 3).map((cycle) => (
                    <div key={cycle.id} className="rounded-[1.25rem] border border-border/70 bg-background/80 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground [overflow-wrap:anywhere]">
                            {formatDateRange(cycle.periodStart, cycle.periodEnd)}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Debia: {formatCurrency(cycle.totalDue)} · Pago: {formatCurrency(cycle.transfersApplied)}
                          </p>
                        </div>
                        <Badge variant={getCollectionBadgeVariant(cycle.collectionStatus)}>{cycle.collectionStatus}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <details className="detail-collapsible group" open={false}>
              <summary className="detail-collapsible-summary">
                <div>
                  <p className="text-sm font-semibold text-foreground">Ficha de agencia</p>
                  <p className="mt-1 text-sm text-muted-foreground">Datos de contacto y administrativos.</p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Expandir</span>
              </summary>
              <div className="detail-collapsible-content grid gap-4 pt-4 md:grid-cols-2">
                <InfoItem label="Flota" value={detail.metric.agency.fleetName} />
                <InfoItem label="Direccion" value={detail.metric.agency.address} />
                <InfoItem label="Telefono" value={detail.metric.agency.phone} />
                <InfoItem label="Titular" value={detail.metric.agency.managerName} />
              </div>
            </details>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function getCollectionBadgeVariant(status: AgencyMetrics['latestCycleStatus']) {
  if (status === 'Cumplio') return 'success' as const;
  if (status === 'Parcial') return 'warning' as const;
  return 'danger' as const;
}

function getRiskBadgeVariant(riskLevel: AgencyMetrics['riskLevel']) {
  if (riskLevel === 'critical') return 'danger' as const;
  if (riskLevel === 'attention') return 'warning' as const;
  return 'accent' as const;
}

function getUrgencyNarrative(metric: AgencyMetrics) {
  if (metric.pendingBalance <= 0 && metric.creditBalance > 0) {
    return `La agencia ya cubrio el cierre y tiene ${formatCurrency(metric.creditBalance)} a favor.`;
  }
  if (metric.latestCycleStatus === 'No pago') {
    return `No tuvo cobro en el ultimo cierre. Tiene ${formatCurrency(metric.pendingBalance)} pendientes.`;
  }
  if (metric.latestCycleStatus === 'Parcial') {
    return `Cobro parcial. Quedan ${formatCurrency(metric.pendingBalance)} abiertos.`;
  }
  return 'La agencia esta al dia dentro del cierre visible.';
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.15rem] border border-border/70 bg-background/80 p-4">
      <p className="data-caption">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground [overflow-wrap:anywhere]">{value}</p>
    </div>
  );
}
