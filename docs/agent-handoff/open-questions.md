# Open questions

## Pendientes funcionales abiertos

### Provincia

- El `% provincia` debe seguir visible y configurable.
- Su formula final de negocio NO esta cerrada.
- Hoy el frontend muestra estimados sobre ventas, pero eso debe tratarse como lectura provisoria, no como settlement definitivo.

### Scope de dashboards

- La navegacion dice `Dashboards`, pero la app actual tiene una sola vista consolidada.
- Falta decidir si el producto final vuelve a separar vistas o si se consolida definitivamente en un unico dashboard principal.

### Jerarquia operativa

- La jerarquia `Provincia -> Flota -> Agencia` esta clara en modelo y copy.
- No existe aun una pantalla o patron dedicado para navegar la jerarquia como arbol o vistas drill-down formales.

### Persistencia de demo

- Las transferencias manuales viven en memoria del runtime.
- Solo la sesion puede persistirse temporalmente en `sessionStorage`.
- Si se quiere demo mas estable entre recargas, hace falta definir otra estrategia.

## Preguntas de negocio que no se deben inventar

- Como se liquida exactamente provincia respecto del flujo de agencias.
- Si provincia usa ventas brutas, ventas consolidadas, neto de transferencias u otra base.
- Si en el futuro la demo seguira centrada en operador diario o volvera a un enfoque mas ejecutivo/multi-dashboard.

## Deuda editorial o tecnica detectada

- `docs/lotovibe-source-of-truth.md` quedo como antecedente historico y hoy tiene partes desalineadas con la UI actual.
- El naming `Lotovibe` sigue presente en archivos internos, metadata tecnica y docs historicos, mientras la UI visible ya usa `Loteria`.
- Conviene decidir si el producto final mantiene uno de esos nombres para evitar ruido.
