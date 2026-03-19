import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRightLeft, CheckCircle2, Search, X } from 'lucide-react';

import { useDemoStore } from '@/app/store/demo-store';
import { TemporalToolbar } from '@/components/operations/temporal-toolbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionHeading } from '@/components/ui/section-heading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { deriveAgencyMetrics, getFleetOptions, getLatestBusinessDate, getTransferBatchContext } from '@/lib/business';
import { formatCurrency, formatDate, formatDateRange, formatPercent } from '@/lib/format';
import { buildCustomTemporalRange, getTemporalBounds, resolveTemporalPreset, shiftTemporalRange } from '@/lib/temporal';
import { parseNumericInput, validateTransferAmount } from '@/lib/validation';
import type { AgencyMetrics } from '@/types/domain';

const invalidFieldClassName = 'border-rose-400/60 focus:border-rose-300 focus:ring-rose-300/20';

export function TransfersPage() {
  const state = useDemoStore();
  const addTransfers = useDemoStore((store) => store.addTransfers);
  const defaultDate = getLatestBusinessDate(state) ?? new Date().toISOString().slice(0, 10);
  const latestBusinessDate = defaultDate;
  const [fleetId, setFleetId] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedAgencyIds, setSelectedAgencyIds] = useState<string[]>([]);
  const [temporalRange, setTemporalRange] = useState(() => resolveTemporalPreset(state, 'today', defaultDate));
  const [notes, setNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [amountsByAgencyId, setAmountsByAgencyId] = useState<Record<string, string>>({});
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const date = temporalRange.end;
  const fleets = getFleetOptions(state);
  const metrics = deriveAgencyMetrics(state, date);
  const temporalBounds = useMemo(() => getTemporalBounds(state), [state]);
  const filtered = useMemo(
    () =>
      metrics.filter((metric) => {
        const haystack = `${metric.agency.name} ${metric.agency.code} ${metric.agency.fleetName}`.toLowerCase();
        return haystack.includes(query.toLowerCase()) && (fleetId === 'all' ? true : metric.agency.fleetId === fleetId);
      }),
    [fleetId, metrics, query],
  );
  const filteredAgencyIds = useMemo(() => new Set(filtered.map((metric) => metric.agency.id)), [filtered]);
  const selectedMetrics = metrics.filter((metric) => selectedAgencyIds.includes(metric.agency.id));
  const rowContexts = selectedMetrics.map((metric) => ({
    metric,
    context: getTransferBatchContext(state, metric.agency.id, date),
  }));
  const plannedTransfers = rowContexts.flatMap(({ context, metric }) => {
    const rawAmount = amountsByAgencyId[metric.agency.id] ?? '';
    const amountError = rawAmount.trim() === '' ? 'Ingresa un monto.' : validateTransferAmount(rawAmount);
    const amount = parseNumericInput(rawAmount);

    if (amountError || amount === null || !context) {
      return [];
    }

    return [{ agencyId: metric.agency.id, amount }];
  });
  const summary = rowContexts.reduce(
    (accumulator, row) => {
      if (!row.context) {
        return accumulator;
      }

      return {
        agencies: accumulator.agencies + 1,
        accumulatedSales: accumulator.accumulatedSales + row.metric.totalSales,
        accumulatedTransfers: accumulator.accumulatedTransfers + row.metric.totalTransfers,
        totalBalance: accumulator.totalBalance + row.metric.currentBalance,
        previousPending: accumulator.previousPending + row.context.pendingBefore,
        newCut: accumulator.newCut + row.context.newCut,
        totalDue: accumulator.totalDue + row.context.totalDue,
      };
    },
    {
      agencies: 0,
      accumulatedSales: 0,
      accumulatedTransfers: 0,
      totalBalance: 0,
      previousPending: 0,
      newCut: 0,
      totalDue: 0,
    },
  );
  const plannedAmount = plannedTransfers.reduce((sum, transfer) => sum + transfer.amount, 0);
  const invalidSelectedCount = rowContexts.length - plannedTransfers.length;
  const latestTransfers = state.transfers
    .filter((transfer) => transfer.date >= temporalRange.start && transfer.date <= temporalRange.end)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10);
  const allFilteredSelected = filtered.length > 0 && filtered.every((metric) => selectedAgencyIds.includes(metric.agency.id));
  const canGoPrevious = temporalRange.start > temporalBounds.minDate;
  const canGoNext = temporalRange.end < temporalBounds.maxDate;

  useEffect(() => {
    setSelectedAgencyIds((current) => current.filter((agencyId) => filteredAgencyIds.has(agencyId)));
    setAmountsByAgencyId((current) =>
      Object.fromEntries(Object.entries(current).filter(([agencyId]) => filteredAgencyIds.has(agencyId))),
    );
  }, [filteredAgencyIds]);

  function toggleAgency(agencyId: string) {
    const exists = selectedAgencyIds.includes(agencyId);

    setSelectedAgencyIds((current) => (exists ? current.filter((id) => id !== agencyId) : [...current, agencyId]));

    if (exists) {
      setAmountsByAgencyId((current) => {
        const next = { ...current };
        delete next[agencyId];
        return next;
      });
    }
  }

  function clearSelection() {
    setSelectedAgencyIds([]);
    setAmountsByAgencyId({});
  }

  function applyTransfers() {
    if (plannedTransfers.length === 0 || plannedTransfers.length !== rowContexts.length) {
      return;
    }

    addTransfers(
      plannedTransfers.map((transfer) => ({
        agencyId: transfer.agencyId,
        date,
        amount: transfer.amount,
        notes: notes.trim() || undefined,
      })),
    );
    setStatusMessage(`Se cargaron ${plannedTransfers.length} transferencias con fecha ${formatDate(date)}.`);
    clearSelection();
    setNotes('');
    setIsBulkDialogOpen(false);
  }

  function fillDueAmounts() {
    setAmountsByAgencyId(
      rowContexts.reduce<Record<string, string>>((accumulator, { context, metric }) => {
        accumulator[metric.agency.id] = String(Math.max(context?.totalDue ?? 0, 0));
        return accumulator;
      }, {}),
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Transferencias globales"
        title="Seleccion, resumen conjunto y carga multiple"
        description="Primero armas la seleccion, despues validas el agregado del corte y al final cargas los montos por agencia en un modal rapido de operar."
      />

      <TemporalToolbar
        value={temporalRange}
        minDate={temporalBounds.minDate}
        maxDate={temporalBounds.maxDate}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        helper="Misma logica temporal que en Agencias: elegis periodo, el resumen usa la fecha final como cierre y el modal carga importes individuales dentro de ese contexto activo."
        onPresetChange={(preset) => setTemporalRange(resolveTemporalPreset(state, preset))}
        onShift={(direction) => setTemporalRange((current) => shiftTemporalRange(state, current, direction))}
        onCustomRangeChange={(start, end) => setTemporalRange(buildCustomTemporalRange(state, start, end))}
      />

      {statusMessage ? (
        <div className="rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300" role="status" aria-live="polite">
          {statusMessage}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_360px]">
        <Card>
          <CardHeader className="flex flex-col gap-4 px-4 pt-4 sm:px-6 sm:pt-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle>Seleccion de agencias</CardTitle>
              <CardDescription>La pantalla queda limpia: seleccionas agencias y las acciones viven aparte.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="search-panel space-y-4">
              <div className="grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_220px]">
                <div className="grid gap-2">
                  <Label htmlFor="transfer-search">Buscar agencia</Label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="transfer-search" className="pl-9 pr-11" placeholder="Nombre, codigo o flota" value={query} onChange={(event) => setQuery(event.target.value)} />
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
                  <Label htmlFor="transfer-fleet">Flota</Label>
                  <Select value={fleetId} onValueChange={setFleetId}>
                    <SelectTrigger id="transfer-fleet">
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

              <p className="toolbar-note">
                {filtered.length === 0
                  ? query || fleetId !== 'all'
                    ? 'No hay agencias que coincidan con esos filtros. Ajusta la busqueda o limpia los filtros para volver a seleccionar.'
                    : 'No hay agencias disponibles para cargar transferencias en este corte.'
                  : 'Marca agencias desde la tabla y despues revisa el resumen conjunto o entra al modal para cargar montos.'}
              </p>

              <div className="summary-strip space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant={allFilteredSelected ? 'secondary' : 'outline'}
                    onClick={() => setSelectedAgencyIds(allFilteredSelected ? [] : filtered.map((metric) => metric.agency.id))}
                  >
                    {allFilteredSelected ? 'Quitar seleccion total' : 'Seleccionar todas las visibles'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={clearSelection}>
                    Limpiar seleccion
                  </Button>
                  {temporalRange.preset !== 'today' ? (
                    <Button size="sm" variant="ghost" onClick={() => setTemporalRange(resolveTemporalPreset(state, 'today', latestBusinessDate))}>
                      Volver al ultimo dato
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
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap gap-2">
                    <span className="section-chip">Periodo {formatDateRange(temporalRange.start, temporalRange.end)}</span>
                    <span className="section-chip">Carga al {formatDate(date)}</span>
                    <span className="section-chip">{fleetId === 'all' ? 'Todas las flotas' : fleets.find((fleet) => fleet.id === fleetId)?.name}</span>
                    <span className="section-chip">{filtered.length} agencias visibles</span>
                  </div>
                  <p className="toolbar-note">
                    {selectedAgencyIds.length === 0
                      ? 'Todavia no hay agencias marcadas. La seleccion vive solo en esta vista y se limpia si cambias los filtros.'
                      : `${selectedAgencyIds.length} agencias listas para revisar el resumen o cargar montos en bloque.`}
                  </p>
                </div>
                <p className="toolbar-note">El modal usa la fecha final del periodo como impacto visible de cada transferencia y te deja completar el total a deber con un click.</p>
              </div>
            </div>

            <TableContainer label="Tabla de agencias seleccionables" hint="La tabla muestra seleccion, saldo, composicion del total a deber y riesgo comercial. Flota y codigo se integran en la primera columna para reducir densidad.">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sel.</TableHead>
                    <TableHead>Agencia</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Total a deber</TableHead>
                    <TableHead>Riesgo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <div className="rounded-2xl border border-dashed border-border bg-background/60 px-4 py-6 text-sm text-muted-foreground">
                          <p className="font-medium text-foreground">
                            {query || fleetId !== 'all' ? 'No hay agencias para esta combinacion de filtros.' : 'No hay agencias disponibles en este corte.'}
                          </p>
                          <p className="mt-2">
                            {query || fleetId !== 'all'
                              ? 'Prueba otra busqueda, cambia la flota o usa "Limpiar filtros" para seguir con la carga.'
                              : 'Cambia el periodo para revisar otra fecha operativa antes de cargar transferencias.'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((metric) => {
                      const checked = selectedAgencyIds.includes(metric.agency.id);
                      const context = getTransferBatchContext(state, metric.agency.id, date);

                      return (
                        <TableRow key={metric.agency.id} className={checked ? 'bg-primary/5' : undefined}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleAgency(metric.agency.id)}
                              aria-label={`Seleccionar ${metric.agency.name}`}
                              className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="table-stack">
                              <div className="font-medium text-foreground">{metric.agency.name}</div>
                              <div className="table-meta">
                                {metric.agency.code} · {metric.agency.fleetName}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="table-stack">
                              <div className="data-value">{metric.creditBalance > 0 ? `A favor ${formatCurrency(metric.creditBalance)}` : `Pendiente ${formatCurrency(metric.pendingBalance)}`}</div>
                              <div className="table-meta">Saldo visible para la fecha elegida</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="table-stack">
                              <div className="data-value">{formatCurrency(context?.totalDue ?? 0)}</div>
                              <div className="table-meta">
                                Anterior {formatCurrency(context?.pendingBefore ?? 0)} · Nuevo {formatCurrency(context?.newCut ?? 0)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="table-stack">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant={metric.capUsage >= 100 ? 'danger' : metric.capUsage >= 85 ? 'warning' : 'accent'}>{formatPercent(metric.capUsage)}</Badge>
                                <Badge variant={metric.latestCycleStatus === 'Cumplio' ? 'success' : metric.latestCycleStatus === 'Parcial' ? 'warning' : 'danger'}>
                                  {metric.latestCycleStatus}
                                </Badge>
                              </div>
                              <div className="table-meta">
                                {metric.capUsage >= 100 ? `Excedido por ${formatCurrency(Math.abs(metric.capRemaining))}` : `Disponible ${formatCurrency(Math.max(metric.capRemaining, 0))}`}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        <div className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Acciones de seleccion</CardTitle>
              <CardDescription>Dos acciones claras: revisar el agregado o pasar a la carga multiple.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="compact-stat" aria-live="polite">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {selectedMetrics.length === 0 ? 'Sin seleccion activa' : `${selectedMetrics.length} agencias seleccionadas`}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {selectedMetrics.length === 0
                    ? 'Marca una o varias agencias para habilitar el resumen conjunto y la carga multiple.'
                    : invalidSelectedCount > 0
                      ? `Hay ${invalidSelectedCount} agencias seleccionadas sin monto valido. Completa esos importes o quitalas antes de aplicar.`
                      : `Tenes ${plannedTransfers.length} montos validos listos para cargar con fecha ${formatDate(date)}.`}
                </p>
              </div>

              <div className="grid gap-2">
                <Button
                  variant="outline"
                  disabled={selectedMetrics.length === 0}
                  onClick={() => {
                    summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    summaryRef.current?.focus();
                  }}
                >
                  Ver resumen conjunto
                </Button>
                <Button disabled={selectedMetrics.length === 0} onClick={() => setIsBulkDialogOpen(true)}>
                  <ArrowRightLeft className="h-4 w-4" />
                  Cargar transferencias
                </Button>
              </div>
            </CardContent>
          </Card>

          <div ref={summaryRef} tabIndex={-1} className="outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Resumen conjunto</CardTitle>
              <CardDescription>{selectedMetrics.length === 0 ? 'Aparece en cuanto selecciones agencias para revisar el total del corte y lo arrastrado.' : 'Acumulados de la seleccion actual para el corte elegido y lo que viene arrastrado.'}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 px-4 pb-4 sm:grid-cols-2 sm:px-6 sm:pb-6">
              <SummaryMetric label="Ventas acumuladas" value={formatCurrency(summary.accumulatedSales)} />
              <SummaryMetric label="Transferencias acumuladas" value={formatCurrency(summary.accumulatedTransfers)} />
              <SummaryMetric label="Saldo conjunto" value={formatCurrency(summary.totalBalance)} />
              <SummaryMetric label="Pendiente anterior conjunto" value={formatCurrency(summary.previousPending)} />
              <SummaryMetric label="Nuevo corte conjunto" value={formatCurrency(summary.newCut)} />
              <SummaryMetric label="Total a deber conjunto" value={formatCurrency(summary.totalDue)} />
            </CardContent>
          </Card>
          </div>
        </div>
      </div>

        <Card>
          <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
            <CardTitle>Ultimas transferencias</CardTitle>
            <CardDescription>Referencia rapida dentro del periodo activo para validar los ultimos movimientos cargados.</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            <TableContainer label="Ultimas transferencias globales">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agencia</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead>Referencia</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {latestTransfers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <div className="rounded-2xl border border-dashed border-border bg-background/60 px-4 py-6 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">No hay movimientos registrados en este periodo.</p>
                        <p className="mt-2">Cuando cargues una transferencia, la vas a ver aca para validar fecha, monto y referencia.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  latestTransfers.map((transfer) => {
                    const agency = state.agencies.find((item) => item.id === transfer.agencyId);

                    return (
                      <TableRow key={transfer.id}>
                        <TableCell>
                          <div className="table-stack">
                            <div className="font-medium text-foreground">{agency?.name}</div>
                            <div className="table-meta">{agency?.fleetName}</div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(transfer.date)}</TableCell>
                        <TableCell className="text-right data-value">{formatCurrency(transfer.amount)}</TableCell>
                        <TableCell>{transfer.notes ?? 'Sin referencia cargada'}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <BulkTransferDialog
        amountsByAgencyId={amountsByAgencyId}
        date={date}
        periodLabel={formatDateRange(temporalRange.start, temporalRange.end)}
        notes={notes}
        open={isBulkDialogOpen}
        plannedAmount={plannedAmount}
        plannedTransfersCount={plannedTransfers.length}
        invalidSelectedCount={invalidSelectedCount}
        rows={rowContexts}
        onAmountChange={(agencyId, value) => setAmountsByAgencyId((current) => ({ ...current, [agencyId]: value }))}
        onApply={applyTransfers}
        onClearAmounts={() => setAmountsByAgencyId({})}
        onDateChange={(value) => setTemporalRange((current) => buildCustomTemporalRange(state, current.start, value))}
        onFillDueAmounts={fillDueAmounts}
        onNotesChange={setNotes}
        onOpenChange={setIsBulkDialogOpen}
      />
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="compact-stat">
      <p className="kpi-label">{label}</p>
      <p className="mt-2 text-sm font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

function BulkTransferDialog({
  amountsByAgencyId,
  date,
  periodLabel,
  notes,
  onAmountChange,
  onApply,
  onClearAmounts,
  onDateChange,
  onFillDueAmounts,
  onNotesChange,
  onOpenChange,
  open,
  plannedAmount,
  plannedTransfersCount,
  invalidSelectedCount,
  rows,
}: {
  amountsByAgencyId: Record<string, string>;
  date: string;
  periodLabel: string;
  notes: string;
  onAmountChange: (agencyId: string, value: string) => void;
  onApply: () => void;
  onClearAmounts: () => void;
  onDateChange: (value: string) => void;
  onFillDueAmounts: () => void;
  onNotesChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  plannedAmount: number;
  plannedTransfersCount: number;
  invalidSelectedCount: number;
  rows: Array<{ metric: AgencyMetrics; context: ReturnType<typeof getTransferBatchContext> }>;
}) {
  const firstSelectedAgencyId = rows[0]?.metric.agency.id;

  useEffect(() => {
    if (!open || !firstSelectedAgencyId) {
      return;
    }

    window.setTimeout(() => {
      const input = document.getElementById(`bulk-transfer-${firstSelectedAgencyId}`) as HTMLInputElement | null;
      input?.focus();
      input?.select();
    }, 0);
  }, [firstSelectedAgencyId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Cargar transferencias</DialogTitle>
            <DialogDescription>Una fila por agencia, con fecha y nota compartidas arriba. Puedes completar el total a deber del periodo {periodLabel} en un click o ajustar cada monto manualmente.</DialogDescription>
          </DialogHeader>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-background/60 px-4 py-6 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">No hay agencias seleccionadas para esta carga.</p>
            <p className="mt-2">Cierra el modal, marca una o mas agencias desde la tabla y vuelve a intentarlo.</p>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              onApply();
            }}
          >
            <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
              <div className="space-y-4 rounded-2xl border border-border bg-background/80 p-4">
                <div className="grid gap-2">
                  <Label htmlFor="bulk-transfer-date">Fecha</Label>
                  <Input id="bulk-transfer-date" type="date" value={date} onChange={(event) => onDateChange(event.target.value)} />
                  <p className="text-sm text-muted-foreground">Impacta en el cierre visible del periodo {periodLabel} y en el historial de movimientos.</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bulk-transfer-notes">Nota</Label>
                  <Textarea id="bulk-transfer-notes" value={notes} onChange={(event) => onNotesChange(event.target.value)} placeholder="Ej.: cierre operativo, ajuste bancario o regularizacion" />
                </div>

                <div className="compact-stat">
                  <p className="kpi-label">Montos listos</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{plannedTransfersCount}</p>
                  <p className="mt-3 text-sm text-muted-foreground">Total listo para aplicar: {formatCurrency(plannedAmount)}</p>
                  {invalidSelectedCount > 0 ? (
                    <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">
                      Faltan montos validos en {invalidSelectedCount} agencias seleccionadas.
                    </p>
                  ) : null}
                </div>

                <div className="compact-stat">
                  <p className="kpi-label">Periodo activo</p>
                  <p className="mt-2 text-sm font-semibold tabular-nums text-foreground">{periodLabel}</p>
                  <p className="mt-3 text-sm text-muted-foreground">Cada importe se registra por agencia dentro de esta ventana operativa.</p>
                </div>

                <div className="grid gap-2">
                  <Button type="button" variant="outline" onClick={onFillDueAmounts} disabled={rows.length === 0}>
                    Completar todos los saldos
                  </Button>
                  <Button type="button" variant="ghost" onClick={onClearAmounts} disabled={rows.length === 0}>
                    Limpiar montos
                  </Button>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-border bg-background/70 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Montos por agencia</p>
                    <p className="text-sm text-muted-foreground">Tab recorre cada input en orden. Si una fila supera el total a deber, te avisamos pero igual puedes continuar.</p>
                  </div>
                  <Badge variant="default">{rows.length} filas</Badge>
                </div>

                <div className="grid gap-3 lg:hidden">
                  {rows.map(({ context, metric }) => {
                    const rawAmount = amountsByAgencyId[metric.agency.id] ?? '';
                    const showError = rawAmount.trim() !== '';
                    const amountError = showError ? validateTransferAmount(rawAmount) : null;
                    const parsedAmount = parseNumericInput(rawAmount) ?? 0;
                    const overpay = parsedAmount > Math.max(context?.totalDue ?? 0, 0) && parsedAmount > 0;

                    return (
                      <div key={metric.agency.id} className="space-y-3 rounded-2xl border border-border bg-card/70 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium text-foreground">{metric.agency.name}</div>
                            <div className="text-sm text-muted-foreground">{metric.agency.fleetName}</div>
                          </div>
                          {overpay ? <Badge variant="warning">Queda a favor</Badge> : null}
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="data-caption">Pendiente anterior</div>
                            <div className="data-value mt-1">{formatCurrency(context?.pendingBefore ?? 0)}</div>
                          </div>
                          <div>
                            <div className="data-caption">Nuevo corte</div>
                            <div className="data-value mt-1">{formatCurrency(context?.newCut ?? 0)}</div>
                          </div>
                          <div className="col-span-2">
                            <div className="data-caption">Total a deber</div>
                            <div className="data-value mt-1">{formatCurrency(context?.totalDue ?? 0)}</div>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor={`bulk-transfer-${metric.agency.id}`}>Monto a transferir</Label>
                          <Input
                            id={`bulk-transfer-${metric.agency.id}`}
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={rawAmount}
                            className={amountError ? invalidFieldClassName : undefined}
                            onChange={(event) => onAmountChange(metric.agency.id, event.target.value)}
                          />
                          {amountError ? <p className="text-sm text-rose-600 dark:text-rose-300">{amountError}</p> : null}
                        </div>

                        <Button type="button" size="sm" variant="outline" onClick={() => onAmountChange(metric.agency.id, String(Math.max(context?.totalDue ?? 0, 0)))}>
                          Usar total a deber
                        </Button>
                      </div>
                    );
                  })}
                </div>

                <div className="hidden lg:block">
                  <TableContainer label="Carga multiple de transferencias">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Agencia</TableHead>
                            <TableHead>Total a deber</TableHead>
                            <TableHead>Monto a transferir</TableHead>
                            <TableHead>Contexto</TableHead>
                            <TableHead />
                          </TableRow>
                        </TableHeader>
                      <TableBody>
                        {rows.map(({ context, metric }) => {
                          const rawAmount = amountsByAgencyId[metric.agency.id] ?? '';
                          const showError = rawAmount.trim() !== '';
                          const amountError = showError ? validateTransferAmount(rawAmount) : null;
                          const parsedAmount = parseNumericInput(rawAmount) ?? 0;
                          const overpay = parsedAmount > Math.max(context?.totalDue ?? 0, 0) && parsedAmount > 0;

                          return (
                            <TableRow key={metric.agency.id}>
                              <TableCell>
                                <div className="table-stack">
                                  <div className="font-medium text-foreground">{metric.agency.name}</div>
                                  <div className="table-meta">{metric.agency.fleetName}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="data-value">{formatCurrency(context?.totalDue ?? 0)}</div>
                                {overpay ? <div className="text-xs text-warning">Queda saldo a favor si aplicas este monto</div> : null}
                              </TableCell>
                              <TableCell>
                                <div className="grid min-w-[180px] gap-2">
                                  <Input
                                    id={`bulk-transfer-${metric.agency.id}`}
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={rawAmount}
                                    className={amountError ? invalidFieldClassName : undefined}
                                    onChange={(event) => onAmountChange(metric.agency.id, event.target.value)}
                                  />
                                  {amountError ? <p className="text-sm text-rose-600 dark:text-rose-300">{amountError}</p> : null}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="table-stack">
                                  <div className="table-meta">Anterior {formatCurrency(context?.pendingBefore ?? 0)}</div>
                                  <div className="table-meta">Nuevo corte {formatCurrency(context?.newCut ?? 0)}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="grid justify-items-end gap-2">
                                  <Button type="button" size="sm" variant="outline" onClick={() => onAmountChange(metric.agency.id, String(Math.max(context?.totalDue ?? 0, 0)))}>
                                    Usar total a deber
                                  </Button>
                                  {overpay ? <Badge variant="warning">Queda a favor</Badge> : null}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-border/60 pt-3">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={plannedTransfersCount === 0 || invalidSelectedCount > 0}>
                Aplicar {plannedTransfersCount === 0 ? 'transferencias' : `${plannedTransfersCount} transferencias`}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
