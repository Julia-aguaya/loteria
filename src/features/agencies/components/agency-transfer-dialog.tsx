import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRightLeft, CheckCircle2, Sparkles } from 'lucide-react';

import { useDemoStore } from '@/app/store/demo-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getTransferBatchContext, getTransferProjection } from '@/lib/business';
import { formatCurrency, formatDate } from '@/lib/format';
import { parseNumericInput, validateTransferAmount } from '@/lib/validation';
import type { AgencyMetrics } from '@/types/domain';

const invalidFieldClassName = 'border-rose-400/60 focus:border-rose-300 focus:ring-rose-300/20';

interface TransferConfirmationState {
  agencyId: string;
  amount: number;
  date: string;
}

export function AgencyTransferDialog({
  metric,
  open,
  onCompleted,
  onOpenChange,
  selectedDate,
}: {
  metric: AgencyMetrics | null;
  open: boolean;
  onCompleted: (agencyId: string) => void;
  onOpenChange: (open: boolean) => void;
  selectedDate: string;
}) {
  const state = useDemoStore();
  const addTransfer = useDemoStore((store) => store.addTransfer);
  const [date, setDate] = useState(selectedDate);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmation, setConfirmation] = useState<TransferConfirmationState | null>(null);
  const wasOpenRef = useRef(false);
  const initializedAgencyIdRef = useRef<string | null>(null);

  const context = useMemo(() => (metric ? getTransferBatchContext(state, metric.agency.id, date) : null), [date, metric, state]);
  const suggestedAmount = Math.max(context?.totalDue ?? metric?.pendingBalance ?? 0, 0);

  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      initializedAgencyIdRef.current = null;
      return;
    }

    if (!metric) return;

    const shouldInitialize = !wasOpenRef.current || initializedAgencyIdRef.current !== metric.agency.id;
    if (!shouldInitialize) return;

    const initialContext = getTransferBatchContext(state, metric.agency.id, selectedDate);
    setDate(selectedDate);
    setAmount(String(Math.max(initialContext?.totalDue ?? metric.pendingBalance, 0)));
    setNotes('');
    setConfirmation(null);
    wasOpenRef.current = true;
    initializedAgencyIdRef.current = metric.agency.id;
  }, [metric, open, selectedDate, state]);

  const amountError = validateTransferAmount(amount);
  const parsedAmount = parseNumericInput(amount) ?? 0;
  const projection = getTransferProjection(Math.max(context?.totalDue ?? metric?.pendingBalance ?? 0, 0), parsedAmount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{metric ? `Registrar transferencia para ${metric.agency.name}` : 'Registrar transferencia'}</DialogTitle>
          <DialogDescription className="sr-only">Registrar transferencia</DialogDescription>
        </DialogHeader>

        {metric && context ? (
          confirmation ? (
            <TransferSuccessState
              agencyName={metric.agency.name}
              amount={confirmation.amount}
              date={confirmation.date}
              projection={projection}
              onReturn={() => {
                onCompleted(confirmation.agencyId);
                onOpenChange(false);
              }}
            />
          ) : (
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                if (amountError) return;
                addTransfer({
                  agencyId: metric.agency.id,
                  amount: parsedAmount,
                  date,
                  notes: notes.trim() || undefined,
                });
                setConfirmation({ agencyId: metric.agency.id, amount: parsedAmount, date });
              }}
            >
              <div className="flex flex-wrap gap-2">
                <Badge variant="accent">{metric.agency.fleetName}</Badge>
                <Badge variant={metric.pendingBalance > 0 ? 'danger' : 'success'}>
                  {metric.pendingBalance > 0 ? 'Con pendiente' : 'Sin pendiente'}
                </Badge>
                <Badge variant="default">Fecha {formatDate(date)}</Badge>
              </div>

              <div className="detail-hero space-y-4">
                <div>
                  <p className="kpi-label">Monto sugerido</p>
                  <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">{formatCurrency(suggestedAmount)}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">El sugerido cubre el total a deber del corte actual sin tocar la logica del saldo.</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <ContextStat label="Pendiente anterior" value={formatCurrency(context.pendingBefore)} />
                  <ContextStat label="Nuevo corte" value={formatCurrency(context.newCut)} />
                  <ContextStat label="Total a deber" value={formatCurrency(context.totalDue)} />
                </div>
              </div>

              <div className="impact-panel">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="kpi-label text-primary">Proyeccion del monto</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">{projection.headline}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{projection.message}</p>
                  </div>
                  <Badge variant={projection.state === 'credit' ? 'warning' : projection.state === 'settled' ? 'success' : 'accent'}>
                    {projection.state === 'credit' ? 'Saldo a favor' : projection.state === 'settled' ? 'Cierre resuelto' : 'Queda pendiente'}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="agency-transfer-date">Fecha</Label>
                  <Input id="agency-transfer-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="agency-transfer-amount">Monto</Label>
                  <Input
                    id="agency-transfer-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    inputMode="decimal"
                    value={amount}
                    className={amountError ? invalidFieldClassName : undefined}
                    aria-describedby="agency-transfer-amount-error"
                    aria-invalid={Boolean(amountError)}
                    onChange={(event) => setAmount(event.target.value)}
                  />
                  {amountError ? (
                    <p id="agency-transfer-amount-error" className="text-sm text-rose-600 dark:text-rose-300">
                      {amountError}
                    </p>
                  ) : null}
                  <Button type="button" size="sm" variant="outline" onClick={() => setAmount(String(suggestedAmount))}>
                    <Sparkles className="h-4 w-4" />
                    Usar sugerido
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="agency-transfer-notes">Referencia o nota</Label>
                <Textarea
                  id="agency-transfer-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Referencia bancaria u observaciones"
                  className="min-h-16"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={Boolean(amountError)}>
                  <ArrowRightLeft className="h-4 w-4" />
                  Confirmar transferencia
                </Button>
              </DialogFooter>
            </form>
          )
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function TransferSuccessState({
  agencyName,
  amount,
  date,
  onReturn,
  projection,
}: {
  agencyName: string;
  amount: number;
  date: string;
  onReturn: () => void;
  projection: ReturnType<typeof getTransferProjection>;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-[1.5rem] border border-success/20 bg-success/10 p-5">
        <div className="flex flex-col gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-success/15 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-2xl font-semibold text-foreground">Transferencia registrada</h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Se cargaron {formatCurrency(amount)} para {agencyName} con fecha {formatDate(date)}.
          </p>
        </div>
      </div>

      <div className="impact-panel">
        <p className="text-lg font-semibold text-foreground">{projection.headline}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{projection.message}</p>
      </div>

      <DialogFooter>
        <Button onClick={onReturn}>Volver al detalle</Button>
      </DialogFooter>
    </div>
  );
}

function ContextStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.1rem] border border-border/70 bg-background/80 p-3">
      <p className="data-caption">{label}</p>
      <p className="mt-2 text-sm font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
