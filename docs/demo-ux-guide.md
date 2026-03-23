# Guia accionable UX/UI para demo comercial de Loteria

## Objetivo de la demo

Convertir la UI actual en una demo comercial simple, clara y persuasiva que muestre en menos de 90 segundos cuatro ideas clave:

1. donde esta el riesgo
2. que agencias priorizar
3. que accion tomar ahora
4. que impacto genera esa accion

La demo debe seguir este flujo fijo:

`Inicio -> Agencias prioritarias -> Detalle de agencia -> Registrar transferencia`

No busca mostrar toda la capacidad operativa del producto. Busca vender claridad, foco y velocidad de decision.

---

## Principios de la demo comercial

- Mostrar primero valor, no estructura interna.
- Dejar una sola pregunta por pantalla.
- Priorizar lectura ejecutiva sobre densidad operativa.
- Reducir tablas largas, filtros avanzados y lenguaje tecnico innecesario.
- Hacer visible el riesgo en 3 segundos.
- Hacer evidente la accion principal en 5 segundos.
- Hacer tangible el impacto antes de confirmar una transferencia.
- Mantener la direccion visual premium ya lograda: fondos con capas suaves, tipografia clara, tarjetas elevadas y montos con buen contraste.
- Conservar un patron consistente de CTA: una accion principal por pantalla, secundarias subordinadas.
- Usar profundidad solo cuando ayude a cerrar la historia comercial, no para exhibir complejidad.

---

## Narrativa de 60-90 segundos

"Este es el panel que le muestra al equipo donde actuar primero. En Inicio, la red se resume en riesgo, deuda abierta y agencias que requieren intervencion. Con un click entramos a Agencias prioritarias, donde el sistema ordena automaticamente las sucursales que mas necesitan accion. Abrimos una agencia y vemos su contexto en claro: cuanto debe, que tan cerca esta del tope y cual fue su ultimo comportamiento de pago. Desde ahi registramos la transferencia con el monto sugerido y antes de confirmar vemos el impacto inmediato sobre el saldo. La idea es simple: detectar riesgo, priorizar, actuar y cerrar el ciclo sin perder tiempo entre pantallas."

---

## Wireframe low-fi por pantalla

### Inicio

**Objetivo**  
Abrir la demo con una lectura ejecutiva de la red y empujar a la lista de agencias que requieren accion.

**Jerarquia**  
1. titular comercial  
2. resumen de riesgo de red  
3. lista corta de prioridades  
4. CTA a la pantalla siguiente  
5. contexto secundario del cierre actual

**Bloques**
- Header simple
  - titulo: `Control comercial de la red`
  - subtitulo: `Detecta riesgo y actua sobre las agencias que necesitan regularizacion hoy.`
- Banda de resumen con 4 KPIs
  - `Agencias en riesgo`
  - `Monto pendiente abierto`
  - `Transferido en el ultimo cierre`
  - `Agencias que cumplieron`
- Bloque principal: `Prioridades de hoy`
  - top 5 agencias ordenadas por riesgo y saldo pendiente
  - cada fila muestra: agencia, estado, monto pendiente, cercania al tope
  - fila clickeable
- Bloque secundario corto: `Cierre actual`
  - rango del corte
  - total a deber
  - saldo remanente
- Footer de accion
  - CTA principal centrado o al pie del bloque principal

**CTA principal / secundarias**
- Principal: `Ver agencias prioritarias`
- Secundarias:
  - `Cambiar flota`
  - `Ver cierre actual`

**Contenido secundario**
- filtro por flota
- chip con fecha operativa
- nota corta sobre el corte de 3 dias, sin explicar la mecanica completa

**Low-fi textual**
```text
[Header]
Control comercial de la red
Detecta riesgo y actua sobre las agencias que necesitan regularizacion hoy.

[KPI 1] 8 agencias en riesgo
[KPI 2] ARS 4.2M pendiente abierto
[KPI 3] ARS 9.8M transferido ultimo cierre
[KPI 4] 16 agencias cumplieron

[Panel principal: Prioridades de hoy]
1. Rosario Microcentro | Riesgo alto | Pendiente ARS 420k | 98% del tope
2. Venado Tuerto Sur   | Parcial     | Pendiente ARS 360k | 94% del tope
3. Santa Fe Centro     | No pago     | Pendiente ARS 345k | 101% del tope
4. ...
[CTA] Ver agencias prioritarias

[Panel secundario: Cierre actual]
Periodo visible: 17 mar - 19 mar
Total a deber: ARS 12.4M
Saldo remanente: ARS 2.1M
```

