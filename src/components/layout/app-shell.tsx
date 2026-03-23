import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRightLeft, Building2, CalendarRange, LayoutDashboard, LogOut, Menu, Settings2 } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

import { useDemoStore } from '@/app/store/demo-store';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const navigation = [
  { to: '/inicio', label: 'Inicio', icon: LayoutDashboard },
  { to: '/cuts', label: 'Periodos', icon: CalendarRange },
  { to: '/agencies', label: 'Agencias', icon: Building2 },
];

const advancedNavigation = [
  { to: '/transfers', label: 'Carga multiple', icon: ArrowRightLeft },
  { to: '/configuration', label: 'Configuracion', icon: Settings2 },
];

export function AppShell() {
  const { pathname } = useLocation();
  const shellRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const state = useDemoStore();
  const logout = useDemoStore((store) => store.logout);
  const isActivePath = (path: string) => pathname === path || pathname.startsWith(`${path}/`);
  const currentSection = useMemo(() => {
    if (pathname.startsWith('/cuts') || pathname.startsWith('/periodos')) return 'Periodos';
    if (pathname.startsWith('/agencies')) return 'Agencias';
    return 'Inicio';
  }, [pathname]);

  useEffect(() => {
    const main = mainRef.current;

    if (!main) {
      return;
    }

    main.focus({ preventScroll: true });
  }, [pathname]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const shell = shellRef.current;
    const header = headerRef.current;

    if (!shell || !header) {
      return;
    }

    const updateHeaderOffset = () => {
      shell.style.setProperty('--shell-header-offset', `${Math.ceil(header.getBoundingClientRect().height)}px`);
    };

    updateHeaderOffset();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateHeaderOffset);

      return () => {
        window.removeEventListener('resize', updateHeaderOffset);
      };
    }

    const observer = new ResizeObserver(() => {
      updateHeaderOffset();
    });

    observer.observe(header);
    window.addEventListener('resize', updateHeaderOffset);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeaderOffset);
    };
  }, []);

  return (
    <div ref={shellRef} className="min-h-dvh px-2 py-2 [--shell-header-offset:0px] sm:px-4 sm:py-3 md:px-6">
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <div className="mx-auto min-h-[calc(100dvh-1rem)] max-w-[1540px] sm:min-h-[calc(100dvh-2rem)] lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6">
        <aside className="hidden lg:block">
          <div className="app-sidebar lg:sticky lg:top-4 lg:flex lg:h-[calc(100dvh-2rem)] lg:flex-col">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/20">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Demo comercial</p>
                  <h1 className="truncate text-lg font-bold tracking-tight text-foreground">Loteria</h1>
                </div>
              </div>

              <nav aria-label="Navegacion principal" className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) => cn('app-nav-item', isActive ? 'app-nav-item-active' : 'app-nav-item-idle')}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {isActivePath(item.to) ? <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-hidden="true" /> : null}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="mt-auto space-y-4">
              <div className="rounded-[1.4rem] border border-border/70 bg-background/70 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Sesion activa</div>
                <div className="mt-2 truncate text-sm font-semibold text-foreground">{state.session.username ?? 'Operador demo'}</div>
              </div>

              <div className="rounded-[1.4rem] border border-dashed border-border/70 bg-background/50 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Accesos secundarios</div>
                <div className="mt-3 space-y-2">
                  {advancedNavigation.map((item) => {
                    const Icon = item.icon;

                    return (
                      <NavLink key={item.to} to={item.to} className="flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent/40 hover:text-foreground">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <ThemeToggle className="min-h-11 w-full justify-between" />
                <Button variant="destructive" className="min-h-11 w-full justify-between" onClick={logout}>
                  Cerrar sesion
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-h-[calc(100dvh-1rem)] flex-col gap-3 sm:min-h-[calc(100dvh-2rem)] sm:gap-4 lg:min-h-[calc(100dvh-2rem)] lg:gap-6">
          <header ref={headerRef} className="panel-elevated overflow-hidden px-3 py-3.5 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Navegacion principal</div>
                <div className="truncate text-lg font-semibold text-foreground">{currentSection}</div>
              </div>

              <div className="flex items-center gap-2">
                <ThemeToggle compact className="h-11 w-11 rounded-2xl" />

                <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 rounded-2xl"
                      aria-label={isMobileMenuOpen ? 'Cerrar menu principal' : 'Abrir menu principal'}
                      aria-expanded={isMobileMenuOpen}
                      aria-controls="mobile-navigation"
                    >
                      <Menu className="h-5 w-5 shrink-0" />
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="left-2 right-auto top-2 flex h-[calc(100dvh-1rem)] w-[min(22rem,calc(100%-1rem))] translate-x-0 translate-y-0 flex-col gap-5 overflow-hidden rounded-[1.75rem] p-0 sm:left-4 sm:top-4 sm:h-[calc(100dvh-2rem)]">
                    <div className="border-b border-border/70 px-5 pb-4 pt-5 pr-16">
                      <DialogTitle className="text-left text-lg">Menu principal</DialogTitle>
                      <DialogDescription className="mt-1 text-left">
                        Inicio, periodos y agencias quedan primero. Los accesos secundarios se mantienen fuera del flujo principal.
                      </DialogDescription>
                    </div>

                    <nav id="mobile-navigation" aria-label="Navegacion principal mobile" className="flex-1 space-y-2 overflow-y-auto px-4 pb-4">
                      {navigation.map((item) => {
                        const Icon = item.icon;

                        return (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => cn('app-nav-item', isActive ? 'app-nav-item-active' : 'app-nav-item-idle')}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="flex-1">{item.label}</span>
                            {isActivePath(item.to) ? <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-hidden="true" /> : null}
                          </NavLink>
                        );
                      })}

                      <div className="mt-5 rounded-[1.4rem] border border-dashed border-border/70 bg-background/50 p-4">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Accesos secundarios</div>
                        <div className="mt-3 space-y-2">
                          {advancedNavigation.map((item) => {
                            const Icon = item.icon;

                            return (
                              <NavLink key={item.to} to={item.to} className="flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent/40 hover:text-foreground">
                                <Icon className="h-4 w-4 shrink-0" />
                                <span>{item.label}</span>
                              </NavLink>
                            );
                          })}
                        </div>
                      </div>
                    </nav>

                    <div className="border-t border-border/70 bg-background/70 p-4">
                      <div className="rounded-[1.4rem] border border-border/70 bg-background/80 p-4">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Sesion activa</div>
                        <div className="mt-2 truncate text-sm font-semibold text-foreground">{state.session.username ?? 'Operador demo'}</div>
                      </div>

                      <div className="mt-3 flex flex-col gap-2">
                        <ThemeToggle className="min-h-11 justify-between" />
                        <Button variant="destructive" className="min-h-11 justify-between" onClick={logout}>
                          Cerrar sesion
                          <LogOut className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </header>

          <main
            id="main-content"
            ref={mainRef}
            tabIndex={-1}
            className="panel-elevated flex-1 overflow-x-hidden p-3.5 outline-none sm:p-5 lg:p-6"
            style={{ scrollMarginTop: 'calc(var(--shell-header-offset) + 1.5rem)' }}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
