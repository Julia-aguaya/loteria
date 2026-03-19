import { ArrowLeft, ArrowRight, CalendarRange, History, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatDate, formatDateRange } from '@/lib/format';
import type { TemporalPreset, TemporalRange } from '@/lib/temporal';

const presetLabels: Record<Exclude<TemporalPreset, 'custom'>, string> = {
  today: 'Hoy',
  yesterday: 'Ayer',
  latest_cut: 'Ultimo corte',
  last_7_days: 'Ultimos 7 dias',
  current_month: 'Mes actual',
};

export function TemporalToolbar({
  value,
  canGoNext,
  canGoPrevious,
  helper,
  maxDate,
  minDate,
  onCustomRangeChange,
  onPresetChange,
  onShift,
}: {
  value: TemporalRange;
  canGoNext: boolean;
  canGoPrevious: boolean;
  helper: string;
  maxDate: string;
  minDate: string;
  onCustomRangeChange: (start: string, end: string) => void;
  onPresetChange: (preset: Exclude<TemporalPreset, 'custom'>) => void;
  onShift: (direction: -1 | 1) => void;
}) {
  const activeLabel = value.preset === 'custom' ? 'Rango personalizado' : presetLabels[value.preset];
  const visibleRange = value.start === value.end ? formatDate(value.end) : formatDateRange(value.start, value.end);

  return (
    <div className="filter-toolbar space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <History className="h-3.5 w-3.5" />
            Navegacion temporal
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="section-chip">
              <CalendarRange className="h-4 w-4 text-primary" />
              {activeLabel}
            </span>
            <span className="section-chip">Ventana {visibleRange}</span>
            <span className="section-chip">Cierre activo {formatDate(value.end)}</span>
          </div>
          <p className="toolbar-note">{helper}</p>
        </div>

        <div className="flex flex-wrap gap-2 xl:justify-end">
          <Button type="button" size="sm" variant="outline" disabled={!canGoPrevious} onClick={() => onShift(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={!canGoNext} onClick={() => onShift(1)}>
            Siguiente
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(presetLabels) as Array<Exclude<TemporalPreset, 'custom'>>).map((preset) => {
          const active = value.preset === preset;

          return (
            <button
              key={preset}
              type="button"
              className={cn('toolbar-chip border', active ? 'border-primary/40 bg-primary/12 text-primary shadow-sm' : 'border-border/70 bg-background/80 text-muted-foreground hover:bg-muted/60 hover:text-foreground')}
              onClick={() => onPresetChange(preset)}
            >
              {presetLabels[preset]}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 rounded-[1.2rem] border border-border/70 bg-background/70 p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
        <div className="grid gap-2">
          <label htmlFor="temporal-start" className="text-sm font-medium text-foreground">
            Desde
          </label>
          <Input
            id="temporal-start"
            type="date"
            min={minDate}
            max={maxDate}
            value={value.start}
            onChange={(event) => onCustomRangeChange(event.target.value, value.end)}
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="temporal-end" className="text-sm font-medium text-foreground">
            Hasta
          </label>
          <Input
            id="temporal-end"
            type="date"
            min={minDate}
            max={maxDate}
            value={value.end}
            onChange={(event) => onCustomRangeChange(value.start, event.target.value)}
          />
        </div>
        <Button type="button" size="sm" variant="ghost" className="md:self-end" onClick={() => onCustomRangeChange(value.end, value.end)}>
          <RotateCcw className="h-4 w-4" />
          Usar solo cierre activo
        </Button>
      </div>
    </div>
  );
}
