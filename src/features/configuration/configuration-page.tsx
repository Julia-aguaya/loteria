import { useMemo, useState } from 'react';
import { Database, Landmark, Save, ShieldCheck } from 'lucide-react';

import { useDemoStore } from '@/app/store/demo-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionHeading } from '@/components/ui/section-heading';
import { Switch } from '@/components/ui/switch';
import { deriveAgencyMetrics, getFleetOptions } from '@/lib/business';
import { formatCurrency, formatPercent } from '@/lib/format';
import { parseNumericInput, validatePercentage } from '@/lib/validation';

const invalidFieldClassName = 'border-rose-400/60 focus:border-rose-300 focus:ring-rose-300/20';

export function ConfigurationPage() {
  const state = useDemoStore();
  const updateConfiguration = useDemoStore((store) => store.updateConfiguration);
  const [provinceName, setProvinceName] = useState(state.configuration.provinceName);
  const [provincePercentage, setProvincePercentage] = useState(String(state.configuration.defaultProvincePercentage));
  const [statusMessage, setStatusMessage] = useState('');
  const metrics = deriveAgencyMetrics(state);
  const fleets = getFleetOptions(state);
  const provincePercentageError = validatePercentage(provincePercentage);

  const fleetSummary = useMemo(
    () =>
      fleets.map((fleet) => {
        const fleetMetrics = metrics.filter((metric) => metric.agency.fleetId === fleet.id);

        return {
          ...fleet,
          agencies: fleetMetrics.length,
          balance: fleetMetrics.reduce((sum, metric) => sum + metric.currentBalance, 0),
          provinceDebt: fleetMetrics.reduce((sum, metric) => sum + metric.totalProvinceDebt, 0),
        };
      }),
    [fleets, metrics],
  );

  const totals = useMemo(
    () => ({
      agencies: metrics.length,
      pendingBalance: metrics.reduce((sum, metric) => sum + metric.currentBalance, 0),
      provinceDebt: metrics.reduce((sum, metric) => sum + metric.totalProvinceDebt, 0),
    }),
    [metrics],
  );

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Modulo 1 · Configuracion"
        title="Parametros base para la operacion inicial"
        description="La configuracion cierra la base operativa del sistema: define provincia, porcentaje global y persistencia local sin mover la logica del modulo."
      />

      <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-primary/[0.10] via-background to-background">
        <CardContent className="grid gap-6 p-5 lg:p-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="space-y-5">
            <div className="space-y-3">
              <Badge variant="accent" className="w-fit">
                Configuracion operativa del sistema
              </Badge>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Este bloque define los parametros base que sostienen la lectura administrativa del Modulo 1.
              </h2>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
                Aqui se mantiene la referencia provincial, el porcentaje global aplicado a la demo y la persistencia de sesion para seguir operando desde el mismo navegador.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <div className="section-chip">
                <Landmark className="h-4 w-4 text-primary" />
                Provincia y porcentaje base visibles para toda la demo
              </div>
              <div className="section-chip">
                <Database className="h-4 w-4 text-primary" />
                Base estructurada por flota, deuda y lectura operativa
              </div>
            </div>
          </div>

          <div className="summary-strip space-y-3 self-start border border-border/70 bg-background/78">
            <SummaryItem label="Provincia activa" value={state.configuration.provinceName} />
            <SummaryItem label="Porcentaje global" value={formatPercent(state.configuration.defaultProvincePercentage)} />
            <SummaryItem label="Base estructurada" value={`${totals.agencies} agencias listas para cobro, ventas y seguimiento`} />
          </div>
        </CardContent>
      </Card>

      {statusMessage ? (
        <div className="rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300" role="status" aria-live="polite">
          {statusMessage}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle>Parametros globales del modulo</CardTitle>
            <CardDescription>Ajusta la referencia provincial y conserva la sesion demo sin tocar la logica operativa de cobro, cortes y ventas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="province-name">Provincia de referencia</Label>
              <Input id="province-name" value={provinceName} onChange={(event) => setProvinceName(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="province-percentage">Porcentaje provincial base</Label>
              <Input
                id="province-percentage"
                type="number"
                value={provincePercentage}
                className={provincePercentageError ? invalidFieldClassName : undefined}
                onChange={(event) => setProvincePercentage(event.target.value)}
              />
              {provincePercentageError ? <p className="text-sm text-rose-600 dark:text-rose-300">{provincePercentageError}</p> : null}
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-border bg-background/80 p-4">
              <div>
                <p className="font-medium text-foreground">Persistencia local de sesion</p>
                <p className="text-sm text-muted-foreground">Conserva el acceso demo en este navegador para continuar el panel administrativo inicial.</p>
              </div>
              <Switch checked={state.configuration.sessionPersistenceEnabled} onCheckedChange={(checked) => updateConfiguration({ sessionPersistenceEnabled: checked })} />
            </div>

            <div className="impact-panel space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-background/80 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Criterio operativo actual</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Provincia sigue como referencia separada sobre ventas. La deuda de agencias mantiene su lectura propia con cortes de 3 dias y arrastre de pendientes.
                  </p>
                </div>
              </div>
            </div>

            <Button
              disabled={Boolean(provincePercentageError)}
              onClick={() => {
                const parsedPercentage = parseNumericInput(provincePercentage);
                if (provincePercentageError || parsedPercentage === null) {
                  return;
                }

                updateConfiguration({ provinceName, defaultProvincePercentage: parsedPercentage });
                setStatusMessage('Se actualizaron los parametros base de provincia para la demo operativa.');
              }}
            >
              <Save className="h-4 w-4" />
              Guardar parametros base
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impacto actual por flota</CardTitle>
            <CardDescription>Resumen administrativo para validar como queda hoy la base estructurada entre saldo pendiente, deuda provincial y cobertura operativa.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <CompactMetric label="Agencias visibles" value={String(totals.agencies)} />
              <CompactMetric label="Saldo pendiente" value={formatCurrency(totals.pendingBalance)} />
              <CompactMetric label="Deuda a provincia" value={formatCurrency(totals.provinceDebt)} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
            {fleetSummary.map((fleet) => (
              <div key={fleet.id} className="rounded-2xl border border-border bg-background/80 p-4">
                <p className="text-base font-semibold text-foreground">{fleet.name}</p>
                <div className="mt-4 space-y-3 text-sm">
                  <Row label="Agencias" value={String(fleet.agencies)} />
                  <Row label="Saldo pendiente" value={formatCurrency(fleet.balance)} />
                  <Row label="Deuda a provincia" value={formatCurrency(fleet.provinceDebt)} />
                  <Row label="Porcentaje provincial" value={formatPercent(state.configuration.defaultProvincePercentage)} />
                </div>
              </div>
            ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="compact-stat">
      <p className="kpi-label">{label}</p>
      <p className="mt-3 text-lg font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 px-3 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] leading-4 text-muted-foreground [overflow-wrap:anywhere]">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground [overflow-wrap:anywhere]">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
