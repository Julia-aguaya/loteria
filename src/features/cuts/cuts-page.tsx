import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';

import { useDemoStore } from '@/app/store/demo-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { SectionHeading } from '@/components/ui/section-heading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getFleetOptions } from '@/lib/business';
import { formatCurrency, formatDateRange } from '@/lib/format';
import type { CollectionStatus, OperationalSnapshot } from '@/types/domain';

interface CutSummary {
  periodStart: string;
  periodEnd: string;
  agencyCount: number;
  totalSales: number;
  totalDue: number;
  totalTransferred: number;
  totalPendingAfter: number;
  complied: number;
  partial: number;
  unpaid: number;
}

export function CutsPage() {
  const state = useDemoStore();
  const [fleetId, setFleetId] = useState('all');
  const [selectedCut, setSelectedCut] = useState<CutSummary | null>(null);
  const fleets = getFleetOptions(state);

  const agencyIdsByFleet = useMemo(() => {
    return new Set(
      state.agencies
        .filter((agency) => fleetId === 'all' || agency.fleetId === fleetId)
        .map((agency) => agency.id),
    );
  }, [fleetId, state.agencies]);

  const cutSummaries = useMemo<CutSummary[]>(() => {
    const byPeriodEnd = new Map<string, CutSummary>();

    state.snapshots
      .filter((snapshot) => agencyIdsByFleet.has(snapshot.agencyId))
      .forEach((snapshot) => {
        const existing = byPeriodEnd.get(snapshot.periodEnd);

        if (!existing) {
          byPeriodEnd.set(snapshot.periodEnd, {
            periodEnd: snapshot.periodEnd,
            periodStart: snapshot.periodStart,
            agencyCount: 1,
            totalSales: snapshot.consolidatedSales,
            totalDue: Math.max(snapshot.totalDue, 0),
            totalTransferred: snapshot.transfersApplied,
            totalPendingAfter: snapshot.pendingAfter,
            complied: snapshot.collectionStatus === 'Cumplio' ? 1 : 0,
            partial: snapshot.collectionStatus === 'Parcial' ? 1 : 0,
            unpaid: snapshot.collectionStatus === 'No pago' ? 1 : 0,
          });
        } else {
          byPeriodEnd.set(snapshot.periodEnd, {
            ...existing,
            periodStart: snapshot.periodStart < existing.periodStart ? snapshot.periodStart : existing.periodStart,
            agencyCount: existing.agencyCount + 1,
            totalSales: existing.totalSales + snapshot.consolidatedSales,
            totalDue: existing.totalDue + Math.max(snapshot.totalDue, 0),
            totalTransferred: existing.totalTransferred + snapshot.transfersApplied,
            totalPendingAfter: existing.totalPendingAfter + snapshot.pendingAfter,
            complied: existing.complied + (snapshot.collectionStatus === 'Cumplio' ? 1 : 0),
            partial: existing.partial + (snapshot.collectionStatus === 'Parcial' ? 1 : 0),
            unpaid: existing.unpaid + (snapshot.collectionStatus === 'No pago' ? 1 : 0),
          });
        }
      });

    return [...byPeriodEnd.values()].sort((a, b) => b.periodEnd.localeCompare(a.periodEnd));
  }, [agencyIdsByFleet, state.snapshots]);

  const totals = useMemo(
    () => ({
      totalSales: cutSummaries.reduce((sum, c) => sum + c.totalSales, 0),
      totalDue: cutSummaries.reduce((sum, c) => sum + c.totalDue, 0),
      totalTransferred: cutSummaries.reduce((sum, c) => sum + c.totalTransferred, 0),
      totalPending: cutSummaries.reduce((sum, c) => sum + c.totalPendingAfter, 0),
    }),
    [cutSummaries],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          eyebrow="Historial"
          title="Resumen de cortes"
          description="Cada fila es un periodo de 3 dias. Haz clic en 'Ver detalle' para ver el estado de cada agencia en ese periodo."
        />
        <div className="grid w-full gap-2 sm:min-w-[220px] lg:max-w-[260px]">
          <Label htmlFor="cuts-fleet">Filtrar por flota</Label>
          <Select value={fleetId} onValueChange={setFleetId}>
            <SelectTrigger id="cuts-fleet">
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Cortes registrados" value={String(cutSummaries.length)} />
        <SummaryCard label="Ventas acumuladas" value={formatCurrency(totals.totalSales)} />
        <SummaryCard label="Total cobrado" value={formatCurrency(totals.totalTransferred)} />
        <SummaryCard label="Saldo pendiente total" value={formatCurrency(totals.totalPending)} tone={totals.totalPending > 0 ? 'warning' : 'default'} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalle por periodo</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
          {cutSummaries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-background/60 px-5 py-8 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">No hay cortes registrados.</p>
              <p className="mt-2">Todavia no hay periodos cerrados para mostrar.</p>
            </div>
          ) : (
            <TableContainer label="Tabla de cortes por periodo" hint="Los periodos aparecen del mas reciente al mas antiguo.">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Periodo</TableHead>
                    <TableHead className="text-right">Agencias</TableHead>
                    <TableHead className="text-right">Ventas del corte</TableHead>
                    <TableHead className="text-right">Total a deber</TableHead>
                    <TableHead className="text-right">Cobrado</TableHead>
                    <TableHead className="text-right">Saldo al cierre</TableHead>
                    <TableHead>Estado de cobro</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cutSummaries.map((cut, index) => (
                    <TableRow key={cut.periodEnd}>
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground">{formatDateRange(cut.periodStart, cut.periodEnd)}</p>
                          {index === 0 && (
                            <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                              Mas reciente
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-foreground">{cut.agencyCount}</TableCell>
                      <TableCell className="text-right tabular-nums text-foreground">{formatCurrency(cut.totalSales)}</TableCell>
                      <TableCell className="text-right tabular-nums text-foreground">{formatCurrency(cut.totalDue)}</TableCell>
                      <TableCell className="text-right tabular-nums text-foreground">{formatCurrency(cut.totalTransferred)}</TableCell>
                      <TableCell className="text-right">
                        <span className={cut.totalPendingAfter > 0 ? 'font-semibold tabular-nums text-amber-600 dark:text-amber-400' : 'tabular-nums text-foreground'}>
                          {formatCurrency(cut.totalPendingAfter)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {cut.complied > 0 && <Badge variant="success">{cut.complied} Cumplio</Badge>}
                          {cut.partial > 0 && <Badge variant="warning">{cut.partial} Parcial</Badge>}
                          {cut.unpaid > 0 && <Badge variant="danger">{cut.unpaid} No pago</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => setSelectedCut(cut)}>
                          Ver detalle
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <CutDetailDialog
        cut={selectedCut}
        fleetId={fleetId}
        open={Boolean(selectedCut)}
        onOpenChange={(open) => !open && setSelectedCut(null)}
      />
    </div>
  );
}

function CutDetailDialog({
  cut,
  fleetId,
  open,
  onOpenChange,
}: {
  cut: CutSummary | null;
  fleetId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const state = useDemoStore();

  const agencyRows = useMemo(() => {
    if (!cut) return [];

    const snapshots = state.snapshots.filter(
      (snapshot) =>
        snapshot.periodEnd === cut.periodEnd &&
        (fleetId === 'all' || state.agencies.find((a) => a.id === snapshot.agencyId)?.fleetId === fleetId),
    );

    const statusWeight = (status: CollectionStatus) =>
      status === 'No pago' ? 0 : status === 'Parcial' ? 1 : 2;

    return snapshots
      .map((snapshot) => {
        const agency = state.agencies.find((a) => a.id === snapshot.agencyId);
        return { snapshot, agency };
      })
      .filter((row): row is { snapshot: OperationalSnapshot; agency: NonNullable<typeof row.agency> } => Boolean(row.agency))
      .sort((a, b) => {
        const statusDiff = statusWeight(a.snapshot.collectionStatus) - statusWeight(b.snapshot.collectionStatus);
        if (statusDiff !== 0) return statusDiff;
        return b.snapshot.pendingAfter - a.snapshot.pendingAfter;
      });
  }, [cut, fleetId, state.agencies, state.snapshots]);

  if (!cut) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Detalle del corte: {formatDateRange(cut.periodStart, cut.periodEnd)}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Period summary strip */}
          <div className="grid gap-3 rounded-[1.35rem] border border-border/70 bg-background/75 p-4 sm:grid-cols-2 xl:grid-cols-4">
            <MiniStat label="Agencias" value={String(cut.agencyCount)} />
            <MiniStat label="Total a deber" value={formatCurrency(cut.totalDue)} />
            <MiniStat label="Cobrado" value={formatCurrency(cut.totalTransferred)} />
            <MiniStat
              label="Saldo al cierre"
              value={formatCurrency(cut.totalPendingAfter)}
              tone={cut.totalPendingAfter > 0 ? 'warning' : 'success'}
            />
          </div>

          {/* Agency breakdown table */}
          <TableContainer label="Agencias del corte" hint="Ordenadas por estado de cobro: primero las que no pagaron, luego las parciales, luego las que cumplieron.">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agencia</TableHead>
                  <TableHead>Flota</TableHead>
                  <TableHead className="text-right">Ventas</TableHead>
                  <TableHead className="text-right">Pendiente anterior</TableHead>
                  <TableHead className="text-right">Total a deber</TableHead>
                  <TableHead className="text-right">Cobrado</TableHead>
                  <TableHead className="text-right">Saldo al cierre</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agencyRows.map(({ snapshot, agency }) => (
                  <TableRow key={snapshot.id}>
                    <TableCell>
                      <p className="font-semibold text-foreground [overflow-wrap:anywhere]">{agency.name}</p>
                      <p className="text-xs text-muted-foreground">{agency.code}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground [overflow-wrap:anywhere]">{agency.fleetName}</TableCell>
                    <TableCell className="text-right tabular-nums text-foreground">{formatCurrency(snapshot.consolidatedSales)}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{formatCurrency(snapshot.pendingBefore)}</TableCell>
                    <TableCell className="text-right tabular-nums text-foreground">{formatCurrency(Math.max(snapshot.totalDue, 0))}</TableCell>
                    <TableCell className="text-right tabular-nums text-foreground">{formatCurrency(snapshot.transfersApplied)}</TableCell>
                    <TableCell className="text-right">
                      {snapshot.creditAfter > 0 ? (
                        <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
                          A favor {formatCurrency(snapshot.creditAfter)}
                        </span>
                      ) : (
                        <span className={snapshot.pendingAfter > 0 ? 'font-semibold tabular-nums text-amber-600 dark:text-amber-400' : 'tabular-nums text-foreground'}>
                          {formatCurrency(snapshot.pendingAfter)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={snapshot.collectionStatus === 'Cumplio' ? 'success' : snapshot.collectionStatus === 'Parcial' ? 'warning' : 'danger'}>
                        {snapshot.collectionStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SummaryCard({ label, tone = 'default', value }: { label: string; tone?: 'default' | 'warning'; value: string }) {
  return (
    <div className={`metric-panel ${tone === 'warning' ? 'border-amber-400/20 bg-amber-50/40 dark:bg-amber-950/20' : ''}`}>
      <p className="kpi-label">{label}</p>
      <p className={`mt-3 text-2xl font-semibold tabular-nums [overflow-wrap:anywhere] ${tone === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>
        {value}
      </p>
    </div>
  );
}

function MiniStat({ label, tone = 'default', value }: { label: string; tone?: 'default' | 'warning' | 'success'; value: string }) {
  return (
    <div>
      <p className="data-caption">{label}</p>
      <p className={`mt-1 text-base font-semibold tabular-nums [overflow-wrap:anywhere] ${
        tone === 'warning' ? 'text-amber-600 dark:text-amber-400' :
        tone === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
        'text-foreground'
      }`}>
        {value}
      </p>
    </div>
  );
}
