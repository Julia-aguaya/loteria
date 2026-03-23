import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, className }: SectionHeadingProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <span className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">{eyebrow}</span>
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">{title}</h1>
        {description ? <p className="max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">{description}</p> : null}
      </div>
    </div>
  );
}
