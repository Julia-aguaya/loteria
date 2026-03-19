import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  accent?: 'primary' | 'success' | 'warning';
}

export function KpiCard({ label, value, helper, icon: Icon, accent = 'primary' }: KpiCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="relative p-5 sm:p-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/60 to-transparent dark:via-white/20" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{value}</p>
          </div>
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-2xl border',
              accent === 'success' && 'border-success/20 bg-success/10 text-emerald-700 dark:text-emerald-300',
              accent === 'warning' && 'border-warning/20 bg-warning/10 text-amber-700 dark:text-amber-300',
              accent === 'primary' && 'border-primary/20 bg-primary/10 text-primary',
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-full text-sm leading-6 text-muted-foreground sm:max-w-[14rem]">{helper}</p>
          <Badge variant="accent" className="gap-1">
            <ArrowUpRight className="h-3 w-3" />
            Live
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