---

### Agencias prioritarias

**Objetivo**  
Presentar una lista accionable de agencias ya ordenada por prioridad para que el vendedor o prospecto entienda que el sistema reduce trabajo manual.

**Jerarquia**  
1. titulo con promesa de priorizacion  
2. chips de contexto del cierre  
3. tabla/lista priorizada  
4. CTA por fila  
5. filtros livianos

**Bloques**
- Header
  - titulo: `Agencias prioritarias`
  - subtitulo: `La red ya viene ordenada por urgencia comercial y accion recomendada.`
- Banda de contexto
  - fecha operativa
  - flota
  - cantidad de agencias priorizadas
- Tabla principal simplificada
  - columnas recomendadas:
    - agencia
    - riesgo
    - pendiente actual
    - estado del ultimo cobro
    - accion
- Panel lateral opcional solo en desktop
  - `Que significa prioridad`
  - regla simple: deuda abierta + cercania al tope + ultimo comportamiento de pago
- Estados vacios o filtros sin resultados con texto comercial, no tecnico

**CTA principal / secundarias**
- Principal por fila: `Ver detalle`
- Secundarias:
  - `Buscar agencia`
  - `Filtrar por flota`
  - `Volver a Inicio`

**Contenido secundario**
- chips de fecha y flota
- explicacion muy corta de la prioridad
- badge de estado: `Cumplio`, `Parcial`, `No pago`

**Low-fi textual**
```text
[Header]
Agencias prioritarias
La red ya viene ordenada por urgencia comercial y accion recomendada.

[Chips]
Fecha operativa: 19 mar
Flota: Todas
12 agencias priorizadas

[Tabla]
Agencia                | Riesgo      | Pendiente | Ultimo cobro | Accion
Rosario Microcentro    | Alto        | ARS 420k  | Parcial      | [Ver detalle]
Santa Fe Centro        | Critico     | ARS 345k  | No pago      | [Ver detalle]
Venado Tuerto Sur      | Alto        | ARS 360k  | Parcial      | [Ver detalle]
...

[Secundario]
Buscar agencia
Filtrar por flota
```

---

### Detalle de agencia

**Objetivo**  
Convertir la agencia seleccionada en una historia clara de problema + oportunidad + siguiente accion.

**Jerarquia**  
1. nombre de agencia y estado  
2. monto a resolver hoy  
3. riesgo y contexto del cierre  
4. CTA para registrar transferencia  
5. historial resumido

**Bloques**
- Header con breadcrumb
  - `Inicio / Agencias prioritarias / Detalle`
  - nombre de agencia
  - badges: riesgo, estado de cobro, flota
- Hero de detalle
  - card 1: `Pendiente hoy`
  - card 2: `Cercania al tope`
  - card 3: `Ultima transferencia`
- Bloque principal: `Lo que paso en este cierre`
  - pendiente anterior
  - nuevo corte
  - total a deber
  - transferido
- Bloque secundario: `Historial resumido`
  - ultimos 3 ciclos
  - ultimas 3 transferencias
- Bloque terciario plegable: `Ficha de agencia`
  - direccion, titular, contacto, porcentaje provincia

**CTA principal / secundarias**
- Principal: `Registrar transferencia`
- Secundarias:
  - `Volver a prioridades`
  - `Ver historial completo`

**Contenido secundario**
- datos fijos de agencia
- notas de transferencias previas
- explicacion de sobrepago como saldo a favor

