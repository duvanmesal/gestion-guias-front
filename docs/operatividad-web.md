# Operatividad Web - Cambios Documentados

Ultima revision contra codigo: 2026-05-04.

Fuente principal: `src/features/profile`, `src/features/turnos`, `src/features/*/components/*FormDialog.tsx`, `src/shared/components/glass`, `src/hooks/use-buques.ts` y `src/core/models/auth.ts`.

## Proposito

Este documento explica los cambios visibles recientes de la aplicacion web. Esta escrito para QA, demo, mantenimiento y alineacion con backend.

Los cambios cubren:

- manejo de sesiones especificas sin cerrar la sesion actual por accidente;
- listado de turnos para guia desde hoy hacia adelante;
- restricciones de lookup segun rol para evitar errores `403`;
- mejoras en formularios operativos y administrativos;
- nuevos componentes compartidos para fechas y combobox.

## Sesiones activas

Pantalla afectada: `Perfil > Sesiones`.

### Comportamiento esperado

- El listado muestra sesiones activas del usuario autenticado.
- Cada sesion indica plataforma `WEB` o `MOBILE`.
- La sesion actual se identifica con la etiqueta `Esta sesion`.
- El boton de eliminar queda deshabilitado para la sesion actual.
- Para cerrar la sesion actual se debe usar el flujo normal de logout.
- Para cerrar todas las sesiones se usa `Cerrar todas`, que solicita codigo de 6 digitos por correo.
- Para cerrar una sesion especifica no actual, se usa el boton de eliminar de esa tarjeta.

### Razon funcional

El usuario debe poder cerrar una sesion mobile desde web sin perder su sesion web. Esto diferencia tres acciones:

| Accion en UI | Resultado |
| --- | --- |
| Logout normal | Cierra la sesion actual. |
| Eliminar una tarjeta de sesion no actual | Cierra solo esa sesion. |
| Cerrar todas | Cierra web, mobile y cualquier otra sesion activa tras confirmar codigo. |

### Errores esperados

- Si se intenta cerrar la sesion actual desde la tarjeta, la UI informa: `Usa cerrar sesion para terminar la sesion actual`.
- Si el codigo de cierre total no tiene 6 digitos, se bloquea la confirmacion.
- Si el backend rechaza una revocacion, React Query deja el error en la mutacion y el handler global puede mostrar toast.

## Turnero web

Pantalla afectada: `Turnos`.

### Modo supervisor o super admin

Para `SUPER_ADMIN` y `SUPERVISOR`, la pantalla usa el listado global de turnos y permite filtros por:

- estado;
- atencion;
- guia;
- buque;
- campo temporal (`overlap`, `createdAt`, `checkInAt`, `checkOutAt`, `canceledAt`);
- fecha desde;
- fecha hasta.

Los filtros de atenciones, guias y buques solo se cargan en modo supervisor/super admin.

### Modo guia

Para `GUIA`, la pantalla cambia a "Mis turnos asignados" y fuerza `mode: "me"` en `useTurnos`.

Regla visible:

- Si el guia no selecciona fechas, la UI consulta desde la fecha actual hacia adelante.
- Esto permite que el proximo turno visible en dashboard tambien aparezca en la pantalla de turnos.
- El lookup de buques no se ejecuta para `GUIA`, porque el endpoint `/buques/lookup` no esta autorizado para ese rol.

### Errores evitados

- Antes, un guia podia ver `403 Forbidden` en consola por `GET /buques/lookup`.
- Antes, un turno futuro podia aparecer como proximo turno en dashboard pero no en "Mis turnos asignados" porque el backend filtra `/turnos/me` por el dia actual cuando no recibe fechas.

### Estados vacios

- Si no hay turnos y existen filtros activos, la UI recomienda ajustar filtros.
- Si el usuario es guia y no hay resultados, la UI muestra que aun no tiene turnos asignados.
- Si el usuario es supervisor y no hay turnos, la UI recuerda que los turnos se crean automaticamente al crear atenciones.

## Formularios y validaciones visibles

Los formularios recientes usan validacion local antes de enviar al backend. Esto reduce llamadas invalidas y hace que los errores sean mas inmediatos.

### Recaladas

Formulario afectado: `RecaladaFormDialog`.

Campos clave:

- buque;
- pais de origen;
- fecha/hora de llegada;
- fecha/hora de salida;
- terminal;
- muelle;
- pasajeros estimados;
- tripulacion estimada;
- fuente;
- observaciones.

Validaciones visibles:

- buque obligatorio;
- pais de origen obligatorio;
- fecha de llegada obligatoria;
- fecha de salida posterior a llegada cuando se informe;
- pasajeros estimados numericos y no negativos;
- tripulacion estimada numerica y no negativa.

La seleccion de buque y pais usa `SearchableCombobox`; las fechas usan `GlassDateTimeInput`.

### Atenciones

Formulario afectado: `AtencionFormDialog`.

Campos clave:

- fecha/hora de inicio;
- fecha/hora de fin;
- turnos total;
- descripcion.

Validaciones visibles:

- fecha/hora de inicio obligatoria;
- fecha/hora de fin obligatoria;
- fin posterior a inicio;
- turnos total numerico y minimo 1.

La UI informa que se crearan automaticamente tantos turnos como indique `turnosTotal`.

### Paises

