# UX UI principles

## Intencion de producto

La experiencia debe sentirse como una herramienta de operador diario, sobria y premium, no como un dashboard generico de startup.

## Principios ya visibles en la UI

- Look blue tipo shadcn.
- Dark mode soportado.
- Jerarquia tipografica clara para dinero, cortes y estados.
- Toolbars, chips y resumenes antes que tablas infladas.
- Dialogos para profundizar o ejecutar acciones sin romper el contexto de pagina.
- Navbar liviano; el contexto operativo fuerte vive en cada pantalla, no en header global.
- Mobile con drawer claro y acciones de sesion dentro del mismo flujo.

## Direccion visual actual

Lo implementado en `src/index.css` ya marca una linea bastante clara:

- fondos con gradientes y capas suaves, no fondo plano
- paleta azul sobria con estados success/warning/destructive
- `Instrument Sans` para texto y `Manrope` para headings
- paneles elevados y bordes suaves
- contraste fuerte en KPIs y montos

## Patron de uso esperado

El operador deberia poder responder rapido:

- que paso en el corte visible
- que agencias siguen abiertas
- cuanto se debia transferir
- cuanto se transfirio realmente
- quien quedo pendiente o con saldo a favor

## Reglas de UX que no hay que romper

- No volver a tablas gigantes llenas de columnas secundarias.
- No volver a un navbar recargado con metricas o resumenes operativos.
- No esconder el estado de cobro del ultimo corte.
- No separar en exceso datos que se leen juntos; por eso flota/codigo viven dentro de la celda principal.
- No mezclar `% provincia` con el saldo operativo de agencias.
- No romper el patron temporal compartido entre pantallas.
- No bloquear el sobrepago; se avisa, pero se permite.

## Decision importante sobre detalle vs vista principal

- Vista principal: lectura rapida y accion.
- Dialogo/detalle: contexto historico y profundidad.

Eso ya esta bien encaminado en `Dashboard`, `Agencias` y `Transferencias globales`. Mantenerlo.

## Criterio para cambios futuros

Antes de agregar UI, preguntarse:

1. Esto ayuda a operar hoy o solo agrega densidad visual.
2. Esto pertenece a tabla principal o a resumen/dialogo.
3. Esto cambia el flujo de agencias o en realidad pertenece al bloque provincia.
