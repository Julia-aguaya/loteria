import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, ArrowRightLeft, CircleDollarSign, Layers3, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useDemoStore } from '@/app/store/demo-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { deriveAgencyMetrics, getFleetOptions } from '@/lib/business';
import { formatCompactCurrency, formatCurrency, formatDateRange, formatPercent } from '@/lib/format';
import { getClosedCutRanges, resolveTemporalPreset } from '@/lib/temporal';
import { cn } from '@/lib/utils';
import type { AgencyMetrics, CollectionStatus } from '@/types/domain';

const CAP_ALERT_USAGE = 85;

export function DashboardPage() {
  const state = useDemoStore();
  const [fleetId, setFleetId] = useState('all');

  const cutPeriods = useMemo(() => getClosedCutRanges(state).reverse(), [state]);
  const fallbackDate = useMemo(() => resolveTemporalPreset(state, 'today').end, [state]);
  const latestCutEnd = cutPeriods[0]?.end ?? fallbackDate;
  const [selectedCutEnd, setSelectedCutEnd] = useState(latestCutEnd);

  const temporalRange = useMemo(() => {
    const cut = cutPeriods.find((item) => item.end === selectedCutEnd);
    return cut ?? { preset: 'latest_cut' as const, start: selectedCutEnd, end: selectedCutEnd };
  }, [cutPeriods, selectedCutEnd]);

  const fleets = getFleetOptions(state);
  const visibleMetrics = useMemo(
    () => deriveAgencyMetrics(state, temporalRange.end).filter((metric) => (fleetId === 'all' ? true : metric.agency.fleetId === fleetId)),
    [fleetId, state, temporalRange.end],
  );

  const debtAgencies = useMemo(
    () =>
      visibleMetrics
        .filter((metric) => metric.pendingBalance > 0)
        .slice()
        .sort((left, right) => {
          if (right.pendingBalance !== left.pendingBalance) return right.pendingBalance - left.pendingBalance;
          return right.latestCycleTotalDue - left.latestCycleTotalDue;
        })
        .slice(0, 4),
    [visibleMetrics],
  );

  const nearCapAgencies = useMemo(
    () =>
      visibleMetrics
        .filter((metric) => metric.capUsage >= CAP_ALERT_USAGE)
        .slice()
        .sort((left, right) => {
          if (left.capRemaining !== right.capRemaining) return left.capRemaining - right.capRemaining;
          return right.capUsage - left.capUsage;
        })
        .slice(0, 3),
    [visibleMetrics],
  );

  const totals = useMemo(() => {
    const pending = visibleMetrics.reduce((sum, metric) => sum + metric.pendingBalance, 0);
    const sales = visibleMetrics.reduce((sum, metric) => sum + metric.latestCycleSales, 0);
    const nearCap = visibleMetrics.filter((metric) => metric.capUsage >= CAP_ALERT_USAGE).length;

    return {
      pending,
      sales,
      nearCap,
      agencies: visibleMetrics.length,
    };
  }, [visibleMetrics]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <SectionHeading
          eyebrow="Modulo 1 · Inicio"
          title="Seguimiento rapido del corte"
        />

        <div className="grid w-full gap-3 md:grid-cols-2 xl:max-w-[620px]">
          <div className="grid gap-2">
            <label htmlFor="dashboard-fleet" className="text-sm font-medium text-foreground">
              Flota
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

          <div className="grid gap-2">
            <label htmlFor="dashboard-cut" className="text-sm font-medium text-foreground">
              Periodo
            </label>
            <Select value={selectedCutEnd} onValueChange={setSelectedCutEnd}>
              <SelectTrigger id="dashboard-cut">
                <SelectValue placeholder="Elegir periodo" />
              </SelectTrigger>
              <SelectContent>
                {cutPeriods.map((cut, index) => (
                  <SelectItem key={cut.end} value={cut.end}>
                    {formatDateRange(cut.start, cut.end)}
                    {index === 0 ? ' - mas reciente' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-primary/[0.08] via-card to-card">
        <CardContent className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="accent">Corte activo</Badge>
              <Badge variant={debtAgencies.length > 0 ? 'danger' : 'success'}>
                {debtAgencies.length > 0 ? `${debtAgencies.length} con deuda` : 'Sin deuda visible'}
              </Badge>
              <Badge variant={nearCapAgencies.length > 0 ? 'warning' : 'default'}>
                {nearCapAgencies.length > 0 ? `${nearCapAgencies.length} cerca del tope` : 'Tope controlado'}
              </Badge>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                {formatDateRange(temporalRange.start, temporalRange.end)}
              </h2>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/agencies">
                  Ver agencias
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/transfers">
                  <ArrowRightLeft className="h-4 w-4" />
                  Registrar transferencia
                </Link>
              </Button>
            </div>
          </div>

          <div className="summary-strip space-y-3 self-start border border-border/70 bg-background/78">
            <DashboardStat label="Pendiente total" value={formatCompactCurrency(totals.pending)} icon={CircleDollarSign} tone="danger" />
            <DashboardStat label="Agencias visibles" value={String(totals.agencies)} icon={Layers3} />
            <DashboardStat label="Ventas del corte" value={formatCompactCurrency(totals.sales)} icon={TrendingUp} />
            <DashboardStat label="Cerca del tope" value={String(totals.nearCap)} icon={AlertTriangle} tone="warning" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Agencias con deudas pendientes</CardTitle>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/agencies">
                Ver listado
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {debtAgencies.length === 0 ? (
              <EmptyState title="No hay deuda pendiente visible." description="El periodo actual no deja agencias con saldo abierto en la flota seleccionada." />
            ) : (
              debtAgencies.map((metric, index) => <DebtRow key={metric.agency.id} index={index} metric={metric} />)
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Agencias cerca del tope</CardTitle>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link to="/transfers">
                Nueva transferencia
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {nearCapAgencies.length === 0 ? (
              <EmptyState title="No hay agencias cerca del tope." description="La red se mantiene con margen suficiente en el periodo seleccionado." />
            ) : (
              nearCapAgencies.map((metric, index) => <NearCapCard key={metric.agency.id} index={index} metric={metric} />)
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardStat({
  label,
  value,
  icon: Icon,
  tone = 'default',
}: {
  label: string;
  value: string;
  icon: typeof TrendingUp;
  tone?: 'default' | 'warning' | 'danger';
}) {
  return (
    <div className="compact-stat">
      <div className="flex items-center justify-between gap-3">
        <p className="kpi-label">{label}</p>
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-2xl border border-border/70 bg-background/80 text-muted-foreground',
            tone === 'warning' && 'border-warning/20 bg-warning/10 text-amber-700 dark:text-amber-300',
            tone === 'danger' && 'border-destructive/20 bg-destructive/10 text-rose-700 dark:text-rose-300',
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-2 text-lg font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

function DebtRow({ index, metric }: { index: number; metric: AgencyMetrics }) {
  return (
    <div className="rounded-[1.35rem] border border-border/70 bg-background/80 px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="priority-rank">{String(index + 1).padStart(2, '0')}</span>
            <StatusBadge status={metric.latestCycleStatus} />
          </div>
          <div className="font-semibold text-foreground [overflow-wrap:anywhere]">{metric.agency.name}</div>
          <div className="text-sm text-muted-foreground [overflow-wrap:anywhere]">{metric.agency.fleetName}</div>
        </div>

        <div className="space-y-1 text-left sm:text-right">
          <div className="data-caption">Pendiente</div>
          <div className="text-lg font-semibold tabular-nums text-foreground">{formatCurrency(metric.pendingBalance)}</div>
        </div>
      </div>
    </div>
  );
}

function NearCapCard({ index, metric }: { index: number; metric: AgencyMetrics }) {
  const exceeded = metric.capUsage >= 100;

  return (
    <div className="rounded-[1.35rem] border border-border/70 bg-background/80 p-4">
      <div className="flex items-start gap-4">
        <CircularProgress value={metric.capUsage} />
        <div className="min-w-0 flex-1 space-y-1.5 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="priority-rank">{String(index + 1).padStart(2, '0')}</span>
            <Badge variant={exceeded ? 'danger' : 'warning'}>{formatPercent(metric.capUsage)}</Badge>
          </div>
          <div className="font-semibold text-foreground [overflow-wrap:anywhere]">{metric.agency.name}</div>
          <div className="text-sm text-muted-foreground [overflow-wrap:anywhere]">{metric.agency.fleetName}</div>
          <div className="pt-1">
            <div className="data-caption">Faltan</div>
            <div className={cn('text-base font-semibold tabular-nums', exceeded ? 'text-destructive' : 'text-foreground')}>
              {exceeded ? `Excedido ${formatCurrency(Math.abs(metric.capRemaining))}` : formatCurrency(Math.max(metric.capRemaining, 0))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CircularProgress({ value }: { value: number }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(value, 0), 100);
  const offset = circumference - (clamped / 100) * circumference;
  const exceeded = value >= 100;

  return (
    <div className="relative shrink-0 inline-flex items-center justify-center">
      <svg width="76" height="76" aria-hidden="true">
        <circle cx="38" cy="38" r={radius} fill="none" stroke="currentColor" strokeWidth="7" className="text-border/40" />
        <circle
          cx="38" cy="38" r={radius} fill="none"
          stroke="currentColor" strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 38 38)"
          className={exceeded ? 'text-destructive' : 'text-primary'}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-[13px] font-bold leading-none text-foreground">{Math.round(value)}%</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: CollectionStatus }) {
  return <Badge variant={status === 'Cumplio' ? 'success' : status === 'Parcial' ? 'warning' : 'danger'}>{status}</Badge>;
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-background/60 px-4 py-6 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-2">{description}</p>
    </div>
  );
}
