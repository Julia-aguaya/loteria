import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChartShellProps {
  title: string;
  description: string;
  action?: ReactNode;
  legend?: ReactNode;
  insight?: string;
  srSummary?: string;
  mobileFallback?: ReactNode;
  contentClassName?: string;
  children: ReactNode;
}

export function ChartShell({ title, description, action, legend, insight, srSummary, mobileFallback, contentClassName, children }: ChartShellProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {action ? <div className="w-full sm:w-auto">{action}</div> : null}
      </CardHeader>
      <CardContent className={cn('space-y-4', contentClassName)}>
        {srSummary ? <p className="sr-only">{srSummary}</p> : null}
        {legend}
        {mobileFallback ? <div className="md:hidden">{mobileFallback}</div> : null}
        <div className={cn(mobileFallback && 'hidden md:block')}>{children}</div>
        {insight ? <p className="text-sm leading-6 text-muted-foreground">{insight}</p> : null}
      </CardContent>
    </Card>
  );
}
