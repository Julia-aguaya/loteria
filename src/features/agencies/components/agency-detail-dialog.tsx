import { useMemo } from 'react';
import { ArrowRightLeft } from 'lucide-react';

import { useDemoStore } from '@/app/store/demo-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAgencyDetailSummary } from '@/lib/business';
import { formatCurrency, formatDate, formatPercent } from '@/lib/format';
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
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>{detail?.metric.agency.name ?? 'Detalle de agencia'}</DialogTitle>
          <DialogDescription>Ficha completa con datos base, lectura de saldo, movimientos diarios y ciclos de 3 dias para decidir si hace falta intervenir.</DialogDescription>
        </DialogHeader>

        {detail ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                <span className="section-chip">Corte visible hasta {formatDate(selectedDate)}</span>
                <span className="section-chip">{detail.metric.agency.fleetName}</span>
                <span className="section-chip">Codigo {detail.metric.agency.code}</span>
              </div>
              <Button className="min-h-11 gap-2 sm:self-start lg:self-auto" onClick={() => onQuickTransfer(detail.metric)}>
                <ArrowRightLeft className="h-4 w-4" />
                Nueva transferencia
              </Button>
            </div>

            <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Datos fijos</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 px-4 pb-4 sm:px-6 sm:pb-6 md:grid-cols-2">
                  <InfoItem label="Flota" value={detail.metric.agency.fleetName} />
                  <InfoItem label="Codigo" value={detail.metric.agency.code} />
                  <InfoItem label="Direccion" value={detail.metric.agency.address} />
                  <InfoItem label="Telefono" value={detail.metric.agency.phone} />
                  <InfoItem label="Titular" value={detail.metric.agency.managerName} />
                  <InfoItem label="Documento" value={detail.metric.agency.managerDocument} />
                  <InfoItem label="Email" value={detail.metric.agency.managerEmail} />
                  <InfoItem label="% provincia" value={formatPercent(detail.metric.applicableProvincePercentage)} numeric />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumen de cobranza</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 px-4 pb-4 sm:px-6 sm:pb-6 md:grid-cols-2 xl:grid-cols-4">
                  <SummaryItem label="Saldo pendiente" value={formatCurrency(detail.metric.pendingBalance)} tone="default" />
                  <SummaryItem label="Saldo a favor" value={formatCurrency(detail.metric.creditBalance)} tone="success" />
                  <SummaryItem
                    label="Ultima transferencia"
                    value={detail.metric.lastTransfer ? formatCurrency(detail.metric.lastTransfer.amount) : 'Sin registro'}
                    helper={detail.metric.lastTransfer ? formatDate(detail.metric.lastTransfer.date) : undefined}
                  />
                  <SummaryItem
                    label="Tope / cercania"
                    value={formatPercent(detail.cycleProgress.capUsage)}
                    helper={
                      detail.cycleProgress.capUsage >= 100
                        ? `Excedido por ${formatCurrency(Math.abs(detail.cycleProgress.capRemaining))}`
                        : `Disponible ${formatCurrency(Math.max(detail.cycleProgress.capRemaining, 0))}`
                    }
                  />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Movimientos diarios</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                <TableContainer label="Movimientos diarios de agencia" hint="Ventas y transferencias por fecha con saldo acumulado que arrastra pendiente o credito.">
                  <Table className="text-sm">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Ventas</TableHead>
                        <TableHead className="text-right">Transferencias</TableHead>
                        <TableHead>Saldo acumulado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detail.dailyRows.map((row) => (
                        <TableRow key={row.date}>
                          <TableCell>{formatDate(row.date)}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatCurrency(row.sales)}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatCurrency(row.transfers)}</TableCell>
                          <TableCell className="tabular-nums">
                            {row.credit > 0 ? (
                              <span className="font-semibold text-emerald-600 dark:text-emerald-300">A favor {formatCurrency(row.credit)}</span>
                            ) : (
                              <span className="font-semibold text-foreground">Pendiente {formatCurrency(row.pending)}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ciclos de 3 dias</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                <TableContainer label="Ciclos de 3 dias de agencia" hint="La tabla prioriza periodo, total del corte, saldo posterior y estado. El detalle del armado queda resumido dentro de la columna de contexto.">
                  <Table className="text-sm">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Periodo</TableHead>
                        <TableHead className="text-right">Ventas del ciclo</TableHead>
                        <TableHead>Contexto del corte</TableHead>
                        <TableHead>Saldo posterior</TableHead>
                        <TableHead>Estado de cobro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detail.cycles.map((cycle) => (
                        <TableRow key={cycle.id}>
                          <TableCell>{`${formatDate(cycle.periodStart)} - ${formatDate(cycle.periodEnd)}`}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatCurrency(cycle.consolidatedSales)}</TableCell>
                          <TableCell>
                            <div className="table-stack tabular-nums">
                              <div className="table-meta">Anterior {formatCurrency(cycle.pendingBefore)}</div>
                              <div className="table-meta">Total a deber {formatCurrency(cycle.totalDue)}</div>
                              <div className="table-meta">Transferido {formatCurrency(cycle.transfersApplied)}</div>
                            </div>
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {cycle.creditAfter > 0 ? `A favor ${formatCurrency(cycle.creditAfter)}` : `Pendiente ${formatCurrency(cycle.pendingAfter)}`}
                          </TableCell>
                          <TableCell>
                            <Badge variant={cycle.collectionStatus === 'Cumplio' ? 'success' : cycle.collectionStatus === 'Parcial' ? 'warning' : 'danger'}>
                              {cycle.collectionStatus}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ultimas transferencias</CardTitle>
              </CardHeader>
                <CardContent className="space-y-3 px-4 pb-4 sm:px-6 sm:pb-6">
                  {detail.transfers.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-background/50 px-4 py-5 text-sm text-muted-foreground">
                      No hay transferencias registradas para este recorte. Si necesitas regularizar, puedes cargar una desde esta misma ficha.
                    </div>
                  ) : (
                    detail.transfers.map((transfer) => (
                      <div key={transfer.id} className="rounded-2xl border border-border bg-background/80 p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-sm text-muted-foreground">{formatDate(transfer.date)}</div>
                          <div className="text-sm font-semibold tabular-nums text-foreground">{formatCurrency(transfer.amount)}</div>
                        </div>
                        {transfer.notes ? <p className="mt-2 text-sm text-muted-foreground">{transfer.notes}</p> : null}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function InfoItem({ label, numeric = false, value }: { label: string; numeric?: boolean; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className={`mt-1 text-sm font-semibold text-foreground ${numeric ? 'tabular-nums' : ''}`}>{value}</p>
    </div>
  );
}

function SummaryItem({
  helper,
  label,
  tone = 'default',
  value,
}: {
  helper?: string;
  label: string;
  tone?: 'default' | 'success';
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/80 p-4">
      <p className="kpi-label">{label}</p>
      <p className={`mt-2 text-lg font-semibold tabular-nums ${tone === 'success' ? 'text-emerald-600 dark:text-emerald-300' : 'text-foreground'}`}>{value}</p>
      {helper ? <p className="mt-1 text-sm text-muted-foreground">{helper}</p> : null}
    </div>
  );
}