**Low-fi textual**
```text
[Breadcrumb]
Inicio / Agencias prioritarias / Detalle

[Header]
Rosario Microcentro
[Badge] Riesgo alto   [Badge] Parcial   [Badge] Flota Corredor Sur

[Hero cards]
Pendiente hoy: ARS 420k
Cercania al tope: 98%
Ultima transferencia: ARS 210k | 16 mar

[Panel principal]
Lo que paso en este cierre
Pendiente anterior: ARS 110k
Nuevo corte: ARS 310k
Total a deber: ARS 420k
Transferido: ARS 0

[CTA] Registrar transferencia

[Historial resumido]
Ultimos ciclos
- 11-13 mar | Parcial | Pendiente ARS 95k
- 14-16 mar | Cumplio | Sin pendiente
- 17-19 mar | Parcial | Pendiente ARS 420k

[Seccion plegable]
Ficha de agencia
```

---

### Registrar transferencia

**Objetivo**  
Cerrar la demo mostrando una accion simple con impacto inmediato y sin friccion.

**Jerarquia**  
1. monto sugerido  
2. impacto proyectado  
3. campos minimos  
4. CTA confirmar  
5. notas opcionales

**Bloques**
- Header
  - `Registrar transferencia`
  - nombre de agencia
  - fecha operativa
- Resumen superior
  - pendiente anterior
  - nuevo corte
  - total a deber
  - saldo proyectado
- Formulario simple
  - fecha
  - monto
  - nota opcional
- Mensaje de impacto
  - si paga total: `La agencia queda al dia para este cierre`
  - si paga parcial: `Queda saldo pendiente`
  - si supera: `Se registra saldo a favor`
- Footer fijo de accion

**CTA principal / secundarias**
- Principal: `Confirmar transferencia`
- Secundarias:
  - `Usar monto sugerido`
  - `Cancelar`

**Contenido secundario**
- nota opcional
- advertencia de sobrepago
- texto corto de validacion

**Low-fi textual**
```text
[Header]
Registrar transferencia
Rosario Microcentro | Fecha operativa 19 mar

[Resumen]
Pendiente anterior: ARS 110k
Nuevo corte: ARS 310k
Total a deber sugerido: ARS 420k
Saldo proyectado: Queda al dia

[Formulario]
Fecha [19/03/2026]
Monto [420000]
[Boton] Usar monto sugerido
Nota opcional [Referencia bancaria o regularizacion]

[Mensaje de impacto]
Si confirmas este monto, la agencia queda sin pendiente en este cierre.

[CTA]
[Cancelar] [Confirmar transferencia]
```

---

## Transiciones del flujo

- `Inicio -> Agencias prioritarias`
  - mantener fecha/flota visibles como chips
  - la transicion debe sentirse como zoom hacia la lista de riesgo, no como cambio de modulo
- `Agencias prioritarias -> Detalle de agencia`
  - conservar nombre de agencia y badges para continuidad visual
  - idealmente abrir como pagina dedicada o side-panel grande, no modal chico
- `Detalle de agencia -> Registrar transferencia`
  - arrastrar contexto precargado: agencia, fecha, total a deber
  - el monto sugerido debe venir completo por defecto
- `Registrar transferencia -> confirmacion`
  - mostrar exito corto y volver al detalle con saldo actualizado
  - no mandar al usuario a una pantalla global de transferencias
- En todo el flujo, la navegacion debe reforzar progresion comercial:
  - ver riesgo
  - entender prioridad
  - profundizar caso
  - ejecutar accion

---

## Microcopy recomendado

### Titulos y subtitulos

- `Dashboards` -> `Inicio`
- `El corte de 3 dias pasa al centro` -> `La red que requiere accion, en una sola vista`
- `Listado operativo por fecha` -> `Agencias prioritarias`
- `Ficha completa con datos base...` -> `Contexto claro para decidir y actuar`
- `Nueva transferencia` -> `Registrar transferencia`

### CTAs

- `Ver detalle` mantener
- `Cargar transferencia` -> `Registrar transferencia`
- `Nueva transferencia` -> `Registrar transferencia`
- `Transferencias globales` -> `Carga masiva` o esconder del flujo demo
- `Ultimo dato` -> `Ver ultimo cierre`
- `Usar total a deber` -> `Usar monto sugerido`
- `Aplicar transferencias` -> `Confirmar transferencias`
- `Limpiar filtros` mantener
- `Volver al ultimo dato` -> `Volver al cierre actual`

### Labels de negocio

