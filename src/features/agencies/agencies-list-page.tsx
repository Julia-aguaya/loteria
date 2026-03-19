import { useMemo, useState } from 'react';
import { CalendarDays, Search, SlidersHorizontal, X } from 'lucide-react';

import { useDemoStore } from '@/app/store/demo-store';
import { TemporalToolbar } from '@/components/operations/temporal-toolbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionHeading } from '@/components/ui/section-heading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AgencyDetailDialog } from '@/features/agencies/components/agency-detail-dialog';
import { AgencyEditDialog } from '@/features/agencies/components/agency-edit-dialog';
import { AgencyTransferDialog } from '@/features/agencies/components/agency-transfer-dialog';
import { deriveAgencyMetrics, getFleetOptions, getLatestBusinessDate } from '@/lib/business';
import { formatCurrency, formatDate, formatDateRange, formatPercent } from '@/lib/format';
import { buildCustomTemporalRange, getTemporalBounds, resolveTemporalPreset, shiftTemporalRange } from '@/lib/temporal';
import type { AgencyMetrics } from '@/types/domain';

export function AgenciesListPage() {
  const state = useDemoStore();
  const latestBusinessDate = getLatestBusinessDate(state) ?? new Date().toISOString().slice(0, 10);
  const [query, setQuery] = useState('');
  const [fleetId, setFleetId] = useState('all');
  const [temporalRange, setTemporalRange] = useState(() => resolveTemporalPreset(state, 'today'));
  const [detailMetric, setDetailMetric] = useState<AgencyMetrics | null>(null);
  const [editMetric, setEditMetric] = useState<AgencyMetrics | null>(null);
  const [transferMetric, setTransferMetric] = useState<AgencyMetrics | null>(null);
  const selectedDate = temporalRange.end;
  const metrics = deriveAgencyMetrics(state, selectedDate);
  const fleets = getFleetOptions(state);
  const temporalBounds = useMemo(() => getTemporalBounds(state), [state]);
  const canGoPrevious = temporalRange.start > temporalBounds.minDate;
  const canGoNext = temporalRange.end < temporalBounds.maxDate;

  const filtered = useMemo(
    () =>
      metrics.filter((metric) => {
        const haystack = `${metric.agency.name} ${metric.agency.code} ${metric.agency.fleetName}`.toLowerCase();
        return haystack.includes(query.toLowerCase()) && (fleetId === 'all' ? true : metric.agency.fleetId === fleetId);
      }),
    [fleetId, metrics, query],
  );

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Agencias"
        title="La tabla gira en torno a una fecha operativa"
        description="Elegis una fecha, ves ventas y transferencias del dia, el saldo acumulado que arrastra pendientes y el estado de cobro del ultimo corte sin ruido extra."
      />

      <TemporalToolbar
        value={temporalRange}
        minDate={temporalBounds.minDate}
        maxDate={temporalBounds.maxDate}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        helper="La tabla siempre muestra el cierre activo y el saldo acumulado a esa fecha. Si elegis un periodo, se usa la fecha final como corte visible."
        onPresetChange={(preset) => setTemporalRange(resolveTemporalPreset(state, preset))}
        onShift={(direction) => setTemporalRange((current) => shiftTemporalRange(state, current, direction))}
        onCustomRangeChange={(start, end) => setTemporalRange(buildCustomTemporalRange(state, start, end))}
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_220px_220px]">
        <InfoCard label="Periodo activo" value={formatDateRange(temporalRange.start, temporalRange.end)} helper="La tabla toma el cierre final de esta ventana" icon={CalendarDays} />
        <InfoCard label="Flotas activas" value={String(fleets.length)} helper="Dos flotas dentro de Santa Fe" />
        <InfoCard label="Pendiente de agencias" value={formatCurrency(filtered.reduce((sum, item) => sum + item.pendingBalance, 0))} helper="Saldo que sigue abierto en la fecha elegida" />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 px-4 pt-4 sm:px-6 sm:pt-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle>Listado operativo por fecha</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="search-panel space-y-4">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_220px_auto]">
              <div className="grid gap-2">
                <Label htmlFor="agency-search">Buscar agencia</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="agency-search"
                    className="pl-9 pr-11"
                    placeholder="Nombre, codigo o flota"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  {query ? (
                    <button
                      type="button"
                      aria-label="Limpiar busqueda"
                      className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      onClick={() => setQuery('')}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="agency-fleet">Flota</Label>
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
              <div className="grid gap-2 xl:justify-end">
                <span className="text-sm font-medium text-foreground">Acciones</span>
                <div className="flex gap-2 xl:justify-end">
                  {temporalRange.preset !== 'today' ? (
                    <Button size="sm" variant="outline" onClick={() => setTemporalRange(resolveTemporalPreset(state, 'today', latestBusinessDate))}>
                      Ultimo dato
                    </Button>
                  ) : null}
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
              </div>
            </div>

            <p className="toolbar-note">
              {metrics.length === 0
                ? 'Todavia no hay datos operativos para la fecha elegida. Cambia el periodo para revisar otro cierre.'
                : filtered.length === 0
                  ? query || fleetId !== 'all'
                    ? 'No encontramos agencias con esos filtros. Ajusta la busqueda o limpia los filtros para volver al listado completo.'
                    : 'No hay agencias visibles en este corte.'
                  : 'Busca por nombre, codigo o flota para recortar rapido la tabla sin perder el contexto del cierre.'}
            </p>

            <div className="summary-strip space-y-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  <span className="section-chip">Periodo {formatDateRange(temporalRange.start, temporalRange.end)}</span>
                  <span className="section-chip">Tabla al {formatDate(selectedDate)}</span>
                  <span className="section-chip">{fleetId === 'all' ? 'Todas las flotas' : fleets.find((fleet) => fleet.id === fleetId)?.name}</span>
                  <span className="section-chip">{filtered.length} agencias visibles</span>
                </div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Saldo unico: pendiente o a favor
                </div>
              </div>
              <p className="toolbar-note">La tabla muestra la fecha seleccionada y el saldo acumulado hasta ese cierre. El arrastre del periodo se ve en saldo, detalle y accion de transferencia.</p>
            </div>
          </div>
          <TableContainer label="Tabla principal de agencias" hint="Vista limpia por fecha con ventas y transferencias del dia, saldo acumulado y riesgo operativo. Ultima transferencia y datos extendidos quedan en el detalle.">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agencia</TableHead>
                  <TableHead className="text-right">Ventas del dia</TableHead>
                  <TableHead className="text-right">Transferencias del dia</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Seguimiento</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="rounded-2xl border border-dashed border-border bg-background/60 px-4 py-6 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">
                          {metrics.length === 0 ? 'No hay agencias para mostrar en este cierre.' : 'No hay resultados para los filtros actuales.'}
                        </p>
                        <p className="mt-2">
                          {metrics.length === 0
                            ? 'Prueba con otra fecha operativa para revisar ventas, transferencias y saldo acumulado.'
                            : 'Cambia la flota, ajusta la busqueda o usa "Limpiar filtros" para recuperar la vista completa.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((metric) => (
                    <TableRow key={metric.agency.id}>
                      <TableCell>
                        <div className="table-stack">
                          <div className="font-medium text-foreground">{metric.agency.name}</div>
                          <div className="table-meta">
                            {metric.agency.code} · {metric.agency.fleetName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right data-value">{formatCurrency(metric.salesOnDate)}</TableCell>
                      <TableCell className="text-right data-value">{formatCurrency(metric.transfersOnDate)}</TableCell>
                      <TableCell>
                        <BalanceCell metric={metric} />
                      </TableCell>
                      <TableCell>
                        <div className="table-stack">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={metric.latestCycleStatus === 'Cumplio' ? 'success' : metric.latestCycleStatus === 'Parcial' ? 'warning' : 'danger'}>
                              {metric.latestCycleStatus}
                            </Badge>
                            <Badge variant={metric.capUsage >= 100 ? 'danger' : metric.capUsage >= 85 ? 'warning' : 'accent'}>{formatPercent(metric.capUsage)}</Badge>
                          </div>
                          <div className="table-meta">
                            {metric.capUsage >= 100 ? `Excedido por ${formatCurrency(Math.abs(metric.capRemaining))}` : `Disponible ${formatCurrency(Math.max(metric.capRemaining, 0))}`}
                          </div>
                          <div className="table-meta">
                            {metric.lastTransfer ? `Ultima transferencia ${formatCurrency(metric.lastTransfer.amount)} · ${formatDate(metric.lastTransfer.date)}` : 'Sin transferencias recientes en este recorte'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[230px]">
                        <div className="grid gap-2 lg:grid-cols-2">
                          <Button size="sm" variant="ghost" className="justify-center" onClick={() => setDetailMetric(metric)}>
                            Ver detalle
                          </Button>
                          <Button size="sm" className="justify-center" onClick={() => setTransferMetric(metric)}>
                            Cargar transferencia
                          </Button>
                          <Button size="sm" variant="outline" className="justify-center lg:col-span-2" onClick={() => setEditMetric(metric)}>
                            Editar datos
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
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
      <AgencyEditDialog metric={editMetric} open={Boolean(editMetric)} onOpenChange={(open) => !open && setEditMetric(null)} />
      <AgencyTransferDialog metric={transferMetric} selectedDate={selectedDate} open={Boolean(transferMetric)} onOpenChange={(open) => !open && setTransferMetric(null)} />
    </div>
  );
}

function BalanceCell({ metric }: { metric: AgencyMetrics }) {
  if (metric.creditBalance > 0) {
    return (
      <div>
        <div className="data-value text-emerald-600 dark:text-emerald-300">A favor {formatCurrency(metric.creditBalance)}</div>
        <div className="text-sm text-muted-foreground">No tiene pendiente al cierre</div>
      </div>
    );
  }

  return (
    <div>
      <div className="data-value">Pendiente {formatCurrency(metric.pendingBalance)}</div>
      <div className="text-sm text-muted-foreground">Saldo acumulado a la fecha</div>
    </div>
  );
}

function InfoCard({
  helper,
  icon: Icon,
  label,
  value,
}: {
  helper: string;
  icon?: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="kpi-label">{label}</p>
            <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{helper}</p>
          </div>
          {Icon ? (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
