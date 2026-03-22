import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useDemoStore } from '@/app/store/demo-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { deriveAgencyMetrics, getFleetOptions } from '@/lib/business';
import { formatCurrency, formatDateRange } from '@/lib/format';
import { getClosedCutRanges, resolveTemporalPreset } from '@/lib/temporal';

export function DashboardPage() {
  const state = useDemoStore();
  const [fleetId, setFleetId] = useState('all');

  const cutPeriods = useMemo(() => getClosedCutRanges(state).reverse(), [state]);
  const fallbackDate = useMemo(() => resolveTemporalPreset(state, 'today').end, [state]);
  const latestCutEnd = cutPeriods[0]?.end ?? fallbackDate;
  const [selectedCutEnd, setSelectedCutEnd] = useState(latestCutEnd);
  const temporalRange = useMemo(() => {
    const cut = cutPeriods.find((c) => c.end === selectedCutEnd);
    return cut ?? { preset: 'latest_cut' as const, start: selectedCutEnd, end: selectedCutEnd };
  }, [cutPeriods, selectedCutEnd]);

  const fleets = getFleetOptions(state);
  const visibleMetrics = useMemo(
    () => deriveAgencyMetrics(state, temporalRange.end).filter((metric) => (fleetId === 'all' ? true : metric.agency.fleetId === fleetId)),
    [fleetId, state, temporalRange.end],
  );
  const networkPending = visibleMetrics.reduce((sum, metric) => sum + metric.pendingBalance, 0);
  const agenciesAtRisk = visibleMetrics.filter((metric) => metric.latestCycleStatus !== 'Cumplio').length;
  const prioritizedAgencies = useMemo(
    () =>
      visibleMetrics
        .slice()
        .sort((left, right) => {
          const leftRisk = left.riskLevel === 'critical' ? 2 : left.riskLevel === 'attention' ? 1 : 0;
          const rightRisk = right.riskLevel === 'critical' ? 2 : right.riskLevel === 'attention' ? 1 : 0;
          if (rightRisk !== leftRisk) return rightRisk - leftRisk;
          if (right.pendingBalance !== left.pendingBalance) return right.pendingBalance - left.pendingBalance;
          return right.capUsage - left.capUsage;
        })
        .slice(0, 5),
    [visibleMetrics],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          eyebrow="Inicio"
          title="Estado de la red de agencias"
          description="Las agencias con cobro pendiente aparecen abajo, ordenadas por urgencia."
        />
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-[560px]">
          <div className="grid flex-1 gap-2">
            <label htmlFor="dashboard-fleet" className="text-sm font-medium text-foreground">
              Filtrar por flota
            </label>
            <Select value={fleetId} onValueChange={setFleetId}>
              <SelectTrigger id="dashboard-fleet">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las flotas</SelectItem>
                {fleets.map((fleet) => (
                  <SelectItem key={fleet.id} value={fleet.id}>
                    {fleet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid flex-1 gap-2">
            <label htmlFor="dashboard-cut" className="text-sm font-medium text-foreground">
              Periodo de corte
            </label>
            <Select value={selectedCutEnd} onValueChange={setSelectedCutEnd}>
              <SelectTrigger id="dashboard-cut">
                <SelectValue placeholder="Elegir periodo" />
              </SelectTrigger>
              <SelectContent>
                {cutPeriods.map((cut, index) => (
                  <SelectItem key={cut.end} value={cut.end}>
                    {formatDateRange(cut.start, cut.end)}
                    {index === 0 ? ' — mas reciente' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-primary/[0.10] via-background to-background">
        <CardContent className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.7fr)] lg:p-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                {agenciesAtRisk > 0
                  ? `${agenciesAtRisk} ${agenciesAtRisk === 1 ? 'agencia necesita' : 'agencias necesitan'} atencion hoy.`
                  : 'Todas las agencias estan al dia.'}
              </h2>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
                Haz clic en "Ver agencias" para ver el listado completo y registrar cobros.
              </p>
            </div>
            <Button asChild size="lg">
              <Link to="/agencies">
                Ver agencias
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="summary-strip space-y-3 self-start border border-border/70 bg-background/78">
            <div className="grid gap-3">
              <SummaryItem label="Agencias con cobro abierto" value={`${agenciesAtRisk} agencias`} />
              <SummaryItem label="Total pendiente de cobro" value={formatCurrency(networkPending)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agencias prioritarias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {prioritizedAgencies.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-background/60 px-4 py-6 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">No hay prioridades activas en este momento.</p>
              <p className="mt-2">Prueba otra flota para ver el estado de otras agencias.</p>
            </div>
          ) : (
            prioritizedAgencies.map((metric, index) => (
              <div key={metric.agency.id} className="rounded-[1.35rem] border border-border/70 bg-background/80 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-semibold text-primary">
                        {index + 1}
                      </span>
                      <div className="min-w-0 font-semibold text-foreground [overflow-wrap:anywhere]">{metric.agency.name}</div>
                      <Badge variant={metric.latestCycleStatus === 'Cumplio' ? 'success' : metric.latestCycleStatus === 'Parcial' ? 'warning' : 'danger'}>
                        {metric.latestCycleStatus}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground [overflow-wrap:anywhere]">{metric.agency.fleetName}</div>
                  </div>
                  <div className="text-lg font-semibold tabular-nums text-foreground [overflow-wrap:anywhere] sm:text-right">
                    {metric.pendingBalance > 0 ? formatCurrency(metric.pendingBalance) : 'Al dia'}
                  </div>
                </div>
              </div>
            ))
          )}

          <div className="pt-2">
            <Button asChild className="w-full">
              <Link to="/agencies">
                Ver todas las agencias
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 px-3 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] leading-4 text-muted-foreground [overflow-wrap:anywhere]">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground [overflow-wrap:anywhere]">{value}</p>
    </div>
  );
}
