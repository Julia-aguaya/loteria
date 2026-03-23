# Guía de uso — Demo Loteria

Esta guía explica paso a paso cómo usar cada sección del sistema. Los datos que aparecen son de demostración y están precargados: no se conecta a ninguna base de datos real ni se envía información a ningún lado.

---

## Acceso al sistema

Al abrir la aplicación se muestra la pantalla de ingreso. Las credenciales ya vienen escritas.

| Campo    | Valor               |
|----------|---------------------|
| Usuario  | demo@loteria.app    |
| Clave    | loteria-2026        |

Presionar **Entrar al Módulo 1** para ingresar. Si el navegador ya tenía una sesión guardada, entra directo al panel principal.

> Para salir, usar el botón **Cerrar sesión** al pie de la barra lateral izquierda.

---

## Navegación general

La barra lateral izquierda (en pantallas grandes) tiene tres secciones principales y dos secundarias:

| Sección           | Para qué sirve                                              |
|-------------------|-------------------------------------------------------------|
| **Inicio**        | Resumen rápido: quién debe y quién está cerca del tope      |
| **Periodos**      | Ver el detalle operativo por bloque de días                 |
| **Agencias**      | Listado completo de agencias, cobro y ficha de cada una     |
| Carga múltiple    | Registrar transferencias individuales o en lote             |
| Configuración     | Parámetros de provincia y visualización por flota           |

En pantallas pequeñas la barra aparece al tocar el ícono de menú (☰) arriba a la derecha.

---

## Inicio

Es la pantalla que aparece al entrar. Muestra dos bloques:

### Agencias con deudas pendientes

Lista las agencias que todavía tienen saldo abierto en el período seleccionado, ordenadas de mayor a menor deuda. Cada fila muestra:

- **Número de orden** (prioridad de cobro)
- **Badge de estado**: `No pagó` (rojo), `Parcial` (amarillo), `Cumplió` (verde)
- Nombre de la agencia y flota
- Monto pendiente a cobrar

Usar **Ver listado** para ir al listado completo de agencias.

### Agencias cerca del tope

Muestra las agencias cuyas ventas se acercan al límite comercial asignado. El gráfico circular indica qué porcentaje del tope ya fue utilizado. Cuando supera el 100% aparece en rojo.

### Filtros del dashboard

Arriba a la derecha hay dos selectores:

- **Flota**: filtra para ver solo las agencias de una flota específica o todas.
- **Período**: permite ver el resumen de un corte anterior en lugar del más reciente.

---

## Periodos

Muestra la tabla operativa completa de un bloque de días (cada período cubre 3 días).

### Seleccionar un período

Usar el selector **Seleccionar período** (arriba a la derecha) para cambiar entre períodos cerrados. El más reciente viene seleccionado por defecto.

También se puede filtrar por **flota** para ver solo las agencias que correspondan.

### Barra de resumen del período

Debajo de los filtros aparece una barra con el nombre del período y tres datos rápidos:

| Dato               | Qué representa                                     |
|--------------------|----------------------------------------------------|
| **Ventas del período** | Total de tickets vendidos en los 3 días        |
| **Total cobrado**  | Suma de transferencias recibidas en ese bloque     |
| **Saldo pendiente** | Lo que todavía falta cobrar al cierre del período |

Los badges al costado del título muestran cuántas agencias no pagaron, cuántas pagaron parcialmente y cuántas cumplieron.

### Tabla operativa

Cada fila es una agencia. Las columnas son:

| Columna       | Qué muestra                                                       |
|---------------|-------------------------------------------------------------------|
| **Agencia**   | Nombre (truncado) y código                                        |
| **Anterior**  | Deuda arrastrada del período previo (en amarillo si hay)          |
| **Día 1/2/3** | Ventas de cada día. Si hubo cobro ese día aparece debajo en verde |
| **Ventas**    | Total de ventas consolidadas del período                          |
| **Cobrado**   | Total de transferencias recibidas                                 |
| **Saldo**     | Lo que quedó pendiente al cierre (amarillo) o sin deuda (—)       |
| **Estado**    | `Cumplió`, `Parcial` o `No pagó`                                  |

La última fila de la tabla es el **total** de todas las columnas numéricas.

Las agencias se ordenan por prioridad de cobro: primero las que no pagaron, luego las parciales, y al final las que cumplieron.

---

## Agencias

Listado operativo completo de todas las agencias.

### Buscar y filtrar

- **Buscar agencia**: escribir el nombre o código. El listado se actualiza en tiempo real. Usar la × para limpiar la búsqueda.
- **Filtrar por flota**: seleccionar una flota del desplegable para ver solo sus agencias.
- **Limpiar filtros**: aparece un botón cuando hay algún filtro activo.
- **Período**: el selector de arriba a la derecha determina qué corte se está visualizando.

La barra de resumen muestra cuántas agencias son visibles, cuántas tienen deuda y el monto total pendiente.

### Filas del listado

Cada fila muestra:
- Número de prioridad
- Badge de estado del último corte
- Badge de uso de tope (si supera el 85%)
- Nombre, código y flota
- Monto **pendiente** actual
- Botón **Ver detalle**

### Detalle de agencia

Al presionar **Ver detalle** se abre un panel con toda la información de la agencia:

**Sección principal**
- Monto pendiente de cobro destacado
- Texto explicativo del estado (al día, cobro parcial, no pagó)
- Botón **Registrar transferencia** (acción principal)
- Tres datos: total a deber, cobrado hoy, margen al tope

**Últimos cierres**
- Comparación de los tres períodos más recientes
- Para cada uno: rango de fechas, cuánto debía, cuánto pagó y estado

