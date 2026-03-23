# Guia de uso actual de Loteria

## Descripcion general del sistema

Loteria es una aplicacion frontend demo para seguimiento operativo y administrativo de agencias. Su foco actual esta en:

- consultar ventas consolidadas por cortes de 3 dias;
- revisar deuda, cumplimiento y cercania al tope comercial por agencia;
- registrar transferencias individuales o en lote;
- visualizar el impacto inmediato de esas transferencias en todas las pantallas;
- ajustar parametros base de provincia y persistencia de sesion.

Estado actual del sistema:

- funciona con datos demo locales;
- no depende de un backend visible en este proyecto;
- usa una sesion autenticada simple con credenciales demo;
- recalcula metricas y cortes en tiempo real cuando se registra una transferencia.

La base demo actual esta organizada en:

- 24 agencias;
- 2 flotas: `Flota Litoral Norte` y `Flota Corredor Sur`;
- cortes de consolidacion de `3 dias`.

---

## Acceso al sistema

## Inicio de sesion

Al abrir la aplicacion, se presenta la pantalla de login.

### Credenciales demo actuales

- **Usuario:** `demo@loteria.app`
- **Clave:** `loteria-2026`

### Como ingresar

1. Abrir la pantalla de acceso.
2. Verificar o dejar precargados el usuario y la clave.
3. Presionar **Entrar al Modulo 1** o usar `Enter`.

### Comportamiento del acceso

- Si las credenciales son correctas, el sistema redirige al panel principal.
- Si son incorrectas, muestra un mensaje de error.
- Si la opcion **Persistencia local de sesion** esta activada, la sesion puede recuperarse en el mismo navegador.

### Cierre de sesion

Desde el menu lateral o el menu movil se puede usar **Cerrar sesion**.

---

## Navegacion principal

La aplicacion esta organizada en cinco areas:

| Seccion | Funcion |
|---|---|
| **Inicio** | Resumen rapido del corte y priorizacion operativa |
| **Periodos** | Vista consolidada por corte de 3 dias |
| **Agencias** | Listado operativo, busqueda y detalle por agencia |
| **Carga multiple** | Registro de transferencias individuales y por lote |
| **Configuracion** | Parametros globales de provincia y sesion |

## Estructura de navegacion

### Accesos principales
- **Inicio**
- **Periodos**
- **Agencias**

### Accesos secundarios
- **Carga multiple**
- **Configuracion**

En escritorio, los accesos secundarios aparecen en un bloque separado del menu lateral.  
En movil, todos se abren desde el menu principal.

---

## Uso de Inicio

La pantalla **Inicio** sirve para lectura rapida del ultimo corte cerrado o del periodo seleccionado.

## Filtros disponibles

### Flota
Permite elegir:

- todas las flotas;
- una flota especifica.

### Periodo
Permite seleccionar uno de los cortes cerrados disponibles.

## Que muestra

### Tarjeta principal del corte
Resume el periodo elegido y muestra:

- estado general del corte;
- cantidad de agencias con deuda;
- cantidad de agencias cerca del tope;
- accesos rapidos a **Agencias** y **Registrar transferencia**.

### Indicadores resumidos
Muestra:

- **Pendiente total**
- **Agencias visibles**
- **Ventas del corte**
- **Cerca del tope**

### Agencias con deudas pendientes
Lista priorizada de agencias con saldo abierto.

### Agencias cerca del tope
Lista priorizada de agencias con mayor uso de cap. Si el uso supera 100%, la agencia aparece como excedida.

## Uso recomendado

- usar esta pantalla para detectar rapidamente prioridades de cobro;
- filtrar por flota cuando se quiera una lectura regional;
- saltar desde aqui a **Agencias** o **Carga multiple** para operar.

---

## Uso de Cortes/Periodos

La seccion **Periodos** muestra el detalle operativo consolidado de cada corte cerrado.

## Filtros disponibles

### Seleccionar periodo
Permite elegir un corte cerrado especifico.

### Filtrar por flota
Permite ver:

- todas las flotas;
- una flota puntual.

## Resumen superior del periodo

Cuando hay un periodo seleccionado, se muestra:

- rango de fechas del corte;
- cantidad de agencias incluidas;
- cantidad de agencias:
  - sin pago,
  - con pago parcial,
  - que cumplieron;
- **Ventas del periodo**;
- **Total cobrado**;
- **Saldo pendiente**.

## Tabla operativa del periodo

La tabla muestra, por agencia:

- **Agencia**
- **Anterior**: saldo pendiente arrastrado del corte previo
- **Dia 1, Dia 2, Dia 3**:
  - ventas del dia;
  - y, si existe, transferencia aplicada ese dia
