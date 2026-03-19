import * as React from 'react';
import { cn } from '@/lib/utils';

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return <table className={cn('min-w-full caption-bottom text-sm', className)} {...props} />;
}

interface TableContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  hint?: string;
}

export function TableContainer({ className, children, hint, label, ...props }: TableContainerProps) {
  const hintId = React.useId();

  return (
    <div className={cn('space-y-3', className)} {...props}>
      {hint ? (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-background/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background via-background/72 to-transparent md:hidden" />
        <div
          role="region"
          aria-label={label}
          aria-describedby={hint ? hintId : undefined}
          tabIndex={0}
          className="overflow-x-auto overflow-y-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {children}
        </div>
        <div className="border-t border-border/60 px-4 py-2 text-xs text-muted-foreground md:hidden">Desliza lateralmente para ver todas las columnas.</div>
      </div>
    </div>
  );
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-muted/35 [&_tr]:border-b [&_tr]:border-border/60', className)} {...props} />;
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-b border-border/40 transition hover:bg-muted/28', className)} {...props} />;
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn('h-12 whitespace-nowrap px-4 text-left align-middle text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground', className)} {...props} />;
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3.5 align-top', className)} {...props} />;
}
