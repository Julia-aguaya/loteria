import { useMemo, useState } from 'react';
import { ArrowRight, CalendarRange, Search, X } from 'lucide-react';

import { useDemoStore } from '@/app/store/demo-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionHeading } from '@/components/ui/section-heading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AgencyDetailDialog } from '@/features/agencies/components/agency-detail-dialog';
import { AgencyTransferDialog } from '@/features/agencies/components/agency-transfer-dialog';
import { compareAgencyPriority, deriveAgencyMetrics, getFleetOptions } from '@/lib/business';
import { formatCurrency, formatDateRange } from '@/lib/format';
import { getRiskLevelLabel } from '@/lib/labels';
import { getClosedCutRanges, resolveTemporalPreset } from '@/lib/temporal';
import type { AgencyMetrics } from '@/types/domain';

export function AgenciesListPage() {
  const state = useDemoStore();

  // All available closed cut periods, newest first
  const cutPeriods = useMemo(() => getClosedCutRanges(state).reverse(), [state]);
  const fallbackDate = useMemo(() => resolveTemporalPreset(state, 'today').end, [state]);
  const latestCutEnd = cutPeriods[0]?.end ?? fallbackDate;

  const [selectedCutEnd, setSelectedCutEnd] = useState(latestCutEnd);
  const selectedDate = selectedCutEnd;
  const selectedCut = cutPeriods.find((cut) => cut.end === selectedCutEnd) ?? cutPeriods[0] ?? null;

  const [query, setQuery] = useState('');
  const [fleetId, setFleetId] = useState('all');
  const [detailMetric, setDetailMetric] = useState<AgencyMetrics | null>(null);
  const [transferMetric, setTransferMetric] = useState<AgencyMetrics | null>(null);

  const metrics = deriveAgencyMetrics(state, selectedDate);
  const fleets = getFleetOptions(state);

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

  const reopenDetail = (agencyId: string) => {
    const refreshed = deriveAgencyMetrics(useDemoStore.getState(), selectedDate).sort(compareAgencyPriority).find((metric) => metric.agency.id === agencyId) ?? null;
    setDetailMetric(refreshed);
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Agencias prioritarias"
        title="Agencias ordenadas por urgencia"
        description="Las agencias con mas deuda pendiente aparecen primero. Haz clic en 'Ver detalle' para ver el caso y registrar un cobro."
      />

      {/* Cut period selector */}
      <div className="rounded-[1.35rem] border border-primary/15 bg-primary/8 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CalendarRange className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Periodo de corte</p>
              <p className="text-sm text-muted-foreground">
                {selectedCut ? formatDateRange(selectedCut.start, selectedCut.end) : 'Sin periodo seleccionado'}
              </p>
            </div>
          </div>
          <div className="sm:ml-auto sm:w-[280px]">
            <Select value={selectedCutEnd} onValueChange={setSelectedCutEnd}>
              <SelectTrigger>
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
                      {index === 0 ? ' — mas reciente' : ''}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
          <CardTitle>Listado de agencias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="grid gap-3 sm:grid-cols-2">
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

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-border bg-background/60 px-5 py-8 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">No se encontraron agencias.</p>
                <p className="mt-2">Prueba cambiando la busqueda o el filtro de flota.</p>
              </div>
            ) : (
              filtered.map((metric, index) => (
                <PriorityCard key={metric.agency.id} index={index} metric={metric} onOpenDetail={() => setDetailMetric(metric)} />
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

function PriorityCard({ index, metric, onOpenDetail }: { index: number; metric: AgencyMetrics; onOpenDetail: () => void }) {
  return (
    <article className="priority-card">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="priority-rank">{String(index + 1).padStart(2, '0')}</span>
            <Badge variant={getRiskBadgeVariant(metric.riskLevel)}>{getRiskLevelLabel(metric.riskLevel)}</Badge>
            <Badge variant={getCollectionBadgeVariant(metric.latestCycleStatus)}>{metric.latestCycleStatus}</Badge>
          </div>
          <h3 className="break-words text-lg font-semibold text-foreground">{metric.agency.name}</h3>
          <p className="text-sm text-muted-foreground">{metric.agency.fleetName}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="data-caption">Pendiente</p>
            <p className="mt-1 text-base font-semibold tabular-nums text-foreground">
              {metric.pendingBalance > 0 ? formatCurrency(metric.pendingBalance) : 'Al dia'}
            </p>
          </div>
          <Button onClick={onOpenDetail}>
            Ver detalle
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
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
