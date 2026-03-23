import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useDemoStore } from '@/app/store/demo-store';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SectionHeading } from '@/components/ui/section-heading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCutDetailModel, getCutSummaries } from '@/features/cuts/cut-support';
import { CutsOperationalTable } from '@/features/cuts/components/cuts-operational-table';
import { getFleetOptions } from '@/lib/business';
import { formatCurrency, formatDateRange } from '@/lib/format';

export function CutsPage() {
  const state = useDemoStore();
  const fleets = getFleetOptions(state);
  const [searchParams, setSearchParams] = useSearchParams();
  const fleetParam = searchParams.get('fleet') ?? 'all';
  const periodParam = searchParams.get('period');
  const fleetId = fleetParam === 'all' || fleets.some((fleet) => fleet.id === fleetParam) ? fleetParam : 'all';

  const cutSummaries = useMemo(() => getCutSummaries(state, fleetId), [fleetId, state]);
  const latestPeriodEnd = cutSummaries[0]?.periodEnd ?? null;
  const selectedPeriodEnd = periodParam && cutSummaries.some((cut) => cut.periodEnd === periodParam) ? periodParam : latestPeriodEnd;
  const selectedCut = cutSummaries.find((cut) => cut.periodEnd === selectedPeriodEnd) ?? null;
  const detailModel = useMemo(() => (selectedCut ? getCutDetailModel(state, selectedCut, fleetId) : null), [fleetId, selectedCut, state]);

  const handleFleetChange = (value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value === 'all') {
      nextParams.delete('fleet');
    } else {
      nextParams.set('fleet', value);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handlePeriodChange = (value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('period', value);
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <SectionHeading
          eyebrow="Modulo 1 · Periodos"
          title="Periodos operativos"
        />

        <div className="grid w-full gap-3 md:grid-cols-2 xl:max-w-[620px]">
          <div className="grid gap-2">
            <Label htmlFor="cuts-period">Seleccionar periodo</Label>
            <Select value={selectedPeriodEnd ?? ''} onValueChange={handlePeriodChange}>
              <SelectTrigger id="cuts-period">
                <SelectValue placeholder="Elegir periodo" />
              </SelectTrigger>
              <SelectContent>
                {cutSummaries.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    Sin periodos cerrados
                  </SelectItem>
                ) : (
                  cutSummaries.map((cut, index) => (
                    <SelectItem key={cut.periodEnd} value={cut.periodEnd}>
                      {formatDateRange(cut.periodStart, cut.periodEnd)}
                      {index === 0 ? ' - mas reciente' : ''}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
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
      </div>

      {selectedCut && (
        <div className="rounded-[1.4rem] border border-border/70 bg-background/80 px-5 py-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {formatDateRange(selectedCut.periodStart, selectedCut.periodEnd)}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">{selectedCut.agencyCount} agencias</Badge>
              <Badge variant={selectedCut.unpaid > 0 ? 'danger' : selectedCut.partial > 0 ? 'warning' : 'success'}>
                {selectedCut.unpaid} sin pago · {selectedCut.partial} parcial · {selectedCut.complied} cumplieron
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t border-border/40 pt-4 sm:grid-cols-3">
            <div>
              <p className="data-caption">Ventas del periodo</p>
              <p className="mt-1.5 text-base font-semibold tabular-nums text-foreground">{formatCurrency(selectedCut.totalSales)}</p>
            </div>
            <div>
              <p className="data-caption">Total cobrado</p>
              <p className="mt-1.5 text-base font-semibold tabular-nums text-foreground">{formatCurrency(selectedCut.totalTransferred)}</p>
            </div>
            <div>
              <p className="data-caption">Saldo pendiente</p>
              <p className={`mt-1.5 text-base font-semibold tabular-nums ${selectedCut.totalPendingAfter > 0 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                {selectedCut.totalPendingAfter > 0 ? formatCurrency(selectedCut.totalPendingAfter) : '—'}
              </p>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tabla operativa del periodo</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
          {!selectedCut || !detailModel ? (
            <div className="rounded-2xl border border-dashed border-border bg-background/60 px-5 py-8 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">No hay periodos registrados.</p>
              <p className="mt-2">Todavia no hay periodos cerrados para mostrar.</p>
            </div>
          ) : (
            <CutsOperationalTable detailModel={detailModel} selectedCut={selectedCut} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
