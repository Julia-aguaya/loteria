import { useMemo, useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';

import { useDemoStore } from '@/app/store/demo-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionHeading } from '@/components/ui/section-heading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AgencyDetailDialog } from '@/features/agencies/components/agency-detail-dialog';
import { AgencyTransferDialog } from '@/features/agencies/components/agency-transfer-dialog';
import { compareAgencyPriority, deriveAgencyMetrics, getFleetOptions } from '@/lib/business';
import { formatCurrency, formatDateRange, formatPercent } from '@/lib/format';
import { getRiskLevelLabel } from '@/lib/labels';
import { getClosedCutRanges, resolveTemporalPreset } from '@/lib/temporal';
import type { AgencyMetrics } from '@/types/domain';

const CAP_ALERT_USAGE = 85;

export function AgenciesListPage() {
  const state = useDemoStore();

  const cutPeriods = useMemo(() => getClosedCutRanges(state).reverse(), [state]);
  const fallbackDate = useMemo(() => resolveTemporalPreset(state, 'today').end, [state]);
  const latestCutEnd = cutPeriods[0]?.end ?? fallbackDate;

  const [selectedCutEnd, setSelectedCutEnd] = useState(latestCutEnd);
  const [query, setQuery] = useState('');
  const [fleetId, setFleetId] = useState('all');
  const [detailMetric, setDetailMetric] = useState<AgencyMetrics | null>(null);
  const [transferMetric, setTransferMetric] = useState<AgencyMetrics | null>(null);

  const selectedDate = selectedCutEnd;
  const selectedCut = cutPeriods.find((cut) => cut.end === selectedCutEnd) ?? cutPeriods[0] ?? null;
  const fleets = getFleetOptions(state);
  const metrics = deriveAgencyMetrics(state, selectedDate);

  const filtered = useMemo(
    () =>
      metrics
        .filter((metric) => {
          const haystack = `${metric.agency.name} ${metric.agency.code} ${metric.agency.fleetName}`.toLowerCase();
          return haystack.includes(query.toLowerCase()) && (fleetId === 'all' ? true : metric.agency.fleetId === fleetId);
        })
        .sort(compareAgencyPriority),
    [fleetId, metrics, query],
  );

  const totals = useMemo(() => {
    const pending = filtered.reduce((sum, metric) => sum + metric.pendingBalance, 0);
    const withDebt = filtered.filter((metric) => metric.pendingBalance > 0).length;
    const nearCap = filtered.filter((metric) => metric.capUsage >= CAP_ALERT_USAGE).length;

    return { pending, withDebt, nearCap };
  }, [filtered]);

  const reopenDetail = (agencyId: string) => {
    const refreshed = deriveAgencyMetrics(useDemoStore.getState(), selectedDate)
      .sort(compareAgencyPriority)
      .find((metric) => metric.agency.id === agencyId) ?? null;
    setDetailMetric(refreshed);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <SectionHeading
          eyebrow="Modulo 1 · Agencias"
          title="Listado operativo de agencias"
        />

        <div className="grid w-full gap-3 md:grid-cols-2 xl:max-w-[620px]">
          <div className="grid gap-2">
            <Label htmlFor="agency-cut">Periodo</Label>
            <Select value={selectedCutEnd} onValueChange={setSelectedCutEnd}>
              <SelectTrigger id="agency-cut">
                <SelectValue placeholder="Elegir periodo" />
              </SelectTrigger>
              <SelectContent>
                {cutPeriods.length === 0 ? (
                  <SelectItem value={fallbackDate} disabled>
                    Sin periodos cerrados disponibles
                  </SelectItem>
                ) : (
                  cutPeriods.map((cut, index) => (
                    <SelectItem key={cut.end} value={cut.end}>
                      {formatDateRange(cut.start, cut.end)}
                      {index === 0 ? ' - mas reciente' : ''}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="summary-strip space-y-2 border border-border/70 bg-background/78">
            <div className="flex flex-wrap gap-2">
              <Badge variant="accent">{selectedCut ? formatDateRange(selectedCut.start, selectedCut.end) : 'Sin periodo'}</Badge>
              <Badge variant={totals.withDebt > 0 ? 'danger' : 'success'}>
                {totals.withDebt > 0 ? `${totals.withDebt} con deuda` : 'Sin deuda visible'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {filtered.length} agencias visibles · Pendiente total {formatCurrency(totals.pending)}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agencias</CardTitle>
          <CardDescription>Buscar por nombre o codigo · filtrar por flota · abrir detalle para cobrar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
            <div className="grid gap-2">
              <Label htmlFor="agency-search">Buscar agencia</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="agency-search"
                  className="pl-9 pr-11"
                  placeholder="Nombre o codigo de agencia"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                {query ? (
                  <button
                    type="button"
                    aria-label="Limpiar busqueda"
                    className="absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    onClick={() => setQuery('')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="agency-fleet">Filtrar por flota</Label>
              <Select value={fleetId} onValueChange={setFleetId}>
                <SelectTrigger id="agency-fleet">
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
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="section-chip">{filtered.length} agencias</span>
            <span className="section-chip">{totals.nearCap} cerca del tope</span>
            {(query || fleetId !== 'all') && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setQuery('');
                  setFleetId('all');
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <EmptyState title="No se encontraron agencias." description="Prueba otra busqueda o cambia la flota para volver a ver el listado." />
            ) : (
              filtered.map((metric, index) => (
                <AgencyListItem key={metric.agency.id} index={index} metric={metric} onOpenDetail={() => setDetailMetric(metric)} />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <AgencyDetailDialog
        metric={detailMetric}
        selectedDate={selectedDate}
        open={Boolean(detailMetric)}
        onOpenChange={(open) => !open && setDetailMetric(null)}
        onQuickTransfer={(metric) => {
          setDetailMetric(null);
          setTransferMetric(metric);
        }}
      />
      <AgencyTransferDialog
        metric={transferMetric}
        selectedDate={selectedDate}
        open={Boolean(transferMetric)}
        onOpenChange={(open) => !open && setTransferMetric(null)}
        onCompleted={(agencyId) => {
          setTransferMetric(null);
          reopenDetail(agencyId);
        }}
      />
    </div>
  );
}

function AgencyListItem({ index, metric, onOpenDetail }: { index: number; metric: AgencyMetrics; onOpenDetail: () => void }) {
  const pendingLabel = metric.pendingBalance > 0 ? formatCurrency(metric.pendingBalance) : 'Al dia';

  return (
    <article className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="priority-rank">{String(index + 1).padStart(2, '0')}</span>
            <Badge variant={getCollectionBadgeVariant(metric.latestCycleStatus)}>{metric.latestCycleStatus}</Badge>
            {metric.capUsage >= CAP_ALERT_USAGE ? (
              <Badge variant={metric.capUsage >= 100 ? 'danger' : 'warning'}>{formatPercent(metric.capUsage)} del tope</Badge>
            ) : null}
            {metric.riskLevel !== 'healthy' ? <Badge variant={getRiskBadgeVariant(metric.riskLevel)}>{getRiskLevelLabel(metric.riskLevel)}</Badge> : null}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground [overflow-wrap:anywhere]">{metric.agency.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground [overflow-wrap:anywhere]">
              {metric.agency.code} · {metric.agency.fleetName}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
          <div className="min-w-[148px] rounded-[1.15rem] border border-border/70 bg-background/70 px-4 py-3 sm:text-right">
            <p className="data-caption">Pendiente</p>
            <p className="mt-2 text-base font-semibold tabular-nums text-foreground">{pendingLabel}</p>
          </div>

          <Button onClick={onOpenDetail} className="sm:shrink-0">
            Ver detalle
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-background/60 px-4 py-6 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-2">{description}</p>
    </div>
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
