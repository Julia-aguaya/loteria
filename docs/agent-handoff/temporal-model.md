# Temporal model

## Idea central

Todo el frontend opera sobre un patron temporal compartido. La fecha no es un filtro cosmético: define que corte, que saldo y que movimientos son visibles.

## Presets actuales

Implementados en `src/lib/temporal.ts` y renderizados por `src/components/operations/temporal-toolbar.tsx`:

- `Hoy`
- `Ayer`
- `Ultimo corte`
- `Ultimos 7 dias`
- `Mes actual`
- `Rango personalizado`
- navegacion `Anterior` / `Siguiente`

## Regla de lectura comun

- La fecha final del rango activo (`end`) funciona como fecha operativa visible.
- En `Agencias`, la tabla se interpreta al cierre de esa fecha.
- En `Transferencias globales`, la carga impacta sobre esa fecha visible.
- En `Dashboard`, el resumen toma el ultimo corte cerrado disponible hasta esa fecha.

## Que significa `Ultimo corte`

- No es siempre el ultimo dia de datos.
- Es el ultimo ciclo cerrado de 3 dias disponible hasta la fecha de referencia activa.
- Se obtiene desde los snapshots ya consolidados.

## Como se construyen los cortes

En `src/lib/business.ts`:

- se ordenan fechas unicas de ventas
- se agrupan en ventanas de `consolidationFrequencyDays`
- hoy esa frecuencia vale `3`
- cada ventana genera un snapshot con ventas, pendiente anterior, total a deber, transferencias y saldo posterior

## Implicancias de producto

- El arrastre existe por definicion: si un corte no cierra completo, el siguiente ya nace con pendiente anterior.
- Una transferencia del dia puede cambiar tanto el saldo diario como el saldo consolidado del corte visible.
- Moverse con `Anterior` / `Siguiente` tiene que preservar la semantica del preset, no solo cambiar fechas arbitrarias.

## Lo que un agente nuevo tiene que entender SI o SI

- Fecha diaria y corte de 3 dias conviven; no son la misma cosa.
- La UI usa ambos niveles: detalle diario para trazabilidad, corte para lectura operativa.
- Si rompes esa dualidad, rompes el producto.
