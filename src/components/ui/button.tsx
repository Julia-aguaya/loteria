import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ease-out active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-[0_18px_40px_rgba(32,129,226,0.28)] hover:bg-primary/90',
        secondary: 'border border-border/80 bg-secondary/80 text-secondary-foreground hover:bg-secondary',
        outline: 'border border-border/80 bg-card/75 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-primary/20 hover:bg-accent/50',
        ghost: 'text-muted-foreground hover:bg-accent/40 hover:text-foreground',
        success: 'bg-success text-success-foreground shadow-[0_18px_40px_rgba(16,185,129,0.20)] hover:bg-success/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-[0_18px_40px_rgba(244,63,94,0.22)] hover:bg-destructive/90',
      },
      size: {
        default: 'h-11',
        sm: 'h-10 rounded-xl px-4',
        lg: 'h-12 rounded-2xl px-6 text-base',
        icon: 'h-10 w-10 px-0 py-0 [&_svg]:shrink-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});

Button.displayName = 'Button';

export { Button, buttonVariants };
