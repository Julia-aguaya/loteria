# Frontend architecture

## Stack y organizacion

- React con Vite y TypeScript.
- Zustand para store demo.
- React Router para navegacion.
- Tailwind + componentes base estilo shadcn.
- Logica de negocio concentrada en `src/lib/business.ts`.
- Logica temporal concentrada en `src/lib/temporal.ts`.

## Rutas actuales

Definidas en `src/app/router.tsx`:

- `/login`
- `/dashboard`
- `/agencies`
- `/transfers`
- `/configuration`

## Shell principal

`src/components/layout/app-shell.tsx` concentra:

- navegacion principal simplificada
- toggle de tema
- cierre de sesion
- header sticky con foco en acceso y no en resumenes operativos
- drawer/dialog mobile con menu hamburguesa para navegacion y acciones globales

Importante: el contexto operativo ya NO vive en la shell. Se movio al dashboard para que el header no compita con la lectura principal.

## Store demo

`src/app/store/demo-store.ts` define el estado principal:

- `agencies`
- `dailySales`
- `transfers`
- `snapshots`
- `configuration`
- `session`

Acciones relevantes:

- `login`
- `logout`
- `addTransfer`
- `addTransfers`
- `updateConfiguration`
- `updateAgencySettings`
- `simulateDay`

## Flujo de datos

1. `src/lib/mock-data.ts` crea configuracion, agencias, ventas diarias y transferencias iniciales.
2. `buildSnapshots()` en `src/lib/business.ts` consolida ciclos de 3 dias.
3. `deriveAgencyMetrics()` calcula KPIs por agencia para una fecha dada.
4. Las pantallas consumen esos derivados en vez de recalcular todo localmente.

## Pantallas y estado funcional real

### Dashboard

Archivo: `src/features/dashboard/dashboard-page.tsx`

- foco en el ultimo corte cerrado dentro de la fecha activa
- summary strip inicial con pendiente de red, saldo a favor y agencias con cobro abierto
- KPIs principales ya alineados con el negocio pedido
- filtro por flota
- bloque separado para provincia
- resumen de ultimas transferencias
- el toolbar temporal ya explica que toda la lectura depende del cierre activo

### Agencias

Archivo: `src/features/agencies/agencies-list-page.tsx`

- fecha/rango compartido con toolbar temporal
- tabla con ventas del dia, transferencias del dia, saldo y seguimiento
- columna de saldo unica
- estado de cobro del ultimo corte visible
- search panel y summary strip simples antes de la tabla
- acciones: ver detalle, cargar transferencia, editar datos

Dialogos relevantes:

- `src/features/agencies/components/agency-detail-dialog.tsx`
- `src/features/agencies/components/agency-transfer-dialog.tsx`
- `src/features/agencies/components/agency-edit-dialog.tsx`

El detalle ya incluye:

- datos base de agencia
- tabla diaria
- tabla de ciclos de 3 dias
- ultimas transferencias

### Transferencias globales

Archivo: `src/features/transfers/transfers-page.tsx`

- seleccion multiple desde tabla
- resumen conjunto lateral sticky
- modal de carga multiple
- contexto por agencia con pendiente anterior, nuevo corte y total a deber
- accion para completar todos los saldos o por fila
- warning de sobrepago con saldo a favor
- la tabla principal queda limpia: seleccion + saldo + total a deber + riesgo

### Configuracion

Archivo: `src/features/configuration/configuration-page.tsx`

- provincia global
- `% provincia` global
- toggle de persistencia de sesion
- resumen simple por flota

## Patrones implementados que conviene mantener

- Las tablas se simplifican y delegan contexto secundario a chips, resumenes y dialogos.
- La fecha visible siempre condiciona la lectura operativa.
- El modelo derivado vive en librerias puras, no disperso por la UI.
- Las pantallas comparten el mismo `TemporalToolbar`.
- El navbar no carga KPIs ni resumenes; la shell resuelve navegacion y acciones globales.
- Mobile y desktop conservan la misma arquitectura mental aunque cambie el patron de navegacion.

## Tension o gap actual

- El nombre de navegacion es `Dashboards`, pero hoy existe una sola vista consolidada.
- El calculo `provinceAmount` y `totalProvinceDebt` existe en codigo, pero la decision final del flujo provincia sigue abierta.
- El producto visible ya abandono parte del enfoque historico de `Lotovibe` mas orientado a varios dashboards separados.
