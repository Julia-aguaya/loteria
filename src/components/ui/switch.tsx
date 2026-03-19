import { cn } from '@/lib/utils';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function Switch({ checked, onCheckedChange }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
        className={cn(
          'relative inline-flex h-8 w-14 items-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          checked ? 'border-primary/40 bg-primary/25' : 'border-border bg-secondary',
        )}
    >
      <span
        className={cn(
          'inline-block h-6 w-6 rounded-full bg-card shadow transition',
          checked ? 'translate-x-7' : 'translate-x-1',
        )}
      />
    </button>
  );
}
