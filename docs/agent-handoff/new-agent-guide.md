# New agent guide

## Donde mirar primero

1. `docs/agent-handoff/project-context.md`
2. `docs/agent-handoff/business-model.md`
3. `docs/agent-handoff/temporal-model.md`
4. `src/lib/business.ts`
5. `src/lib/temporal.ts`
6. `src/features/dashboard/dashboard-page.tsx`
7. `src/features/agencies/agencies-list-page.tsx`
8. `src/features/transfers/transfers-page.tsx`

## Como pensar el producto

- Pensalo como herramienta de operacion diaria.
- Primero corte y saldo, despues detalle historico.
- Provincia es un bloque paralelo, no el centro del flujo de agencias.
- Menos columnas, mas contexto encapsulado en resumenes y dialogos.

## Que no romper

- Navegacion principal: `Dashboards`, `Agencias`, `Transferencias globales`, `Configuracion`.
- Navbar simplificado con drawer mobile para navegacion y acciones globales.
- Patron temporal compartido entre pantallas.
- Corte operativo de 3 dias.
- Formula de arrastre del saldo.
- Sobrepago permitido con warning y saldo a favor.
- Columna unica de saldo en agencias.
- Estado de cobro del ultimo corte como señal visible.

## Regla practica para tocar frontend

- Si un dato sirve para decidir rapido, va en vista principal.
- Si un dato sirve para explicar o auditar, va en dialogo o detalle.
- Si un dato pertenece a provincia, no lo mezcles con cobranza de agencias.

## Archivos clave por tema

- Shell y navegacion: `src/components/layout/app-shell.tsx`
- Rutas: `src/app/router.tsx`
- Logica de negocio: `src/lib/business.ts`
- Temporalidad: `src/lib/temporal.ts`
- Datos demo: `src/lib/mock-data.ts`
- Dashboard: `src/features/dashboard/dashboard-page.tsx`
- Agencias: `src/features/agencies/agencies-list-page.tsx`
- Dialogo detalle: `src/features/agencies/components/agency-detail-dialog.tsx`
- Transferencias globales: `src/features/transfers/transfers-page.tsx`
- Configuracion: `src/features/configuration/configuration-page.tsx`

## Si detectas conflicto entre docs y codigo

- Prioriza el codigo actual para entender que esta implementado.
- Usa este paquete para el por que y para las restricciones funcionales.
- Si el conflicto toca formulas o alcance de provincia, tratelo como decision abierta, no lo cierres por intuicion.
