# Project context

## Que es este proyecto

`Loteria` es un frontend demo privado para gestion operativa de agencias de loteria.

- Stack: React + Vite + TypeScript + Tailwind + primitives estilo shadcn + Zustand + React Router.
- Datos: todo vive en memoria dentro del store demo, con mock data inicial y carga manual de transferencias.
- Autenticacion: login hardcodeado.
- Persistencia: sesion opcional en `sessionStorage`; negocio y transferencias no persisten fuera de memoria en esta demo.

## Modelo operativo visible

- Provincia visible: Santa Fe.
- Estructura conceptual: Provincia -> Flota -> Agencia.
- Red demo actual: 25 agencias distribuidas en 2 flotas.
- Flotas actuales del mock: `Flota Litoral Norte` y `Flota Corredor Sur`.
- Corte operativo: cada 3 dias.
- Operacion central: medir ventas, deuda por ciclo, transferencias cargadas y saldo pendiente o a favor.

## Navegacion principal actual

La shell principal expone cuatro entradas y ya no usa un header cargado de contexto operativo:

- `Dashboards`
- `Agencias`
- `Transferencias globales`
- `Configuracion`

Ademas:

- En desktop la navegacion vive inline dentro del header.
- En mobile se resuelve con boton hamburguesa + drawer/dialog lateral.
- El toggle de tema y el cierre de sesion quedaron como acciones globales de shell.

## Estado actual del frontend

- Existe una sola pagina `/dashboard` que concentra la lectura principal del negocio.
- No hay hoy dashboards separados de cobranzas/performance; el label `Dashboards` agrupa una vista consolidada.
- El resumen operativo que antes vivia en header ahora vive dentro de `Dashboard`, junto con KPIs, contexto de red y lectura del ultimo corte.
- `Agencias` ya trabaja con fecha seleccionable y muestra saldo acumulado al cierre elegido.
- `Transferencias globales` ya soporta seleccion multiple, resumen conjunto y carga masiva por modal.
- `Configuracion` mantiene provincia, `% provincia` global y persistencia de sesion como bloque separado.

## Archivos base del proyecto

- `src/app/router.tsx`: rutas actuales.
- `src/components/layout/app-shell.tsx`: shell, navegacion principal simplificada, drawer mobile y acciones globales.
- `src/app/store/demo-store.ts`: estado demo y acciones principales.
- `src/lib/business.ts`: logica de negocio derivada.
- `src/lib/temporal.ts`: logica temporal y presets.
- `src/lib/mock-data.ts`: universo demo inicial.

## Decisiones no obvias que ya conviene asumir

- El frontend ya esta orientado a operador diario, no a dashboard ejecutivo abstracto lleno de charts.
- La provincia queda visible pero separada del flujo de cobranza de agencias.
- El saldo visible de una agencia es unico: o pendiente o a favor. No se muestran dos columnas paralelas para eso.
- La fecha manda: casi toda lectura operativa se recalcula usando la fecha final del rango temporal activo.