- **Ventas**: total consolidado del corte
- **Cobrado**: total de transferencias del corte
- **Saldo**:
  - pendiente restante, o
  - saldo a favor si hubo excedente
- **Estado**:
  - `No pago`
  - `Parcial`
  - `Cumplio`

## Totales al pie

El pie de la tabla consolida los totales del periodo completo.

## Comportamiento actual importante

- la pantalla no abre un detalle separado del periodo;
- las rutas con detalle de periodo redirigen de nuevo a la misma vista de **Periodos** usando el periodo como filtro;
- los cortes se forman automaticamente cada 3 dias segun la configuracion actual.

---

## Uso de Agencias

La seccion **Agencias** es el listado operativo principal para busqueda, priorizacion y acceso al detalle.

## Controles disponibles

### Periodo
Permite elegir el corte que se usara como referencia para la lectura.

### Buscar agencia
Busca por:

- nombre;
- codigo;
- flota.

### Filtrar por flota
Permite restringir el listado a una sola flota.

### Limpiar filtros
Aparece cuando hay busqueda o flota aplicada.

## Que muestra cada tarjeta de agencia

Cada agencia puede mostrar:

- posicion de prioridad;
- estado del ultimo corte:
  - `Cumplio`
  - `Parcial`
  - `No pago`
- alerta por uso del tope, si aplica;
- nivel de riesgo:
  - `Estable`
  - `Riesgo medio`
  - `Riesgo alto`
- nombre;
- codigo;
- flota;
- saldo pendiente actual;
- boton **Ver detalle**.

## Orden del listado

El sistema prioriza automaticamente:

1. agencias con mayor nivel de riesgo;
2. agencias con mayor saldo pendiente;
3. agencias con mayor uso de cap;
4. agencias con mayor total adeudado del ultimo corte.

## Uso recomendado

- usar busqueda para ubicar una agencia puntual;
- usar flota para revisar una zona operativa;
- abrir **Ver detalle** para cobrar o validar situacion reciente.

---

## Uso de detalle de agencia

El detalle de agencia se abre en un dialogo modal desde el boton **Ver detalle**.

## Que muestra el dialogo

### Encabezado
- estado del ultimo corte;
- nivel de riesgo;
- flota;
- nombre de la agencia.

### Bloque principal
- **Pendiente de cobro**
- texto de situacion operativa
- boton **Registrar transferencia**

### Indicadores rapidos
- **Total a deber**
- **Cobrado hoy**
- **Margen al tope**

### Ultimos cierres
Muestra hasta los 3 cortes mas recientes con:

- rango del corte;
- total adeudado;
- total pagado;
- estado del cierre.

### Ficha de agencia
En una seccion expandible se muestran:

- flota;
- direccion;
- telefono;
- titular.

## Accion principal disponible

Desde este detalle solo esta expuesta una accion operativa:

- **Registrar transferencia**

## Limitacion actual del detalle

Aunque existe logica de edicion en el proyecto, actualmente no hay una accion visible en esta pantalla para editar topes, porcentaje o estado de la agencia desde la interfaz principal.

---

## Registro de transferencias

Actualmente se pueden registrar transferencias de dos formas:

1. **individual**, desde detalle de agencia o desde la pantalla de carga multiple;
2. **multiple**, desde la seccion **Carga multiple**.

## Transferencia individual

### Donde se inicia
- desde **Agencias > Ver detalle > Registrar transferencia**;
- o desde el boton **Registrar** de una agencia dentro de **Carga multiple**.

### Que muestra el dialogo
- flota;
- estado de pendiente;
- fecha;
- **monto sugerido**;
- desglose:
  - pendiente anterior,
  - nuevo corte,
  - total a deber;
- proyeccion del resultado del monto cargado.

### Campos
- **Fecha**
- **Monto**
- **Referencia o nota**

### Validaciones actuales
- el monto es obligatorio;
- el monto debe ser mayor a cero.

### Boton auxiliar
- **Usar sugerido**: completa el monto recomendado para cubrir el total a deber del corte actual.

### Confirmacion
Al confirmar:

- se registra la transferencia;
- se muestra un estado de exito;
- el sistema recalcula la situacion de la agencia.

### Comportamiento de saldo
Si el monto:

- es menor al total a deber, queda pendiente;
- es igual, la agencia queda al dia;
- es mayor, queda saldo a favor.

---

## Registro de transferencias multiples

La seccion **Carga multiple** concentra la operacion por lote.

## Herramientas temporales

La pantalla permite cambiar la ventana de lectura con:

- **Hoy**
- **Ayer**
- **Ultimo corte**
- **Ultimos 7 dias**
- **Mes actual**
- rango personalizado

Tambien permite:

- **Periodo anterior**
- **Periodo siguiente**
- elegir fechas manualmente
- usar solo el cierre activo

## Contexto del corte

Debajo del selector temporal se muestra una tarjeta con:

- corte activo de 3 dias;
- fecha visible;
- dias visibles dentro del corte;
- fecha de cierre;
- visibilidad de Dia 1, Dia 2 y Dia 3.

## Listado de agencias

Cada fila permite:

- seleccionar la agencia con checkbox;
- ver si tiene pendiente o esta al dia;
- consultar el total a deber;
- abrir el flujo individual con **Registrar**.

## Panel lateral de carga multiple

Resume:

- cantidad de agencias seleccionadas;
- pendiente anterior total;
- nuevo corte total;
- total a deber;
- monto listo para aplicar.

Tambien incluye acciones:

- **Seleccionar visibles / Quitar visibles**
- **Limpiar seleccion**
- **Completar saldos**
- **Abrir carga multiple**

## Modal de carga multiple

Al abrir el modal se pueden cargar varias transferencias juntas.

### Campos generales del modal
- **Fecha** comun para el lote
- **Nota (opcional)** comun para el lote

### Acciones auxiliares
- **Completar todos**: completa cada agencia con su total a deber
- **Limpiar**: vacia los montos cargados

### Por cada agencia seleccionada
Se muestra:

- nombre;
- flota;
- total a deber;
- campo de monto individual.

### Validaciones
- cada monto debe ser valido;
- cada monto debe ser mayor a cero;
- el boton final se desactiva si alguna agencia tiene error o no tiene monto.

### Confirmacion final
El boton muestra cuantas transferencias se aplicaran.  
Al confirmar:

- se registran todas las transferencias;
- se cierra el modal;
- aparece un mensaje de exito;
- el historial y las metricas se actualizan al instante.

## Ultimas transferencias

Al final de la pagina se ve una tabla con los ultimos movimientos del rango visible:

- agencia;
- fecha;
- monto;
- referencia.

---

## Configuracion

La seccion **Configuracion** permite ajustar parametros base del modulo.

## Parametros globales disponibles

### Provincia de referencia
Campo editable de texto.

### Porcentaje provincial base
Campo numerico editable.

### Persistencia local de sesion
Interruptor para conservar o no la sesion demo en este navegador.

## Validaciones actuales

### Porcentaje provincial
- debe ser un numero valido;
- debe estar entre `0` y `100`.

## Guardado

Al presionar **Guardar parametros base** se actualizan:

- nombre de provincia;
- porcentaje provincial global.

Ademas, el sistema recalcula el impacto sobre la base actual.

## Resumen visible en la pantalla

La seccion tambien muestra:

- provincia activa;
- porcentaje global;
- cantidad total de agencias;
- saldo pendiente total;
- deuda a provincia;
- impacto actual por flota.

## Alcance real de esta configuracion

- afecta lecturas y resumenes de la demo;
- no cambia la logica de cortes de 3 dias;
- la persistencia local aplica a la sesion, no a los datos operativos creados durante el uso.

---

## Recomendaciones de uso

- usar **Inicio** para detectar prioridades rapidas antes de operar;
- usar **Periodos** cuando se necesite revisar el cierre completo dia por dia;
- usar **Agencias** para buscar una agencia puntual y abrir su detalle;
- usar **Carga multiple** cuando se deban registrar varios pagos juntos;
- usar **Completar saldos** o **Usar sugerido** para acelerar la carga;
- revisar **Ultimas transferencias** despues de cada operacion para validar el registro;
- mantener activada la persistencia de sesion si el mismo operador trabaja siempre en el mismo navegador.

---

## Notas importantes o limitaciones actuales

- La aplicacion funciona con **datos demo locales**, no con una base persistente del negocio.
- Las transferencias registradas durante la sesion **si impactan en tiempo real** en Inicio, Periodos, Agencias y Carga multiple.
- Al recargar o reabrir la aplicacion, los datos operativos vuelven a su estado inicial demo.
- La opcion **Persistencia local de sesion** solo conserva la sesion iniciada; **no conserva transferencias ni cambios operativos**.
- Los cortes actuales se consolidan cada **3 dias**.
- No existe actualmente una pantalla independiente de detalle de periodo; las rutas de detalle redirigen a la vista general de **Periodos**.
- No hay flujo visible en la UI para alta o baja de agencias.
- No hay accion visible actual para editar una agencia desde el listado o el detalle, aunque exista logica relacionada en el codigo.
- No se observa en la interfaz actual carga real de PDF ni automatizaciones externas operativas.
- El sistema usa una unica autenticacion demo simple, sin gestion de usuarios reales ni roles.
