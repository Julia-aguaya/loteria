import { CalendarRange, Clock3 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getCutWindowCoverage, getCutWindowForDate } from '@/lib/cut';
import { formatDate, formatDateRange } from '@/lib/format';
import type { TemporalRange } from '@/lib/temporal';
import type { DemoState } from '@/types/domain';

export function CutContextCard({
  state,
  range,
  title = 'Corte activo de 3 dias',
  className,
}: {
  state: DemoState;
  range: TemporalRange;
  title?: string;
  className?: string;
}) {
  const cut = getCutWindowForDate(state, range.end);
  const coverage = getCutWindowCoverage(range, cut);

  if (!cut) {
    return null;
  }

  const modeLabel = coverage.coversFullCut ? 'Corte completo' : 'Dentro del corte';
  const detail = coverage.coversFullCut
    ? `La ventana visible coincide con ${formatDateRange(cut.start, cut.end)}.`
    : `La fecha ${formatDate(range.end)} cae dentro de ${formatDateRange(cut.start, cut.end)}.`;

  return (
    <Card className={className}>
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <CalendarRange className="h-3.5 w-3.5" />
              {title}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">{formatDateRange(cut.start, cut.end)}</h3>
              <Badge variant={coverage.coversFullCut ? 'success' : 'accent'}>{modeLabel}</Badge>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">{detail}</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[320px]">
            <Stat label="Fecha visible" value={formatDate(range.end)} />
            <Stat label="Dias visibles" value={`${coverage.visibleDays}/${coverage.totalDays}`} />
            <Stat label="Cierre" value={formatDate(cut.end)} />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {cut.dates.map((date, index) => {
            const isSelected = date === range.end;
            const isVisible = range.start <= date && date <= range.end;

            return (
              <div
                key={date}
                className={`rounded-[1.1rem] border p-3 ${isSelected ? 'border-primary/30 bg-primary/8' : isVisible ? 'border-border/80 bg-background/80' : 'border-border/60 bg-background/55'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Dia {index + 1}</span>
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                      <Clock3 className="h-3 w-3" />
                      Visible
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm font-semibold text-foreground">{formatDate(date)}</p>
                 <p className="mt-1 text-xs text-muted-foreground">{isVisible ? 'Visible en esta lectura' : 'Fuera de la ventana actual'}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.1rem] border border-border/70 bg-background/75 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
