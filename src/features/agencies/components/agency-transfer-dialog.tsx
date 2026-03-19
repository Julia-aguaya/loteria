import { useEffect, useMemo, useState } from 'react';

import { useDemoStore } from '@/app/store/demo-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getTransferBatchContext } from '@/lib/business';
import { formatCurrency } from '@/lib/format';
import { parseNumericInput, validateTransferAmount } from '@/lib/validation';
import type { AgencyMetrics } from '@/types/domain';

const invalidFieldClassName = 'border-rose-400/60 focus:border-rose-300 focus:ring-rose-300/20';

export function AgencyTransferDialog({
  metric,
  open,
  onOpenChange,
  selectedDate,
}: {
  metric: AgencyMetrics | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string;
}) {
  const state = useDemoStore();
  const addTransfer = useDemoStore((store) => store.addTransfer);
  const [date, setDate] = useState(selectedDate);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const context = useMemo(() => (metric ? getTransferBatchContext(state, metric.agency.id, date) : null), [date, metric, state]);

  useEffect(() => {
    if (!open || !metric) {
      return;
    }

    setDate(selectedDate);
    setAmount(String(Math.max(context?.totalDue ?? metric.pendingBalance, 0)));
    setNotes('');
  }, [context?.totalDue, metric, open, selectedDate]);
  const amountError = validateTransferAmount(amount);
  const parsedAmount = parseNumericInput(amount) ?? 0;
  const projectedBalance = (metric?.currentBalance ?? 0) - parsedAmount;
  const overpay = parsedAmount > Math.max(context?.totalDue ?? 0, 0) && parsedAmount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{metric ? `Transferencia para ${metric.agency.name}` : 'Nueva transferencia'}</DialogTitle>
          <DialogDescription>
            {metric ? 'Carga individual con contexto del corte visible, validacion inmediata y aviso claro si el monto deja saldo a favor.' : 'Selecciona una agencia para continuar.'}
          </DialogDescription>
        </DialogHeader>

        {metric && context ? (
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              if (amountError) {
                return;
              }

              addTransfer({
                agencyId: metric.agency.id,
                amount: parsedAmount,
                date,
                notes: notes.trim() || undefined,
              });
              onOpenChange(false);
            }}
          >
            <div className="rounded-2xl border border-border bg-background/70 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Contexto operativo</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{metric.agency.fleetName} · Codigo {metric.agency.code}</p>
                </div>
                <span className="section-chip">Fecha operativa {date}</span>
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-border bg-background/80 p-4 sm:grid-cols-2 xl:grid-cols-4">
              <DataPoint label="Pendiente anterior" value={formatCurrency(context.pendingBefore)} />
              <DataPoint label="Nuevo corte" value={formatCurrency(context.newCut)} />
              <DataPoint label="Total a deber" value={formatCurrency(context.totalDue)} />
              <DataPoint
                label="Saldo proyectado"
                value={projectedBalance < 0 ? `A favor ${formatCurrency(Math.abs(projectedBalance))}` : `Pendiente ${formatCurrency(projectedBalance)}`}
              />
            </div>

            {overpay ? (
              <div className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-foreground">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span>El monto supera el total a deber. Se permite y se registrara como saldo a favor.</span>
                  <Badge variant="warning">Sobrepago</Badge>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="agency-transfer-date">Fecha</Label>
                <Input id="agency-transfer-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
                <p className="text-sm text-muted-foreground">La fecha define en que cierre diario impacta la transferencia y que recorte la mostrara.</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="agency-transfer-amount">Monto a transferir</Label>
                <Input
                  id="agency-transfer-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  value={amount}
                  className={amountError ? invalidFieldClassName : undefined}
                  aria-describedby="agency-transfer-amount-help agency-transfer-amount-error"
                  aria-invalid={Boolean(amountError)}
                  onChange={(event) => setAmount(event.target.value)}
                />
                <p id="agency-transfer-amount-help" className="text-sm text-muted-foreground">
                  Usa el total a deber como referencia. Si lo superas, el excedente queda registrado como saldo a favor.
                </p>
                {amountError ? <p id="agency-transfer-amount-error" className="text-sm text-rose-600 dark:text-rose-300">{amountError}</p> : null}
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" className="min-h-10" onClick={() => setAmount(String(Math.max(context.totalDue, 0)))}>
                    Usar total a deber
                  </Button>
                  <span className="section-chip">Referencia {formatCurrency(context.totalDue)}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="agency-transfer-notes">Nota</Label>
              <Textarea
                id="agency-transfer-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Referencia operativa opcional"
                className="min-h-28"
              />
              <p className="text-sm text-muted-foreground">Opcional. Sirve para dejar contexto de cierre, regularizacion o referencia bancaria para el equipo.</p>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" className="min-h-11" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="min-h-11" disabled={Boolean(amountError)}>
                Registrar transferencia
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function DataPoint({ label, value }: { label: string; value: string }) {
  return (
    <div className="compact-stat">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
