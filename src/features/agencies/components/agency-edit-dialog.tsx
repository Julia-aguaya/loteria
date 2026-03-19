import { useEffect, useState } from 'react';

import { useDemoStore } from '@/app/store/demo-store';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseNumericInput, validateCapLimit, validatePercentage } from '@/lib/validation';
import type { AgencyMetrics, AgencyStatus } from '@/types/domain';

const invalidFieldClassName = 'border-rose-400/60 focus:border-rose-300 focus:ring-rose-300/20';

export function AgencyEditDialog({
  metric,
  open,
  onOpenChange,
}: {
  metric: AgencyMetrics | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateAgencySettings = useDemoStore((state) => state.updateAgencySettings);
  const [capLimit, setCapLimit] = useState('');
  const [override, setOverride] = useState('');
  const [status, setStatus] = useState<AgencyStatus>('active');

  useEffect(() => {
    if (!metric) {
      return;
    }

    setCapLimit(String(metric.agency.capLimit));
    setOverride(metric.agency.provincePercentageOverride?.toString() ?? '');
    setStatus(metric.agency.status);
  }, [metric]);

  const capError = validateCapLimit(capLimit);
  const overrideError = validatePercentage(override, false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{metric ? `Editar ${metric.agency.name}` : 'Editar agencia'}</DialogTitle>
          <DialogDescription>Ajusta tope comercial, porcentaje provincia y estado interno sin salir del flujo operativo.</DialogDescription>
        </DialogHeader>

        {metric ? (
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              const parsedCapLimit = parseNumericInput(capLimit);
              const parsedOverride = parseNumericInput(override);

              if (capError || overrideError || parsedCapLimit === null) {
                return;
              }

              updateAgencySettings(metric.agency.id, {
                capLimit: parsedCapLimit,
                provincePercentageOverride: override.trim() === '' ? undefined : parsedOverride ?? undefined,
                status,
              });
              onOpenChange(false);
            }}
          >
            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Agencia</p>
              <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{metric.agency.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.agency.fleetName} · Codigo {metric.agency.code}</p>
                </div>
                <p className="text-sm text-muted-foreground">Estado actual: {status === 'active' ? 'Operativa normal' : status === 'watch' ? 'Seguimiento manual' : 'Critica manual'}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="agency-cap-limit">Tope comercial</Label>
                <Input
                  id="agency-cap-limit"
                  type="number"
                  inputMode="decimal"
                  value={capLimit}
                  className={capError ? invalidFieldClassName : undefined}
                  aria-describedby="agency-cap-limit-help agency-cap-limit-error"
                  aria-invalid={Boolean(capError)}
                  onChange={(event) => setCapLimit(event.target.value)}
                />
                <p id="agency-cap-limit-help" className="text-sm text-muted-foreground">
                  Define el maximo tolerado antes de marcar cercania o exceso sobre el tope.
                </p>
                {capError ? <p id="agency-cap-limit-error" className="text-sm text-rose-600 dark:text-rose-300">{capError}</p> : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="agency-override">% provincia</Label>
                <Input
                  id="agency-override"
                  type="number"
                  inputMode="decimal"
                  value={override}
                  placeholder="Usa valor global"
                  className={overrideError ? invalidFieldClassName : undefined}
                  aria-describedby="agency-override-help agency-override-error"
                  aria-invalid={Boolean(overrideError)}
                  onChange={(event) => setOverride(event.target.value)}
                />
                <p id="agency-override-help" className="text-sm text-muted-foreground">
                  Dejalo vacio para seguir usando el porcentaje global configurado.
                </p>
                {overrideError ? <p id="agency-override-error" className="text-sm text-rose-600 dark:text-rose-300">{overrideError}</p> : null}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="agency-status">Estado de seguimiento</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as AgencyStatus)}>
                <SelectTrigger id="agency-status" aria-describedby="agency-status-help" className="min-h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Operativa normal</SelectItem>
                  <SelectItem value="watch">Seguimiento manual</SelectItem>
                  <SelectItem value="critical">Critica manual</SelectItem>
                </SelectContent>
              </Select>
              <p id="agency-status-help" className="text-sm text-muted-foreground">
                Se usa para priorizar seguimiento visual dentro del tablero, sin cambiar la logica de cobro.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" className="min-h-11" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="min-h-11" disabled={Boolean(capError || overrideError)}>
                Guardar cambios
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
