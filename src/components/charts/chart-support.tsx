import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const chartTooltipStyle = {
  backgroundColor: 'rgba(16, 24, 38, 0.95)',
  border: '1px solid rgba(140, 169, 201, 0.25)',
  borderRadius: '16px',
  boxShadow: '0 20px 45px rgba(4, 9, 18, 0.35)',
};

export const chartAxisTick = { fill: '#8ba0bc', fontSize: 12 };
export const chartAxisTickCompact = { fill: '#8ba0bc', fontSize: 11 };

interface ChartLegendItem {
  label: string;
  color: string;
}

interface ChartLegendProps {
  items: ChartLegendItem[];
}

export function ChartLegend({ items }: ChartLegendProps) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Series del grafico">
      {items.map((item) => (
        <span
          key={item.label}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border/70 bg-background/30 px-3 py-2 text-sm text-muted-foreground"
        >
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
          <span>{item.label}</span>
        </span>
      ))}
    </div>
  );
}

interface ChartMobileListItem {
  label: string;
  value: string;
  detail?: string;
  emphasis?: ReactNode;
}

interface ChartMobileListProps {
  items: ChartMobileListItem[];
  emptyLabel?: string;
  className?: string;
}

export function ChartMobileList({ items, emptyLabel = 'Sin datos disponibles.', className }: ChartMobileListProps) {
  if (items.length === 0) {
    return <div className="rounded-2xl border border-dashed border-border/70 bg-background/10 p-4 text-sm text-muted-foreground">{emptyLabel}</div>;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item) => (
        <div key={`${item.label}-${item.value}`} className="rounded-2xl border border-border/70 bg-background/20 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              {item.detail ? <p className="text-sm text-muted-foreground">{item.detail}</p> : null}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-foreground">{item.value}</p>
              {item.emphasis ? <div className="mt-2">{item.emphasis}</div> : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
