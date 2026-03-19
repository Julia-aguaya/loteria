import { useEffect, useRef, useState } from 'react';
import { ArrowRightLeft, Building2, LayoutDashboard, LogOut, Menu, Settings2 } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

import { useDemoStore } from '@/app/store/demo-store';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const navigation = [
  { to: '/dashboard', label: 'Dashboards', icon: LayoutDashboard },
  { to: '/agencies', label: 'Agencias', icon: Building2 },
  { to: '/transfers', label: 'Transferencias globales', icon: ArrowRightLeft },
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
      <div className="mx-auto flex min-h-[calc(100dvh-1rem)] max-w-[1480px] flex-col gap-3 sm:min-h-[calc(100dvh-2rem)] sm:gap-4">
        <header ref={headerRef} className="panel-elevated overflow-hidden px-3 py-3.5 md:sticky md:top-4 md:z-40 md:px-5 md:py-4 lg:px-6">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="flex flex-col gap-4 rounded-[1.5rem] border border-border/70 bg-background/60 p-3 sm:p-3.5 lg:flex-row lg:items-center lg:justify-between lg:gap-5 lg:p-4">
            <div className="flex min-w-0 items-center justify-between gap-3 sm:gap-4 lg:w-auto lg:flex-none lg:justify-start">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Panel operativo</p>
                <h1 className="truncate text-lg font-bold tracking-tight text-foreground sm:text-xl">Loteria</h1>
              </div>

              <div className="ml-auto flex items-center gap-2 lg:hidden">
                <ThemeToggle compact className="h-11 w-11 rounded-2xl" />

                <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 rounded-2xl border-border/70 bg-background/85 text-foreground shadow-sm hover:bg-accent/80 hover:text-foreground"
                      aria-label={isMobileMenuOpen ? 'Cerrar menu principal' : 'Abrir menu principal'}
                      aria-expanded={isMobileMenuOpen}
                      aria-controls="mobile-navigation"
                    >
                      <Menu className="h-5 w-5 shrink-0" />
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="left-auto right-2 top-2 flex h-[calc(100dvh-1rem)] w-[min(24rem,calc(100%-1rem))] translate-x-0 translate-y-0 flex-col gap-5 overflow-hidden rounded-[1.75rem] border border-border/80 bg-card/96 p-0 shadow-[0_28px_80px_rgba(15,23,42,0.36)] sm:right-4 sm:top-4 sm:h-[calc(100dvh-2rem)] sm:w-[26rem] lg:hidden">
                    <div className="border-b border-border/70 px-5 pb-4 pt-5 pr-16">
                      <DialogTitle className="text-left text-lg">Menu principal</DialogTitle>
                      <DialogDescription className="mt-1 text-left">
                        Accesos principales y acciones globales de la sesion activa.
                      </DialogDescription>

                      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border/70 bg-background/80 px-3.5 py-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Sesion activa</div>
                          <div className="truncate text-sm font-semibold text-foreground">{state.session.username ?? 'Operador demo'}</div>
                        </div>
                      </div>
                    </div>

                    <nav id="mobile-navigation" aria-label="Navegacion principal mobile" className="flex-1 space-y-2 overflow-y-auto px-4 pb-4">
                      {navigation.map((item) => {
                        const Icon = item.icon;

                        return (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                              cn(
                                'flex min-h-12 items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                                isActive
                                  ? 'border-primary/25 bg-primary/12 text-primary shadow-sm'
                                  : 'border-transparent bg-transparent text-muted-foreground hover:border-border hover:bg-accent/60 hover:text-foreground',
                              )
                            }
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="flex-1 leading-5">{item.label}</span>
                            {pathname === item.to ? <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-hidden="true" /> : null}
                          </NavLink>
                        );
                      })}
                    </nav>

                    <div className="border-t border-border/70 bg-background/70 p-4">
                      <div className="flex flex-col gap-2">
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

            <nav aria-label="Navegacion principal" className="hidden gap-2 sm:grid-cols-2 lg:flex lg:min-w-0 lg:flex-1 lg:flex-wrap xl:flex-nowrap">
              {navigation.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex min-h-11 min-w-0 items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-4 lg:flex-1 lg:justify-start',
                        isActive
                          ? 'border-primary/20 bg-primary/10 text-primary shadow-sm'
                          : 'border-transparent bg-transparent text-muted-foreground hover:border-border hover:bg-accent/60 hover:text-foreground',
                      )
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1 text-left leading-5">{item.label}</span>
                    {pathname === item.to ? <span className="h-2 w-2 shrink-0 rounded-full bg-primary" /> : null}
                  </NavLink>
                );
              })}
            </nav>

            <div className="hidden flex-col gap-3 rounded-2xl border border-border/70 bg-background/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:flex lg:min-w-[320px] lg:flex-none">
              <div className="min-w-0 space-y-1">
                <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Sesion activa</div>
                <div className="truncate text-sm font-semibold text-foreground">{state.session.username ?? 'Operador demo'}</div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <ThemeToggle className="min-h-11 flex-1 justify-between sm:min-w-[150px]" />
                <Button variant="destructive" className="min-h-11 flex-1 justify-between sm:min-w-[150px]" onClick={logout}>
                  Cerrar sesion
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
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
  );
}
