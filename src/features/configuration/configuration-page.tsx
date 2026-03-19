import { useMemo, useState } from 'react';

import { useDemoStore } from '@/app/store/demo-store';
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

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Configuracion"
        title="Configuracion secundaria y simple"
        description="Provincia visible, porcentaje separado del saldo de agencias y persistencia local de sesion."
      />

      {statusMessage ? (
        <div className="rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300" role="status" aria-live="polite">
          {statusMessage}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle>Parametros globales</CardTitle>
            <CardDescription>El bloque provincia sigue visible y configurable, pero separado del flujo de deuda de agencias.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="province-name">Provincia</Label>
              <Input id="province-name" value={provinceName} onChange={(event) => setProvinceName(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="province-percentage">% provincia</Label>
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
                <p className="font-medium text-foreground">Persistencia temporal</p>
                <p className="text-sm text-muted-foreground">Mantiene la sesion demo en este navegador.</p>
              </div>
              <Switch checked={state.configuration.sessionPersistenceEnabled} onCheckedChange={(checked) => updateConfiguration({ sessionPersistenceEnabled: checked })} />
            </div>

            <div className="rounded-2xl border border-border bg-background/80 p-4 text-sm text-muted-foreground">
              Provincia queda como lectura separada y simple sobre ventas. El saldo de agencias se calcula aparte con cortes de 3 dias y arrastre de pendientes.
            </div>

            <Button
              disabled={Boolean(provincePercentageError)}
              onClick={() => {
                const parsedPercentage = parseNumericInput(provincePercentage);
                if (provincePercentageError || parsedPercentage === null) {
                  return;
                }

                updateConfiguration({ provinceName, defaultProvincePercentage: parsedPercentage });
                setStatusMessage('Se actualizo la provincia y el porcentaje global de la demo.');
              }}
            >
              Guardar configuracion
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impacto por flota</CardTitle>
            <CardDescription>Lectura resumida para las dos flotas de Santa Fe.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {fleetSummary.map((fleet) => (
              <div key={fleet.id} className="rounded-2xl border border-border bg-background/80 p-4">
                <p className="text-base font-semibold text-foreground">{fleet.name}</p>
                <div className="mt-4 space-y-3 text-sm">
                  <Row label="Agencias" value={String(fleet.agencies)} />
                  <Row label="Saldo pendiente" value={formatCurrency(fleet.balance)} />
                  <Row label="Deuda a provincia" value={formatCurrency(fleet.provinceDebt)} />
                  <Row label="Provincia global" value={formatPercent(state.configuration.defaultProvincePercentage)} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
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