- `Saldo` -> `Pendiente actual`
- `Seguimiento` -> `Riesgo y estado`
- `Datos fijos` -> `Ficha de agencia`
- `Resumen de cobranza` -> `Lo que importa hoy`
- `Movimientos diarios` -> `Evolucion reciente`
- `Ciclos de 3 dias` -> `Ultimos cierres`
- `Total a deber` mantener
- `Saldo proyectado` mantener
- `Sobrepago` -> `Queda saldo a favor`

### Mensajes cortos

- `La red ya viene ordenada por urgencia comercial y accion recomendada.`
- `El monto sugerido resuelve el cierre actual.`
- `Si confirmas este monto, la agencia queda al dia.`
- `Esta agencia necesita intervencion hoy.`
- `El sistema prioriza donde actuar primero.`

---

## Cambios concretos sobre la UI actual

### Que mantener

- La base visual premium ya implementada en `src/index.css`.
- La tipografia y contrastes actuales.
- El patron de chips, tarjetas elevadas y metricas resumidas.
- El enfoque de contexto operativo dentro de cada pantalla, no en el navbar.
- La logica de calculo existente en `src/lib/business.ts`.
- El formulario individual de transferencia como base en `src/features/agencies/components/agency-transfer-dialog.tsx`.
- El detalle profundo de agencia como insumo, aunque deba simplificarse, en `src/features/agencies/components/agency-detail-dialog.tsx`.

### Que mover

- Llevar la lista `Top 10 mas cerca del tope` del dashboard a convertirse en el corazon de `Agencias prioritarias` desde `src/features/dashboard/dashboard-page.tsx` hacia `src/features/agencies/agencies-list-page.tsx`.
- Mover la explicacion del cierre y riesgo al bloque principal del Inicio, no dispersarla entre tarjetas y notas.
- Pasar los datos fijos de agencia a una zona plegable o de menor prioridad dentro del detalle en `src/features/agencies/components/agency-detail-dialog.tsx`.
- Mover el CTA de transferencia para que sea dominante arriba del detalle, no solo una accion mas del dialogo.
- Mantener `TemporalToolbar`, pero bajarlo de protagonismo o colapsarlo en modo demo desde `src/components/operations/temporal-toolbar.tsx`.

### Que ocultar o bajar de prioridad

- Ocultar del flujo demo la navegacion a `Transferencias globales` y `Configuracion` en `src/components/layout/app-shell.tsx`.
- Bajar de prioridad las tablas largas de movimientos diarios y ciclos completos; mostrar solo resumen o preview en `src/features/agencies/components/agency-detail-dialog.tsx`.
- Ocultar en demo la accion `Editar datos` de `src/features/agencies/agencies-list-page.tsx`.
- Bajar la complejidad de filtros y presets temporales; dejar visible solo fecha actual y un acceso secundario a cambiarla.
- Ocultar en Inicio el bloque `Provincia separada` como contenido principal; puede quedar fuera de la ruta comercial.
- Sacar del relato principal la pantalla `src/features/transfers/transfers-page.tsx`; dejarla como capacidad avanzada, no como parte del pitch.

### Que renombrar

- En `src/components/layout/app-shell.tsx`
  - `Dashboards` -> `Inicio`
  - `Transferencias globales` -> `Carga masiva` si se conserva
  - `Configuracion` -> esconder en demo o dejar como `Ajustes`
- En `src/features/dashboard/dashboard-page.tsx`
  - `Ultimas transferencias` -> `Actividad reciente`
  - `Provincia separada` -> `Resumen provincia` si sigue existiendo fuera del flujo
- En `src/features/agencies/agencies-list-page.tsx`
  - `Listado operativo por fecha` -> `Agencias prioritarias`
  - `Seguimiento` -> `Riesgo y estado`
  - `Cargar transferencia` -> `Registrar transferencia`
- En `src/features/agencies/components/agency-detail-dialog.tsx`
  - `Datos fijos` -> `Ficha de agencia`
  - `Resumen de cobranza` -> `Lo que importa hoy`
  - `Movimientos diarios` -> `Evolucion reciente`
  - `Ciclos de 3 dias` -> `Ultimos cierres`

### Que simplificar

