import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatShortDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { getCutStatusTone, type CutDetailModel, type CutSummary } from '@/features/cuts/cut-support';

export function CutsOperationalTable({ detailModel, selectedCut }: { detailModel: CutDetailModel; selectedCut: CutSummary }) {
  const { agencyRows, cutDates, salesByAgencyDate, transfersByAgencyDate } = detailModel;

  const totalPendingBefore = agencyRows.reduce((s, { snapshot }) => s + snapshot.pendingBefore, 0);
  const totalSalesByDate = cutDates.map((date) =>
    agencyRows.reduce((s, { agency }) => s + (salesByAgencyDate.get(agency.id)?.get(date) ?? 0), 0),
  );
  const totalTransfersByDate = cutDates.map((date) =>
    agencyRows.reduce((s, { agency }) => s + (transfersByAgencyDate.get(agency.id)?.get(date) ?? 0), 0),
  );
  const totalConsolidatedSales = agencyRows.reduce((s, { snapshot }) => s + snapshot.consolidatedSales, 0);
  const totalTransfersApplied = agencyRows.reduce((s, { snapshot }) => s + snapshot.transfersApplied, 0);
  const totalPendingAfter = agencyRows.reduce((s, { snapshot }) => s + Math.max(snapshot.pendingAfter, 0), 0);

  return (
    <TableContainer label="Tabla operativa del periodo">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px] min-w-[140px]">Agencia</TableHead>
            <TableHead className="min-w-[88px] text-right">Anterior</TableHead>
            {cutDates.map((date, index) => (
              <TableHead key={date} className="min-w-[88px] text-center">
                <span className="block text-primary">Dia {index + 1}</span>
                <span className="block font-normal normal-case tracking-normal text-muted-foreground">{formatShortDate(date)}</span>
              </TableHead>
            ))}
            <TableHead className="min-w-[88px] text-right">Ventas</TableHead>
            <TableHead className="min-w-[88px] text-right">Cobrado</TableHead>
            <TableHead className="min-w-[88px] text-right">Saldo</TableHead>
            <TableHead className="w-[90px]">Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agencyRows.map(({ agency, snapshot }) => {
            const agencySales = salesByAgencyDate.get(agency.id) ?? new Map<string, number>();
            const agencyTransfers = transfersByAgencyDate.get(agency.id) ?? new Map<string, number>();

            return (
              <TableRow key={snapshot.id}>
                <TableCell className="w-[180px] min-w-[140px]">
                  <div className="space-y-0.5">
                    <p className="truncate text-sm font-semibold text-foreground" title={agency.name}>{agency.name}</p>
                    <p className="truncate text-xs text-muted-foreground" title={agency.code}>{agency.code}</p>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {snapshot.pendingBefore > 0 ? (
                    <span className="font-semibold tabular-nums text-amber-500">{formatCurrency(snapshot.pendingBefore)}</span>
                  ) : (
                    <span className="tabular-nums text-muted-foreground">—</span>
                  )}
                </TableCell>
                {cutDates.map((date) => {
                  const sales = agencySales.get(date) ?? 0;
                  const transfer = agencyTransfers.get(date) ?? 0;

                  return (
                    <TableCell key={`${selectedCut.periodEnd}-${agency.id}-${date}`} className="text-center">
                      <p className="tabular-nums text-foreground">{formatCurrency(sales)}</p>
                      {transfer > 0 ? (
                        <p className="mt-0.5 tabular-nums text-xs font-medium text-emerald-400">{formatCurrency(transfer)}</p>
                      ) : null}
                    </TableCell>
                  );
                })}
                <TableCell className="text-right tabular-nums text-foreground">{formatCurrency(snapshot.consolidatedSales)}</TableCell>
                <TableCell className="text-right tabular-nums text-foreground">{formatCurrency(snapshot.transfersApplied)}</TableCell>
                <TableCell className="text-right">
                  {snapshot.creditAfter > 0 ? (
                    <span className="tabular-nums text-emerald-400">+{formatCurrency(snapshot.creditAfter)}</span>
                  ) : (
                    <span className={cn('tabular-nums', snapshot.pendingAfter > 0 ? 'font-semibold text-amber-500' : 'text-muted-foreground')}>
                      {snapshot.pendingAfter > 0 ? formatCurrency(snapshot.pendingAfter) : '—'}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={getCutStatusTone(snapshot.collectionStatus)}>{snapshot.collectionStatus}</Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Totales</TableCell>
            <TableCell className="text-right">
              {totalPendingBefore > 0 ? (
                <span className="tabular-nums text-amber-500">{formatCurrency(totalPendingBefore)}</span>
              ) : (
                <span className="tabular-nums text-muted-foreground">—</span>
              )}
            </TableCell>
            {cutDates.map((date, index) => {
              const daySales = totalSalesByDate[index] ?? 0;
              const dayTransfers = totalTransfersByDate[index] ?? 0;

              return (
                <TableCell key={`total-${date}`} className="text-center">
                  <p className="tabular-nums text-foreground">{formatCurrency(daySales)}</p>
                  {dayTransfers > 0 ? (
                    <p className="mt-0.5 tabular-nums text-xs text-emerald-400">{formatCurrency(dayTransfers)}</p>
                  ) : null}
                </TableCell>
              );
            })}
            <TableCell className="text-right tabular-nums text-foreground">{formatCurrency(totalConsolidatedSales)}</TableCell>
            <TableCell className="text-right tabular-nums text-foreground">{formatCurrency(totalTransfersApplied)}</TableCell>
            <TableCell className="text-right">
              <span className={cn('tabular-nums', totalPendingAfter > 0 ? 'text-amber-500' : 'text-muted-foreground')}>
                {totalPendingAfter > 0 ? formatCurrency(totalPendingAfter) : '—'}
              </span>
            </TableCell>
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}
