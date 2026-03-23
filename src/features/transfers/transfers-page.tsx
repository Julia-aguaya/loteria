import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRightLeft, Layers3, Search, X } from 'lucide-react';

import { useDemoStore } from '@/app/store/demo-store';
import { CutContextCard } from '@/components/operations/cut-context-card';
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
import { AgencyTransferDialog } from '@/features/agencies/components/agency-transfer-dialog';
import {
  compareAgencyPriority,
  deriveAgencyMetrics,
  getFleetOptions,
  getLatestBusinessDate,
  getTransferBatchContext,
} from '@/lib/business';
import { formatCurrency, formatDate, formatDateRange } from '@/lib/format';
import { buildCustomTemporalRange, getTemporalBounds, resolveTemporalPreset, shiftTemporalRange } from '@/lib/temporal';
import { parseNumericInput, validateTransferAmount } from '@/lib/validation';
import type { AgencyMetrics } from '@/types/domain';

const invalidFieldClassName = 'border-rose-400/60 focus:border-rose-300 focus:ring-rose-300/20';

export function TransfersPage() {
  const state = useDemoStore();
  const addTransfers = useDemoStore((store) => store.addTransfers);
  const defaultDate = getLatestBusinessDate(state) ?? new Date().toISOString().slice(0, 10);
  const [fleetId, setFleetId] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedAgencyIds, setSelectedAgencyIds] = useState<string[]>([]);
  const [temporalRange, setTemporalRange] = useState(() => resolveTemporalPreset(state, 'today', defaultDate));
  const [notes, setNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [amountsByAgencyId, setAmountsByAgencyId] = useState<Record<string, string>>({});
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [activeMetric, setActiveMetric] = useState<AgencyMetrics | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const date = temporalRange.end;
  const fleets = getFleetOptions(state);
  const metrics = deriveAgencyMetrics(state, date);
  const temporalBounds = useMemo(() => getTemporalBounds(state), [state]);

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

  const metricAgencyIds = useMemo(() => new Set(metrics.map((metric) => metric.agency.id)), [metrics]);
  const filteredAgencyIds = useMemo(() => new Set(filtered.map((metric) => metric.agency.id)), [filtered]);
  const selectedMetrics = metrics.filter((metric) => selectedAgencyIds.includes(metric.agency.id));
  const hiddenSelectedCount = selectedMetrics.filter((metric) => !filteredAgencyIds.has(metric.agency.id)).length;
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
        totalDue: accumulator.totalDue + row.context.totalDue,
        previousPending: accumulator.previousPending + row.context.pendingBefore,
        newCut: accumulator.newCut + row.context.newCut,
      };
    },
    {
      agencies: 0,
      totalDue: 0,
      previousPending: 0,
      newCut: 0,
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
    setSelectedAgencyIds((current) => current.filter((agencyId) => metricAgencyIds.has(agencyId)));
    setAmountsByAgencyId((current) => Object.fromEntries(Object.entries(current).filter(([agencyId]) => metricAgencyIds.has(agencyId))));
  }, [metricAgencyIds]);

  function toggleVisibleSelection() {
    setSelectedAgencyIds((current) => {
      if (allFilteredSelected) {
        return current.filter((agencyId) => !filteredAgencyIds.has(agencyId));
      }

      return Array.from(new Set([...current, ...filtered.map((metric) => metric.agency.id)]));
    });
  }

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
        eyebrow="Modulo 1 · Carga multiple"
        title="Carga multiple"
      />

      <TemporalToolbar
        compact
        compactLabel="Cambiar periodo"
        value={temporalRange}
        minDate={temporalBounds.minDate}
        maxDate={temporalBounds.maxDate}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        helper=""
        onPresetChange={(preset) => setTemporalRange(resolveTemporalPreset(state, preset))}
        onShift={(direction) => setTemporalRange((current) => shiftTemporalRange(state, current, direction))}
        onCustomRangeChange={(start, end) => setTemporalRange(buildCustomTemporalRange(state, start, end))}
      />

      <CutContextCard state={state} range={temporalRange} title="Corte activo" />

      {statusMessage ? (
        <div className="rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300" role="status" aria-live="polite">
          {statusMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Agencias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
              <div className="grid gap-2">
                <Label htmlFor="transfer-search">Buscar agencia</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="transfer-search"
                    className="pl-9 pr-11"
                    placeholder="Nombre, codigo o flota"
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

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="section-chip">{filtered.length} agencias visibles</span>
              <span className="section-chip">Impacto al {formatDate(date)}</span>
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
                <EmptyState
                  title="No hay agencias para esta vista."
                  description="Cambia la busqueda, la flota o el periodo para volver a registrar transferencias."
                />
              ) : (
                filtered.map((metric) => {
                  const context = getTransferBatchContext(state, metric.agency.id, date);
                  const checked = selectedAgencyIds.includes(metric.agency.id);

                  return (
                    <TransferAgencyRow
                      key={metric.agency.id}
                      checked={checked}
                      context={context}
                      metric={metric}
                      onOpen={() => setActiveMetric(metric)}
                      onToggle={() => toggleAgency(metric.agency.id)}
                    />
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Carga multiple</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="compact-stat" aria-live="polite">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Layers3 className="h-4 w-4 text-primary" />
                  {selectedMetrics.length === 0 ? 'Sin seleccion activa' : `${selectedMetrics.length} agencias seleccionadas`}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {selectedMetrics.length === 0
                    ? 'Marca agencias desde el listado si necesitas cargar varias transferencias juntas.'
                    : hiddenSelectedCount > 0
                      ? `${hiddenSelectedCount} seleccionadas quedaron fuera de la vista actual por filtros.`
                      : 'La seleccion actual ya puede pasar al modal de carga multiple.'}
                </p>
              </div>

              <div className="grid gap-2">
                <Button size="sm" variant={allFilteredSelected ? 'secondary' : 'outline'} onClick={toggleVisibleSelection}>
                  {allFilteredSelected ? 'Quitar visibles' : 'Seleccionar visibles'}
                </Button>
                <Button size="sm" variant="ghost" onClick={clearSelection} disabled={selectedMetrics.length === 0}>
                  Limpiar seleccion
                </Button>
                <Button size="sm" variant="ghost" onClick={fillDueAmounts} disabled={selectedMetrics.length === 0}>
                  Completar saldos
                </Button>
                <Button disabled={selectedMetrics.length === 0} onClick={() => setIsBulkDialogOpen(true)}>
                  <ArrowRightLeft className="h-4 w-4" />
                  Abrir carga multiple
                </Button>
              </div>

              <div ref={summaryRef} tabIndex={-1} className="grid gap-3 outline-none">
                <SummaryMetric label="Agencias seleccionadas" value={String(summary.agencies)} />
                <SummaryMetric label="Pendiente anterior" value={formatCurrency(summary.previousPending)} />
                <SummaryMetric label="Nuevo corte" value={formatCurrency(summary.newCut)} />
                <SummaryMetric label="Total a deber" value={formatCurrency(summary.totalDue)} />
                <SummaryMetric label="Monto listo" value={formatCurrency(plannedAmount)} />
                {invalidSelectedCount > 0 ? (
                  <p className="text-sm text-rose-600 dark:text-rose-300">Faltan montos validos en {invalidSelectedCount} agencias.</p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ultimas transferencias</CardTitle>
        </CardHeader>
        <CardContent>
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
                      <EmptyState title="No hay movimientos en este periodo." description="Cuando registres una transferencia la veras aqui al instante." />
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

      <AgencyTransferDialog
        metric={activeMetric}
        selectedDate={date}
        open={Boolean(activeMetric)}
        onOpenChange={(open) => !open && setActiveMetric(null)}
        onCompleted={() => {
          setActiveMetric(null);
          setStatusMessage('Transferencia individual registrada correctamente.');
        }}
      />

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

function TransferAgencyRow({
  checked,
  context,
  metric,
  onOpen,
  onToggle,
}: {
  checked: boolean;
  context: ReturnType<typeof getTransferBatchContext>;
  metric: AgencyMetrics;
  onOpen: () => void;
  onToggle: () => void;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition ${checked ? 'border-primary/30 bg-primary/5' : 'border-border/70 bg-background/80'}`}>
      <label className="flex shrink-0 cursor-pointer items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          aria-label={`Seleccionar ${metric.agency.name} para carga multiple`}
          className="h-5 w-5 rounded border-border text-primary focus:ring-ring"
        />
      </label>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-semibold text-foreground">{metric.agency.name}</p>
          <Badge variant={metric.pendingBalance > 0 ? 'danger' : 'success'} className="shrink-0">
            {metric.pendingBalance > 0 ? 'Con pendiente' : 'Al dia'}
          </Badge>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{metric.agency.code} · {metric.agency.fleetName}</p>
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <p className="data-caption">Total a deber</p>
        <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{formatCurrency(context?.totalDue ?? 0)}</p>
      </div>
      <Button size="sm" onClick={onOpen} className="shrink-0">
        Registrar
      </Button>
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

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-background/60 px-4 py-6 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-2">{description}</p>
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
    if (!open || !firstSelectedAgencyId) return;
    window.setTimeout(() => {
      const input = document.getElementById(`bulk-transfer-${firstSelectedAgencyId}`) as HTMLInputElement | null;
      input?.focus();
      input?.select();
    }, 0);
  }, [firstSelectedAgencyId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-border/60 px-6 py-5">
          <DialogTitle>Carga multiple — {periodLabel}</DialogTitle>
          <DialogDescription className="sr-only">Ingresa el monto de transferencia para cada agencia seleccionada.</DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            onApply();
          }}
        >
          <div className="shrink-0 border-b border-border/60 bg-card px-6 py-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="bulk-transfer-date">Fecha</Label>
                <Input id="bulk-transfer-date" type="date" value={date} onChange={(event) => onDateChange(event.target.value)} className="w-40" />
              </div>
              <div className="grid min-w-[160px] flex-1 gap-1.5">
                <Label htmlFor="bulk-transfer-notes">Nota (opcional)</Label>
                <Input id="bulk-transfer-notes" value={notes} onChange={(event) => onNotesChange(event.target.value)} placeholder="Referencia compartida para este lote" />
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={onFillDueAmounts} disabled={rows.length === 0}>
                  Completar todos
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={onClearAmounts} disabled={rows.length === 0}>
                  Limpiar
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {rows.length === 0 ? (
              <div className="px-6 py-8">
                <EmptyState title="Sin agencias seleccionadas." description="Cierra el modal, marca una o mas agencias y vuelve a abrirlo." />
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {rows.map(({ context, metric }) => {
                  const rawAmount = amountsByAgencyId[metric.agency.id] ?? '';
                  const amountError = rawAmount.trim() !== '' ? validateTransferAmount(rawAmount) : null;

                  return (
                    <div key={metric.agency.id} className="flex items-center gap-4 px-6 py-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground" title={metric.agency.name}>{metric.agency.name}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{metric.agency.fleetName}</p>
                      </div>
                      <div className="hidden shrink-0 text-right sm:block">
                        <p className="data-caption">A deber</p>
                        <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{formatCurrency(context?.totalDue ?? 0)}</p>
                      </div>
                      <div className="shrink-0">
                        <div className="grid w-36 gap-1">
                          <Input
                            id={`bulk-transfer-${metric.agency.id}`}
                            type="number"
                            min="0.01"
                            step="0.01"
                            inputMode="decimal"
                            value={rawAmount}
                            placeholder={String(Math.max(context?.totalDue ?? 0, 0))}
                            className={amountError ? invalidFieldClassName : undefined}
                            aria-label={`Monto para ${metric.agency.name}`}
                            onChange={(event) => onAmountChange(metric.agency.id, event.target.value)}
                          />
                          {amountError ? <p className="text-xs text-rose-600 dark:text-rose-300">{amountError}</p> : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-border/60 bg-card px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {plannedTransfersCount > 0 ? (
                  <>{plannedTransfersCount} {plannedTransfersCount === 1 ? 'agencia lista' : 'agencias listas'} · <span className="font-semibold text-foreground">{formatCurrency(plannedAmount)}</span></>
                ) : (
                  'Sin montos ingresados'
                )}
                {invalidSelectedCount > 0 ? <span className="ml-2 text-rose-500"> · {invalidSelectedCount} con error</span> : null}
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit" disabled={plannedTransfersCount === 0 || invalidSelectedCount > 0}>
                  <ArrowRightLeft className="h-4 w-4" />
                  Aplicar {plannedTransfersCount > 0 ? `${plannedTransfersCount} transferencias` : 'carga'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
