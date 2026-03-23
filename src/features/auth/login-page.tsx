import { type FormEvent, useState } from 'react';
import { Building2, FileUp, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { demoCredentials, useDemoStore } from '@/app/store/demo-store';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useDemoStore((state) => state.login);
  const isAuthenticated = useDemoStore((state) => state.session.isAuthenticated);
  const [username, setUsername] = useState(demoCredentials.username);
  const [password, setPassword] = useState(demoCredentials.password);
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ok = login(username, password);
    if (!ok) {
      setError('Credenciales invalidas. Usa el acceso demo precargado para entrar al panel operativo.');
      return;
    }

    setError('');
    navigate('/dashboard');
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-grain opacity-80" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]"
      />
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>
      <div className="relative z-10 grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden rounded-[2rem] border border-border/60 bg-black/10 p-10 backdrop-blur-xl dark:bg-white/5 lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-6">
            <Badge variant="accent" className="w-fit">
              Modulo 1 · Acceso operativo
            </Badge>
            <div>
              <span className="text-xs uppercase tracking-[0.35em] text-primary/80">Loteria</span>
            <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-tight text-foreground">
              Panel administrativo inicial para leer deuda, ventas, cumplimiento y carga operativa desde una misma base.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-muted-foreground">
              La demo del Modulo 1 concentra registro de multiples loterias, carga por PDF y seguimiento comercial en cortes de 3 dias sin sumar automatizaciones ni flujos fuera del alcance inicial.
            </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Building2, label: 'Registro de multiples loterias' },
              { icon: FileUp, label: 'Carga de datos via PDF' },
              { icon: ShieldCheck, label: 'Deuda, ventas y cumplimiento' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-2xl border border-border/60 bg-card/55 p-5">
                <Icon className="h-5 w-5 text-primary" />
                <p className="mt-4 text-sm font-medium text-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="mx-auto w-full max-w-xl rounded-[2rem]">
          <CardHeader className="p-8 pb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <CardTitle className="pt-4 text-3xl">Ingreso al panel administrativo</CardTitle>
            <CardDescription>
              Accede con las credenciales demo para revisar la base operativa del Modulo 1 y recuperar la sesion local si ya estabas trabajando en este navegador.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <div className="grid gap-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  type="email"
                  autoComplete="username"
                  value={username}
                  aria-describedby="username-help"
                  onChange={(event) => setUsername(event.target.value)}
                />
                <p id="username-help" className="text-sm text-muted-foreground">
                  El correo demo ya viene listo para entrar directo al flujo operativo.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Clave de acceso</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  aria-describedby="password-help"
                  onChange={(event) => setPassword(event.target.value)}
                />
                <p id="password-help" className="text-sm text-muted-foreground">
                  La clave demo esta precargada para validar rapido el acceso al panel inicial con Enter o el boton principal.
                </p>
              </div>
              {error ? (
                <p role="alert" aria-live="polite" className="text-sm text-rose-600 dark:text-rose-300">
                  {error}
                </p>
              ) : null}
              <Button type="submit" className="w-full" size="lg">
                Entrar al Modulo 1
              </Button>
            </form>
            <div className="mt-6 rounded-2xl border border-border/70 bg-background/40 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Acceso demo precargado</p>
              <p className="mt-2">Usuario: {demoCredentials.username}</p>
              <p>Clave: {demoCredentials.password}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
