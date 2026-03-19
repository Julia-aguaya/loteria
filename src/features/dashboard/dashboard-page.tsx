import { useMemo, useState } from 'react';
import { ArrowRightLeft, Building2, CircleAlert, Landmark, Wallet } from 'lucide-react';

import { useDemoStore } from '@/app/store/demo-store';
import { TemporalToolbar } from '@/components/operations/temporal-toolbar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { deriveAgencyMetrics, getDashboardOverview, getFleetOptions, getLatestBusinessDate } from '@/lib/business';
import { formatCompactCurrency, formatCurrency, formatDate, formatDateRange, formatPercent } from '@/lib/format';
import { buildCustomTemporalRange, getTemporalBounds, resolveTemporalPreset, shiftTemporalRange } from '@/lib/temporal';

export function DashboardPage() {
  const state = useDemoStore();
  const [fleetId, setFleetId] = useState('all');
  const [temporalRange, setTemporalRange] = useState(() => resolveTemporalPreset(state, 'latest_cut'));
  const fleets = getFleetOptions(state);
  const temporalBounds = useMemo(() => getTemporalBounds(state), [state]);
  const overview = useMemo(() => getDashboardOverview(state, fleetId, temporalRange.end, temporalRange.start), [fleetId, state, temporalRange.end, temporalRange.start]);
  const latestDate = getLatestBusinessDate(state) ?? new Date().toISOString().slice(0, 10);
  const networkMetrics = useMemo(() => deriveAgencyMetrics(state, latestDate), [latestDate, state]);
  const selectedFleetLabel = fleetId === 'all' ? 'Toda la red' : fleets.find((fleet) => fleet.id === fleetId)?.name ?? 'Flota filtrada';
  const cutTitle = overview.latestCycleEnd ? `Ultimo corte cerrado al ${formatDate(overview.latestCycleEnd)}` : 'Todavia no hay un corte cerrado en la ventana elegida';
  const cutRange = formatDateRange(overview.latestCycleStart, overview.latestCycleEnd);
  const canGoPrevious = temporalRange.start > temporalBounds.minDate;
  const canGoNext = temporalRange.end < temporalBounds.maxDate;
  const networkPending = networkMetrics.reduce((sum, metric) => sum + metric.pendingBalance, 0);
  const networkCredit = networkMetrics.reduce((sum, metric) => sum + metric.creditBalance, 0);
  const agenciesAtRisk = networkMetrics.filter((metric) => metric.latestCycleStatus !== 'Cumplio').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          eyebrow="Dashboards"
          title="El corte de 3 dias pasa al centro"
          description="La lectura principal compara cuanto debia entrar en el cierre, cuanto efectivamente se transfirio y cuanto quedo arrastrado al siguiente ciclo."
        />
        <div className="grid gap-2 sm:min-w-[260px]">
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
      </div>

      <div className="summary-strip space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="section-chip">Ultimo dato {formatDate(latestDate)}</span>
          <span className="section-chip">Pendiente de red {formatCompactCurrency(networkPending, state.configuration.currency)}</span>
          <span className="section-chip">Saldo a favor {formatCompactCurrency(networkCredit, state.configuration.currency)}</span>
          <span className="section-chip">{agenciesAtRisk} agencias con cobro abierto</span>
        </div>
        <p className="toolbar-note">El contexto operativo sale del navbar y queda aca, en la vista que ya concentra cortes, resumen de red y lectura de riesgo.</p>
      </div>

      <TemporalToolbar
        value={temporalRange}
        minDate={temporalBounds.minDate}
        maxDate={temporalBounds.maxDate}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        helper="Mismo patron en todo el frontend: elegis periodo, moves anterior o siguiente, y el tablero recalcula el ultimo corte cerrado hasta esa fecha."
        onPresetChange={(preset) => setTemporalRange(resolveTemporalPreset(state, preset))}
        onShift={(direction) => setTemporalRange((current) => shiftTemporalRange(state, current, direction))}
        onCustomRangeChange={(start, end) => setTemporalRange(buildCustomTemporalRange(state, start, end))}
      />

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-background/50">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className="section-chip">{selectedFleetLabel}</span>
                <span className="section-chip">Periodo {cutRange}</span>
                <span className="section-chip">{overview.latestCutAgencies} agencias en el corte</span>
                <span className="section-chip">{overview.latestCutAtRisk} con cobro abierto</span>
              </div>
              <CardTitle>{cutTitle}</CardTitle>
              <CardDescription>
                {overview.latestCycleEnd
                  ? 'Base operativa del tablero: ultimo corte cerrado hasta la fecha activa, cuanto se debia transferir y cuanto quedo arrastrado.'
                  : 'Ajusta el periodo para recuperar un corte cerrado y volver a ver el resumen operativo completo.'}
              </CardDescription>
            </div>
            <div className="grid gap-3 rounded-[1.4rem] border border-primary/15 bg-primary/10 p-4 xl:min-w-[300px]">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <ArrowRightLeft className="h-3.5 w-3.5" />
                Corte operativo cada 3 dias
              </div>
              <div>
                <div className="data-caption">Ventana visible</div>
                <div className="mt-1 text-base font-semibold text-foreground">{cutRange}</div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                <div>
                  <div className="data-caption">Pendiente remanente</div>
                  <div className="data-value mt-1 text-base">{formatCurrency(overview.lastCutSummary.pending)}</div>
                </div>
                <div>
                  <div className="data-caption">Transferido real</div>
                  <div className="data-value mt-1 text-base">{formatCurrency(overview.lastCutSummary.transferred)}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="summary-strip mt-4 space-y-2">
            <div className="flex flex-wrap gap-2">
              <span className="section-chip">Ultimo corte = ultimo ciclo cerrado dentro de la fecha activa</span>
              <span className="section-chip">Pendiente remanente = lo que sigue al proximo ciclo</span>
            </div>
            <p className="toolbar-note">Con esto respondes rapido que paso hoy, que quedo del ultimo corte y cuanto sigue abierto sin mirar tablas largas.</p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-5">
          <Kpi label="Ventas del corte" value={formatCurrency(overview.lastCutSummary.sales)} helper="Ventas acumuladas del ultimo ciclo" icon={Wallet} />
          <Kpi label="Monto que debian transferir" value={formatCurrency(overview.lastCutSummary.totalDue)} helper="Pendiente anterior + nuevo corte" icon={Landmark} />
          <Kpi label="Monto transferido" value={formatCurrency(overview.lastCutSummary.transferred)} helper="Lo acreditado en el cierre" icon={ArrowRightLeft} />
          <Kpi label="Saldo pendiente" value={formatCurrency(overview.lastCutSummary.pending)} helper="Lo que arrastra el proximo ciclo" icon={CircleAlert} tone="warning" />
          <Kpi
            label="Cumplieron / Parcial / No pagaron"
            value={`${overview.lastCutSummary.paid} / ${overview.lastCutSummary.partial} / ${overview.lastCutSummary.unpaid}`}
            helper="Estado de cobro del ultimo corte"
            icon={Building2}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
              <CardTitle>Top 10 mas cerca del tope</CardTitle>
              <CardDescription>
                {overview.topCapAgencies.length === 0
                  ? 'No hay agencias para rankear en este corte. Cambia el periodo o la flota para recuperar riesgo comercial.'
                  : 'Se prioriza riesgo comercial y estado de cobro; la info secundaria queda dentro de cada fila para evitar scroll horizontal.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TableContainer label="Top 10 mas cerca del tope" hint="Cada fila muestra agencia, corte activo, riesgo comercial y estado del ultimo cobro sin separar datos que se leen juntos.">
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agencia</TableHead>
                    <TableHead className="text-right">Nuevo corte activo</TableHead>
                    <TableHead>Riesgo comercial</TableHead>
                    <TableHead>Ultimo cobro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overview.topCapAgencies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <div className="rounded-2xl border border-dashed border-border bg-background/60 px-4 py-6 text-sm text-muted-foreground">
                          <p className="font-medium text-foreground">No hay riesgo visible para este recorte.</p>
                          <p className="mt-2">Cuando exista un corte cerrado en la ventana elegida, aca vas a ver las agencias mas cerca del tope.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    overview.topCapAgencies.map((metric) => (
                      <TableRow key={metric.agency.id}>
                        <TableCell>
                          <div className="table-stack">
                            <div className="font-medium text-foreground">{metric.agency.name}</div>
                            <div className="table-meta">
                              {metric.agency.code} · {metric.agency.fleetName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="data-value">{formatCurrency(metric.salesOnDate || metric.latestCycleSales)}</div>
                          <div className="table-meta">Ventas vigentes del corte</div>
                        </TableCell>
                        <TableCell>
                          <div className="table-stack">
                            <div className="data-value">{formatPercent(metric.capUsage)}</div>
                            <div className="table-meta">
                              {metric.capUsage >= 100 ? `Excedido por ${formatCurrency(Math.abs(metric.capRemaining))}` : `Disponible ${formatCurrency(Math.max(metric.capRemaining, 0))}`}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={metric.latestCycleStatus === 'Cumplio' ? 'success' : metric.latestCycleStatus === 'Parcial' ? 'warning' : 'danger'}>
                            {metric.latestCycleStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ultimas transferencias</CardTitle>
              <CardDescription>
                {overview.latestTransfers.length === 0
                  ? 'Todavia no hay movimientos en este periodo. Cuando existan, aca vas a validar las ultimas cargas sin salir del tablero.'
                  : 'Referencia rapida del periodo activo para validar cierres y cargas recientes.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {overview.latestTransfers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-background/60 px-4 py-6 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Sin transferencias recientes en esta ventana.</p>
                  <p className="mt-2">Revisa otro periodo o carga una transferencia para que el resumen muestre movimientos reales.</p>
                </div>
              ) : (
                overview.latestTransfers.map((transfer) => {
                  const agency = state.agencies.find((item) => item.id === transfer.agencyId);

                  return (
                    <div key={transfer.id} className="rounded-2xl border border-border bg-background/80 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="font-medium text-foreground">{agency?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {agency?.fleetName} - {formatDate(transfer.date)}
                          </div>
                        </div>
                        <div className="text-base font-semibold text-foreground">{formatCurrency(transfer.amount)}</div>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{transfer.notes ?? 'Sin referencia cargada para este movimiento.'}</p>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Provincia separada</CardTitle>
              <CardDescription>Bloque visible, simple y sin mezclarlo con el saldo de agencias.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
              <SimpleMetric label="Base de ventas" value={formatCurrency(overview.provinceSummary.salesBase)} />
              <SimpleMetric label="% provincia" value={formatPercent(overview.provinceSummary.percentage)} />
              <SimpleMetric label="Estimado provincia" value={formatCurrency(overview.provinceSummary.estimatedProvinceAmount)} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  helper,
  icon: Icon,
  label,
  tone = 'primary',
  value,
}: {
  helper: string;
  icon: typeof Wallet;
  label: string;
  tone?: 'primary' | 'warning';
  value: string;
}) {
  return (
    <div className="metric-panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="kpi-label">{label}</p>
          <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
          <p className="mt-2 text-sm text-muted-foreground">{helper}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone === 'warning' ? 'bg-warning/12 text-warning' : 'bg-primary/10 text-primary'}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function SimpleMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/80 p-4">
      <p className="kpi-label">{label}</p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
