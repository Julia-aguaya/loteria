import { MoonStar, SunMedium } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme/theme-provider';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      type="button"
      variant="outline"
      size={compact ? 'icon' : 'default'}
      className={cn(
        compact && 'border-border/70 bg-background/85 text-foreground shadow-sm hover:bg-accent/80 hover:text-foreground',
        className,
      )}
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {isDark ? <SunMedium className="h-4 w-4 shrink-0" /> : <MoonStar className="h-4 w-4 shrink-0" />}
      {compact ? <span className="sr-only">{isDark ? 'Modo claro' : 'Modo oscuro'}</span> : isDark ? 'Modo claro' : 'Modo oscuro'}
    </Button>
  );
}
