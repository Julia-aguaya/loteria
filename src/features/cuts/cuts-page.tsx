import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import { useDemoStore } from '@/app/store/demo-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SectionHeading } from '@/components/ui/section-heading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getFleetOptions } from '@/lib/business';
import { formatCurrency, formatDateRange } from '@/lib/format';
import { getCutSummaries } from '@/features/cuts/cut-support';

export function CutsPage() {
  const state = useDemoStore();
  const fleets = getFleetOptions(state);
  const [searchParams, setSearchParams] = useSearchParams();
  const fleetParam = searchParams.get('fleet') ?? 'all';
  const fleetId = fleetParam === 'all' || fleets.some((fleet) => fleet.id === fleetParam) ? fleetParam : 'all';

  const cutSummaries = useMemo(() => getCutSummaries(state, fleetId), [fleetId, state]);

  const totals = useMemo(
    () => ({
      totalSales: cutSummaries.reduce((sum, cut) => sum + cut.totalSales, 0),
      totalDue: cutSummaries.reduce((sum, cut) => sum + cut.totalDue, 0),
      totalTransferred: cutSummaries.reduce((sum, cut) => sum + cut.totalTransferred, 0),
      totalPending: cutSummaries.reduce((sum, cut) => sum + cut.totalPendingAfter, 0),
    }),
    [cutSummaries],
  );

  const handleFleetChange = (value: string) => {
    const nextParams = new URLSearchParams(searchParams);

    if (value === 'all') {
      nextParams.delete('fleet');
    } else {
      nextParams.set('fleet', value);
    }

    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          eyebrow="Historial"
          title="Resumen de cortes"
          description="Cada fila abre una vista completa y navegable para revisar el corte de 3 dias con mejor contexto y sin interrumpir el recorrido demo."
        />
        <div className="grid w-full gap-2 sm:min-w-[220px] lg:max-w-[260px]">
          <Label htmlFor="cuts-fleet">Filtrar por flota</Label>
          <Select value={fleetId} onValueChange={handleFleetChange}>
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
            <TableContainer label="Tabla de cortes por periodo" hint="Los periodos aparecen del mas reciente al mas antiguo y ahora abren una pagina dedicada para presentar el detalle completo.">
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
                  {cutSummaries.map((cut, index) => {
                    const detailHref = fleetId === 'all' ? `/cuts/${cut.periodEnd}` : `/cuts/${cut.periodEnd}?fleet=${encodeURIComponent(fleetId)}`;

                    return (
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
                          <Button asChild size="sm" variant="outline">
                            <Link to={detailHref}>
                              Ver detalles
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </div>
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
