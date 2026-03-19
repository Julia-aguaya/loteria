# Agent handoff

## Objetivo

Este paquete resume el contexto operativo, funcional y de frontend del proyecto `Loteria` para que otro agente pueda retomar trabajo sin rehidratar toda la conversacion.

## Como leer este paquete

1. Empezar por `docs/agent-handoff/project-context.md`.
2. Seguir con `docs/agent-handoff/business-model.md` y `docs/agent-handoff/temporal-model.md`.
3. Revisar `docs/agent-handoff/frontend-architecture.md` para entender el estado real del frontend.
4. Leer `docs/agent-handoff/ux-ui-principles.md` antes de tocar interfaz.
5. Cerrar con `docs/agent-handoff/open-questions.md` y `docs/agent-handoff/new-agent-guide.md`.

## Archivos

- `docs/agent-handoff/project-context.md`: panorama general, alcance actual y estado consolidado.
- `docs/agent-handoff/business-model.md`: reglas de negocio, logica de saldo, transferencias y provincia.
- `docs/agent-handoff/frontend-architecture.md`: estructura frontend, paginas, store, librerias y flujo de pantalla.
- `docs/agent-handoff/ux-ui-principles.md`: decisiones de UX/UI y criterios de producto para no degradar la experiencia.
- `docs/agent-handoff/temporal-model.md`: patron temporal compartido, presets y significado de los cortes.
- `docs/agent-handoff/open-questions.md`: pendientes abiertos y temas que no deben cerrarse inventando.
- `docs/agent-handoff/new-agent-guide.md`: guia corta de entrada, archivos clave y cosas que no hay que romper.

## Nota editorial

- Este paquete prioriza el estado actual implementado en frontend y el contexto funcional consolidado pedido para el producto.
- Si alguna definicion historica entra en conflicto con este paquete, validar primero contra el codigo actual en `src/` y contra las preguntas abiertas documentadas.
- `docs/lotovibe-source-of-truth.md` existe como antecedente historico, pero no refleja por completo el modelo operativo visible actual.
