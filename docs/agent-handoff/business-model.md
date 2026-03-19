# Business model

## Reglas confirmadas que deben guiar el producto

- Provincia operativa visible: Santa Fe.
- El negocio se explica con jerarquia `Provincia -> Flota -> Agencia`.
- Hay 2 flotas demo y varias agencias dentro de cada una.
- El corte operativo ocurre cada 3 dias.
- La deuda del ciclo se toma como todas las ventas de ese ciclo.
- La transferencia se registra el mismo dia del cierre o informe visible.
- Si no se cubre todo, el saldo pendiente se arrastra al ciclo siguiente.
- Se permite sobrepago; si pasa, se genera alerta y saldo a favor.
- `% provincia` existe, pero se mantiene separado del flujo de agencias.
- La formula final completa de provincia sigue pendiente como decision de negocio.

## Formula conceptual del dinero

La lectura consolidada que debe sostener la UI es:

`saldo actual = saldo anterior + nuevo corte - transferencias`

Traduccion operativa:

- `saldo anterior`: lo que venia pendiente del ciclo previo.
- `nuevo corte`: ventas acumuladas del ciclo actual de 3 dias.
- `transferencias`: lo registrado para esa agencia en la fecha/ciclo visible.

## Como esta hoy en el codigo

En `src/lib/business.ts` el snapshot operativo usa esta secuencia:

- `runningBalance` como arrastre del ciclo previo.
- `consolidatedSales` como ventas del ciclo.
- `totalDue = runningBalance + consolidatedSales`.
- `balanceAfterConsolidation = totalDue - transfersApplied`.
- `pendingAfter` y `creditAfter` separan deuda y saldo a favor segun el signo final.

Esto coincide con el modelo consolidado pedido para agencias y transferencias.

## Estado de cobro

El estado del ultimo corte se resume asi:

- `Cumplio`: no hay deuda positiva pendiente o se cubrio todo el total a deber.
- `Parcial`: hubo transferencia pero no alcanza el total.
- `No pago`: no hubo transferencia aplicada al total positivo.

Este estado aparece en dashboard, tabla de agencias y detalle de ciclos.

## Saldo visible en agencias

La UI debe seguir mostrando una columna unica `Saldo`:

- Si el valor es positivo: `Pendiente`.
- Si el valor es negativo: `A favor`.

No inflar la tabla con deuda, credito y otros derivados por separado.

## Transferencias globales e individuales

La carga operativa trabaja con este contexto por agencia:

- `Pendiente anterior`
- `Nuevo corte`
- `Total a deber`
- `Monto a transferir`

Comportamiento esperado:

- hay accion para completar el total
- el sobrepago no se bloquea
- el sobrepago deja warning y saldo a favor
- la fecha de carga impacta en el cierre visible de esa fecha

## Provincia separada

La provincia hoy se muestra como bloque simple y aparte.

- No mezclar `% provincia` con el saldo operativo de agencias.
- En el codigo actual se calcula un estimado sobre ventas, pero eso NO debe asumirse como formula final cerrada de negocio.
- Tratar cualquier cambio en esa formula como pendiente de definicion funcional.