**Ficha de agencia** (se expande al tocar)
- Flota, dirección, teléfono y titular

### Registrar una transferencia desde el detalle

1. Presionar **Registrar transferencia** dentro del detalle de la agencia.
2. Se abre el formulario de transferencia.
3. Verificar el **monto sugerido** (cubre el total a deber del período actual).
4. Se puede ajustar el monto manualmente o usar **Usar sugerido** para completarlo automáticamente.
5. Revisar la proyección: indica si al aplicar ese monto queda saldo pendiente, se cierra exacto o queda saldo a favor.
6. Ajustar la **fecha** si es necesario.
7. Agregar una **referencia o nota** (opcional).
8. Presionar **Confirmar transferencia**.

Después de confirmar se muestra la pantalla de éxito con el resultado. Presionar **Volver al detalle** para continuar.

---

## Carga múltiple

Permite registrar transferencias: una por una para cada agencia, o varias a la vez en lote.

### Parte superior: herramientas de período

El bloque **temporal** permite elegir la fecha de referencia para las transferencias. Los botones **Período anterior** y **Período siguiente** desplazan la ventana. También se puede cambiar el preset (Hoy, Ayer, Último corte, etc.) o ingresar un rango de fechas personalizado.

### Listado de agencias

Muestra todas las agencias con:
- Checkbox de selección para la carga en lote
- Badge de estado (con pendiente / al día)
- Nombre, código y flota
- Total a deber
- Botón **Registrar** para abrir el formulario individual

#### Registrar una transferencia individual

Mismo flujo que desde el detalle de agencia (ver sección anterior).

### Carga múltiple (lote)

Permite aplicar transferencias a varias agencias en una sola operación.

**Paso 1 — Seleccionar agencias**

Marcar el checkbox de cada agencia que se quiera incluir. También se puede usar:
- **Seleccionar visibles**: marca todas las agencias que aparecen en ese momento (respeta el filtro activo).
- **Quitar visibles**: desmarca las que están visibles.
- **Limpiar selección**: quita todas las marcas.
- **Completar saldos**: rellena automáticamente el monto sugerido para todas las seleccionadas.

La columna derecha muestra un resumen: cuántas están seleccionadas y los totales acumulados.

**Paso 2 — Abrir el modal**

Presionar **Abrir carga múltiple**. Se abre una ventana con todas las agencias seleccionadas.

**Paso 3 — Completar en el modal**

- **Fecha**: se puede cambiar para todas las transferencias del lote.
- **Nota (opcional)**: referencia compartida para todo el lote.
- **Completar todos**: rellena los montos con el total a deber de cada agencia.
- **Limpiar**: borra todos los montos ingresados.

Por cada agencia aparece su nombre, el total a deber y un campo para ingresar el monto.

El pie del modal muestra en tiempo real cuántas agencias tienen monto válido y el total a aplicar.

**Paso 4 — Aplicar**

Presionar **Aplicar X transferencias**. El botón se activa solo cuando todos los montos son válidos. Las transferencias se registran y el modal se cierra.

### Últimas transferencias

Al final de la página hay una tabla con el historial reciente de transferencias del período visible: agencia, fecha, monto y referencia.

---

## Configuración

Acceso secundario con parámetros base de la demo.

### Parámetros globales

- **Provincia de referencia**: nombre de la provincia que se muestra en los reportes.
- **Porcentaje provincial base**: porcentaje aplicado globalmente a todas las agencias (se puede sobreescribir por agencia desde el detalle).
- **Persistencia local de sesión**: cuando está activado, el sistema recuerda el acceso en este navegador aunque se cierre la pestaña.

Presionar **Guardar parámetros base** para aplicar los cambios.

### Impacto actual por flota

Muestra el resumen de agencias, saldo pendiente y deuda a provincia agrupado por cada flota.

---

## Conceptos clave

| Término           | Significado                                                                                         |
|-------------------|-----------------------------------------------------------------------------------------------------|
| **Período / Corte** | Bloque de 3 días consecutivos. Es la unidad de cobro del sistema.                                |
| **Deuda anterior** | Saldo que arrastra del período previo sin haber sido cobrado.                                      |
| **Total a deber** | Deuda anterior + ventas del período actual. Es lo que corresponde cobrar en este bloque.            |
| **Cobrado**        | Suma de transferencias recibidas aplicadas al período.                                              |
| **Saldo al cierre** | Lo que queda pendiente después de aplicar los cobros. Si es cero o negativo, la agencia cumplió. |
| **Saldo a favor**  | Cuando se cobró más de lo que correspondía, el excedente queda como crédito para el siguiente período. |
| **Tope comercial** | Límite máximo de ventas que se le permite a una agencia por período. Cuando se acerca o supera, aparece en la sección de alertas. |
| **Cumplio**        | La agencia pagó el total correspondiente al período.                                               |
| **Parcial**        | La agencia pagó algo, pero no cubrió el total a deber.                                             |
| **No pagó**        | No se recibió ninguna transferencia en el período.                                                 |

---

## Datos de la demo

Todos los datos son ficticios y viven en la memoria del navegador. Al cerrar la pestaña y volver a abrirla los datos vuelven al estado inicial, salvo que la **Persistencia local de sesión** esté activada (que solo conserva la sesión, no los cambios en transferencias).

Las transferencias que se registren durante la sesión sí se reflejan en tiempo real en todas las pantallas: el saldo pendiente baja, el estado de la agencia puede cambiar de `No pagó` a `Parcial` o `Cumplió`, y los totales de la tabla de períodos se actualizan.