Formulario afectado: `PaisFormDialog`.

Validaciones visibles:

- codigo obligatorio;
- codigo entre 2 y 10 caracteres;
- nombre obligatorio;
- estado seleccionable con combobox.

### Buques

Formulario afectado: `BuqueFormDialog`.

Validaciones visibles:

- codigo obligatorio;
- codigo minimo 2 y maximo 20 caracteres;
- nombre obligatorio;
- capacidad numerica;
- capacidad mayor que 0;
- pais seleccionable por combobox;
- estado seleccionable por combobox.

### Usuarios

Formulario afectado: `UserFormDialog`.

Cambios visibles:

- rol se selecciona con combobox no buscable;
- estado activo/inactivo se selecciona con combobox en edicion;
- se mantienen validaciones de email, nombres, apellidos, rol y password inicial;
- el password inicial muestra ayuda sobre politica minima.

### Invitaciones

Pantalla afectada: `InvitationsPage`.

Cambios visibles:

- busqueda por email con validacion de campo vacio;
- reenvio por email con validacion de campo vacio;
- normalizacion defensiva del listado para aceptar respuestas directas o envueltas;
- rol de invitacion seleccionable con combobox.

## Componentes compartidos

### `SearchableCombobox`

Componente compartido para selects con apariencia glass.

Capacidades:

- renderiza el dropdown en portal sobre `document.body`;
- reposiciona el dropdown al hacer scroll o resize;
- soporta busqueda opcional;
- soporta modo no buscable para enums pequeños;
- permite limpiar seleccion cuando hay valor;
- soporta teclado: `Enter`, espacio, flechas y `Escape`;
- muestra error y helper text;
- evita que dropdowns se corten dentro de modales o contenedores con overflow.

Usos actuales:

- filtros de catalogos;
- filtros del turnero;
- seleccion de buque y pais en recaladas;
- seleccion de pais y estado en buques;
- seleccion de estado en paises;
- seleccion de rol y estado en usuarios;
- seleccion de rol en invitaciones.

### `GlassDateTimeInput`

Componente compartido para fechas y fecha/hora.

Capacidades:

- soporta `type="date"` y `type="datetime-local"`;
- renderiza calendario en portal;
- muestra mes y año navegables;
- permite seleccionar "Hoy";
- permite borrar valor;
- en `datetime-local` permite editar horas y minutos;
- formatea valores en espanol para lectura humana;
- mantiene salida compatible con inputs HTML: `YYYY-MM-DD` o `YYYY-MM-DDTHH:mm`.

Usos actuales:

- fechas de recaladas;
- fechas de atenciones;
- filtros de fecha en turnos.

## Hooks y datos por rol

### `useBuquesLookup`

El hook acepta `enabled`.

Uso esperado:

- `enabled: true` cuando la pantalla pertenece a `SUPER_ADMIN` o `SUPERVISOR`.
- `enabled: false` para `GUIA` en pantallas donde el lookup no es necesario.

Motivo:

- `/buques/lookup` es un endpoint autorizado para `SUPER_ADMIN` y `SUPERVISOR`.
- Evitar la llamada en modo guia previene errores `403` en consola y ruido en la experiencia.

### `useTurnos`

La pantalla de turnos decide el modo:

- `mode: "all"` para supervisor/super admin;
- `mode: "me"` para guia.

En modo guia, la pantalla pasa `dateFrom` con la fecha actual si el usuario no selecciono rango. Esto complementa el comportamiento del backend, que por defecto filtra el listado por el dia actual.

## Matriz de QA manual

| Escenario | Resultado esperado |
| --- | --- |
| Guia entra a Turnos con un turno futuro asignado | El turno aparece sin tener que seleccionar fecha manualmente. |
| Guia entra a Turnos | No se dispara `GET /buques/lookup`; no hay `403` por buques. |
| Supervisor entra a Turnos | Puede filtrar por atencion, guia, buque, estado y fechas. |
| Web revoca sesion mobile | Web sigue activa; mobile debe salir cuando intente usar/renovar sesion. |
| Web intenta cerrar su propia tarjeta de sesion | Boton deshabilitado y/o toast informativo. |
| Web usa Cerrar todas | Pide codigo de 6 digitos y cierra todas al confirmar. |
| Crear recalada sin buque | Error local en campo buque. |
| Crear recalada con salida antes de llegada | Error local en fecha de salida. |
| Crear atencion con fin antes de inicio | Error local en fecha de fin. |
| Crear buque con capacidad 0 | Error local de capacidad. |
| Seleccionar fecha dentro de modal | Calendario se muestra por encima del modal sin recortarse. |
| Abrir combobox dentro de modal | Dropdown se muestra por encima del contenedor sin recortarse. |

## Notas de mantenimiento

- Los componentes con portal dependen de `document`; por eso renderizan el portal solo cuando `document` existe.
- Los formularios mantienen validacion local, pero el backend sigue siendo la fuente final de reglas de negocio.
- Cuando se agregue un nuevo enum visible, preferir `SearchableCombobox` con `searchable={false}`.
- Cuando se agregue un campo de fecha/hora en modal o toolbar, preferir `GlassDateTimeInput` para mantener consistencia visual.
- Si cambia el contrato de `GET /auth/sessions`, actualizar `Session` en `src/core/models/auth.ts` y este documento.
