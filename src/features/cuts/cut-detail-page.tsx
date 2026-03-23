import { useMemo } from 'react';
import { ArrowLeft, ArrowRight, CircleAlert, Clock3 } from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { useDemoStore } from '@/app/store/demo-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDateRange, formatShortDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { getCutDetailModel, getCutStatusTone, getCutSummaries } from '@/features/cuts/cut-support';

export function CutDetailPage() {
  const navigate = useNavigate();
  const state = useDemoStore();
  const { periodEnd } = useParams();
  const [searchParams] = useSearchParams();
  const fleetId = searchParams.get('fleet') ?? 'all';
  const cutSummaries = useMemo(() => getCutSummaries(state, fleetId), [fleetId, state]);
  const cut = cutSummaries.find((item) => item.periodEnd === periodEnd) ?? null;
  const detailModel = useMemo(() => (cut ? getCutDetailModel(state, cut, fleetId) : null), [cut, fleetId, state]);
  const backHref = fleetId === 'all' ? '/cuts' : `/cuts?fleet=${encodeURIComponent(fleetId)}`;
  const latestCutEnd = cutSummaries[0]?.periodEnd;
  const canGoBack = typeof window !== 'undefined' && typeof window.history.state?.idx === 'number' && window.history.state.idx > 0;

  const handleBack = () => {
    if (canGoBack) {
      navigate(-1);
      return;
    }

    navigate(backHref);
  };

  if (!cut || !detailModel) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" className="justify-start px-0 text-muted-foreground hover:text-foreground" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
          Volver a cortes
        </Button>

        <Card className="border-dashed">
          <CardContent className="space-y-3 px-6 py-10 text-center sm:px-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <CircleAlert className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">No encontramos ese corte</h1>
              <p className="mx-auto max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                El periodo pudo cambiar por el filtro actual o ya no existe en el estado demo. Vuelve al historial para elegir otro corte.
              </p>
            </div>
            <Button asChild>
              <Link to={backHref}>
                Ir al historial de cortes
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { agencyRows, cutDates, salesByAgencyDate, transfersByAgencyDate } = detailModel;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Button variant="ghost" className="w-fit justify-start px-0 text-muted-foreground hover:text-foreground" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
          Volver a cortes
        </Button>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Vista navegable</Badge>
            <Badge variant="accent">Periodo de 3 dias</Badge>
            {cut.periodEnd === latestCutEnd ? <Badge variant="success">Mas reciente</Badge> : null}
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{formatDateRange(cut.periodStart, cut.periodEnd)}</h1>
            <p className="text-sm leading-6 text-muted-foreground">Detalle diario por agencia para priorizar la lectura operativa del corte.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="gap-3 border-b border-border/60 pb-4">
            <CardTitle>Detalle operativo por agencia</CardTitle>
            <CardDescription>
              Se priorizan las agencias con deuda abierta para que el seguimiento comercial arranque por lo mas urgente.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <TableContainer
              label="Detalle diario del corte"
              hint="Cada agencia muestra deuda anterior, los tres dias del periodo, totales del corte y el saldo final consolidado."
            >
              <Table className="min-w-[1180px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[280px]">Agencia</TableHead>
                    <TableHead className="text-right">Deuda anterior</TableHead>
                    {cutDates.map((date, index) => (
                      <TableHead key={date} className="text-center">
                        <span className="block text-primary">Dia {index + 1}</span>
                        <span className="block font-normal normal-case tracking-normal">{formatShortDate(date)}</span>
                      </TableHead>
                    ))}
                    <TableHead className="text-right">Total ventas</TableHead>
                    <TableHead className="text-right">Total cobrado</TableHead>
                    <TableHead className="text-right">Saldo al cierre</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agencyRows.map(({ agency, snapshot }) => {
                    const agencySales = salesByAgencyDate.get(agency.id) ?? new Map<string, number>();
                    const agencyTransfers = transfersByAgencyDate.get(agency.id) ?? new Map<string, number>();

                    return (
                      <TableRow key={snapshot.id}>
                        <TableCell className="min-w-[280px] max-w-[360px]">
                          <div className="space-y-1">
                            <p className="whitespace-normal text-sm font-semibold leading-5 text-foreground break-words">{agency.name}</p>
                            <p className="whitespace-normal text-xs leading-5 text-muted-foreground break-words">{agency.code} - {agency.fleetName}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {snapshot.pendingBefore > 0 ? (
                            <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">{formatCurrency(snapshot.pendingBefore)}</span>
                          ) : (
                            <span className="tabular-nums text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        {cutDates.map((date) => {
                          const sales = agencySales.get(date) ?? 0;
                          const transfers = agencyTransfers.get(date) ?? 0;

                          return (
                            <TableCell key={date} className="text-center">
                              <p className="tabular-nums text-foreground">{formatCurrency(sales)}</p>
                              <p className={cn('tabular-nums text-xs', transfers > 0 ? 'font-medium text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground')}>
                                {transfers > 0 ? `Cobro ${formatCurrency(transfers)}` : 'Sin cobro'}
                              </p>
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-right tabular-nums text-foreground">{formatCurrency(snapshot.consolidatedSales)}</TableCell>
                        <TableCell className="text-right tabular-nums text-foreground">{formatCurrency(snapshot.transfersApplied)}</TableCell>
                        <TableCell className="text-right">
                          {snapshot.creditAfter > 0 ? (
                            <span className="tabular-nums text-emerald-600 dark:text-emerald-400">A favor {formatCurrency(snapshot.creditAfter)}</span>
                          ) : (
                            <span className={cn('tabular-nums', snapshot.pendingAfter > 0 ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-muted-foreground')}>
                              {snapshot.pendingAfter > 0 ? formatCurrency(snapshot.pendingAfter) : '-'}
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
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-primary/[0.08] via-background to-background">
          <CardContent className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.9fr)] lg:p-6">
            <div className="space-y-5">
              <SectionHeading
                eyebrow="Contexto del corte"
                title="Lectura complementaria"
                description="El resumen del periodo queda despues de la tabla para no competir con la vista principal y mantener el contexto a mano cuando haga falta."
              />

              <div className="grid gap-3 sm:grid-cols-3">
                {cutDates.map((date, index) => (
                  <div key={date} className="rounded-[1.35rem] border border-border/70 bg-background/82 p-4 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/80">Dia {index + 1}</p>
                    <p className="mt-2 text-base font-semibold text-foreground">{formatShortDate(date)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Ventas y cobros consolidados de la jornada.</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.35rem] border border-border/70 bg-muted/25 p-4 text-sm leading-6 text-muted-foreground">
                <p className="font-semibold text-foreground">Como leer esta pantalla</p>
                <p className="mt-2">
                  Cada columna diaria muestra ventas arriba y cobros abajo. La tabla ya viene ordenada para que primero aparezcan las agencias que siguen abiertas.
                </p>
              </div>
            </div>

            <div className="space-y-3 self-start rounded-[1.6rem] border border-border/70 bg-background/82 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" />
                Lectura rapida del corte
              </div>

              <div className="grid gap-3">
                <OverviewStat label="Agencias incluidas" value={String(cut.agencyCount)} />
                <OverviewStat label="Ventas del periodo" value={formatCurrency(cut.totalSales)} />
                <OverviewStat label="Total a deber" value={formatCurrency(cut.totalDue)} />
                <OverviewStat label="Cobrado" value={formatCurrency(cut.totalTransferred)} tone="success" />
                <OverviewStat label="Saldo al cierre" value={formatCurrency(cut.totalPendingAfter)} tone={cut.totalPendingAfter > 0 ? 'warning' : 'success'} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OverviewStat({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'success' | 'warning' }) {
  return (
    <div className="rounded-[1.2rem] border border-border/70 bg-background/82 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className={cn('mt-2 text-base font-semibold tabular-nums [overflow-wrap:anywhere]', tone === 'success' ? 'text-emerald-600 dark:text-emerald-400' : tone === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-foreground')}>
        {value}
      </p>
    </div>
  );
}
