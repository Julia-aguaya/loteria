import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold', {
  variants: {
    variant: {
      default: 'border-border bg-muted/70 text-muted-foreground',
      success: 'border-success/20 bg-success/10 text-emerald-700 dark:text-emerald-300',
      warning: 'border-warning/20 bg-warning/10 text-amber-700 dark:text-amber-300',
      danger: 'border-destructive/20 bg-destructive/10 text-rose-700 dark:text-rose-300',
      accent: 'border-primary/20 bg-primary/10 text-primary',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