- `Inicio`
  - pasar de dashboard analitico a portada comercial con 4 KPIs + top 5 prioridades + CTA
- `Agencias prioritarias`
  - reducir columnas a 5 maximo
  - ordenar por prioridad por defecto
  - hacer de `Ver detalle` la unica accion por fila
- `Detalle de agencia`
  - abrir con hero de decision, no con ficha administrativa
  - mostrar solo historial util para vender control
- `Registrar transferencia`
  - dejar solo fecha, monto y nota opcional
  - precargar monto sugerido
  - destacar impacto antes del submit
- `Navegacion`
  - para demo: `Inicio`, `Agencias prioritarias`
  - opcionales ocultos detras de modo avanzado

### Referencias de archivos actuales a tocar

- `src/components/layout/app-shell.tsx`
- `src/app/router.tsx`
- `src/features/dashboard/dashboard-page.tsx`
- `src/features/agencies/agencies-list-page.tsx`
- `src/features/agencies/components/agency-detail-dialog.tsx`
- `src/features/agencies/components/agency-transfer-dialog.tsx`
- `src/features/transfers/transfers-page.tsx`
- `src/components/operations/temporal-toolbar.tsx`
- `src/lib/business.ts`
- `src/lib/labels.ts`
- `src/index.css`

---

## Plan de implementacion en fases

### Fase 1 - Reencuadre demo y navegacion
- Renombrar la experiencia principal a `Inicio`.
- Reducir la navegacion a los destinos del flujo demo.
- Reposicionar el dashboard actual como portada comercial.
- Definir el orden fijo del recorrido.

### Fase 2 - Lista de agencias prioritarias
- Transformar `Agencias` en lista priorizada por riesgo.
- Reducir columnas y acciones.
- Llevar el ranking del dashboard a esta pantalla.
- Mantener busqueda y filtro de flota como secundarios.

### Fase 3 - Detalle orientado a decision
- Reestructurar el detalle para abrir con pendiente, riesgo, ultimo cobro y CTA.
- Plegar ficha administrativa e historial completo.
- Mantener historial resumido solo para reforzar confianza comercial.

### Fase 4 - Transferencia simple con impacto
- Simplificar el dialogo de transferencia individual.
- Precargar el monto sugerido.
- Hacer visible el saldo proyectado antes de confirmar.
- Confirmar y reflejar impacto de forma inmediata.

### Fase 5 - Pulido demo-first
- Ajustar microcopy comercial.
- Revisar tiempos de lectura por pantalla.
- Verificar desktop y mobile.
- Ensayar la narrativa de 60-90 segundos con datos mock.

---

## Checklist de validacion demo-first

- [ ] La pantalla inicial muestra riesgo, prioridad, accion e impacto en menos de 10 segundos.
- [ ] Existe una sola CTA principal por pantalla.
- [ ] La demo puede hacerse completa sin entrar en `Configuracion` ni `Transferencias globales`.
- [ ] `Inicio` lleva naturalmente a `Agencias prioritarias`.
- [ ] `Agencias prioritarias` ya viene ordenada, sin pedir trabajo manual al usuario.
- [ ] `Detalle de agencia` abre con lo urgente, no con datos administrativos.
- [ ] `Registrar transferencia` precarga monto sugerido y muestra saldo proyectado.
- [ ] El usuario entiende que el sistema recomienda donde actuar primero.
- [ ] El lenguaje visible es comercial y claro, no excesivamente operativo.
- [ ] No hay tablas o bloques que obliguen a explicar la UI antes del valor.
- [ ] La navegacion mobile sigue el mismo relato que desktop.
- [ ] El flujo completo cabe comodamente en una demo de 60-90 segundos.
- [ ] El estado posterior a registrar transferencia refuerza la promesa de impacto inmediato.
- [ ] Los elementos secundarios no compiten visualmente con la accion principal.
- [ ] La interfaz conserva la calidad visual premium ya presente en la base actual.

--- 

## Cierre

La UI actual ya tiene una base visual fuerte y una logica operativa solida. El rediseño demo-first no necesita rehacer el producto: necesita editar la narrativa. La clave es pasar de "mostrar todo lo que hace el sistema" a "mostrar con claridad por que conviene comprarlo".
