import { useMemo } from 'react';
import { ArrowRightLeft } from 'lucide-react';

import { useDemoStore } from '@/app/store/demo-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
      <DialogContent className="sm:max-w-[520px]">
        <div className="space-y-4">
          <DialogHeader className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {detail ? (
                <>
                  <Badge variant={getCollectionBadgeVariant(detail.metric.latestCycleStatus)}>{detail.metric.latestCycleStatus}</Badge>
                  <Badge variant={getRiskBadgeVariant(detail.metric.riskLevel)}>{getRiskLevelLabel(detail.metric.riskLevel)}</Badge>
                  <Badge variant="accent">{detail.metric.agency.fleetName}</Badge>
                </>
              ) : null}
            </div>
            <DialogTitle className="[overflow-wrap:anywhere]">{detail?.metric.agency.name ?? 'Detalle de agencia'}</DialogTitle>
            <DialogDescription className="sr-only">Detalle de agencia</DialogDescription>
          </DialogHeader>

          {detail ? (
            <div className="space-y-4">
              <section className="detail-hero space-y-4">
                <div className="space-y-2">
                  <p className="kpi-label">Pendiente de cobro</p>
                  <p className="text-3xl font-semibold tracking-tight text-foreground">
                    {detail.metric.pendingBalance > 0 ? formatCurrency(detail.metric.pendingBalance) : 'Sin pendiente'}
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">{getUrgencyNarrative(detail.metric)}</p>
                </div>

                <Button className="w-full" onClick={() => onQuickTransfer(detail.metric)}>
                  <ArrowRightLeft className="h-4 w-4" />
                  Registrar transferencia
                </Button>

                <div className="grid gap-3 sm:grid-cols-3">
                  <MiniStat label="Total a deber" value={formatCurrency(detail.cycleProgress.totalDue)} />
                  <MiniStat label="Cobrado hoy" value={formatCurrency(detail.metric.transfersOnDate)} />
                  <MiniStat
                    label="Margen al tope"
                    value={
                      detail.metric.capUsage >= 100
                        ? `Excedido ${formatCurrency(Math.abs(detail.metric.capRemaining))}`
                        : formatCurrency(Math.max(detail.metric.capRemaining, 0))
                    }
                  />
                </div>
              </section>

              <section className="rounded-[1.35rem] border border-border/70 bg-background/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Ultimos cierres</p>
                    <p className="mt-1 text-sm text-muted-foreground">Comparacion rapida de los tres cortes mas recientes.</p>
                  </div>
                  <Badge variant="accent">
                    {detail.cycleProgress.periodStart && detail.cycleProgress.periodEnd
                      ? formatDateRange(detail.cycleProgress.periodStart, detail.cycleProgress.periodEnd)
                      : 'Sin corte'}
                  </Badge>
                </div>

                <div className="mt-4 space-y-3">
                  {detail.cycles.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sin cierres anteriores registrados.</p>
                  ) : (
                    detail.cycles.slice(0, 3).map((cycle) => (
                      <div key={cycle.id} className="rounded-[1.15rem] border border-border/70 bg-background/70 px-3 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground [overflow-wrap:anywhere]">
                              {formatDateRange(cycle.periodStart, cycle.periodEnd)}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Debia {formatCurrency(cycle.totalDue)} · Pago {formatCurrency(cycle.transfersApplied)}
                            </p>
                          </div>
                          <Badge variant={getCollectionBadgeVariant(cycle.collectionStatus)}>{cycle.collectionStatus}</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <details className="detail-collapsible group" open={false}>
                <summary className="detail-collapsible-summary">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Ficha de agencia</p>
                    <p className="mt-1 text-sm text-muted-foreground">Datos de contacto y administrativos.</p>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Expandir</span>
                </summary>
                <div className="detail-collapsible-content mt-4 grid gap-3 pt-4 sm:grid-cols-2">
                  <InfoItem label="Flota" value={detail.metric.agency.fleetName} />
                  <InfoItem label="Direccion" value={detail.metric.agency.address} />
                  <InfoItem label="Telefono" value={detail.metric.agency.phone} />
                  <InfoItem label="Titular" value={detail.metric.agency.managerName} />
                </div>
              </details>
            </div>
          ) : null}
        </div>
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
    return `La agencia ya cubrio el cierre actual y mantiene ${formatCurrency(metric.creditBalance)} a favor.`;
  }
  if (metric.latestCycleStatus === 'No pago') {
    return `No recibio cobro en el ultimo corte. Siguen abiertos ${formatCurrency(metric.pendingBalance)}.`;
  }
  if (metric.latestCycleStatus === 'Parcial') {
    return `Cobro parcial en el periodo visible. Quedan ${formatCurrency(metric.pendingBalance)} por regularizar.`;
  }
  return 'La agencia esta al dia en este corte y solo requiere seguimiento comercial.';
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.1rem] border border-border/70 bg-background/80 p-3">
      <p className="data-caption">{label}</p>
      <p className="mt-2 text-sm font-semibold tabular-nums text-foreground [overflow-wrap:anywhere]">{value}</p>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.1rem] border border-border/70 bg-background/70 p-3">
      <p className="data-caption">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground [overflow-wrap:anywhere]">{value}</p>
    </div>
  );
}
