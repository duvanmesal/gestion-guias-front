# Operatividad Web - Cambios Documentados

Ultima revision contra codigo: 2026-05-10.

Fuente principal: `src/features/profile`, `src/features/turnos`, `src/features/*/components/*FormDialog.tsx`, `src/shared/components/glass`, `src/hooks/use-buques.ts`, `src/core/models/auth.ts`, `src/shared/components/feedback/Toast.tsx`, `src/features/atenciones/components/GuiaDisponibilidadPanel.tsx` y `src/features/auth/LoginPage.tsx`.

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

## Correcciones de estabilidad (mayo 2026)

### Toast portal — crash removeChild al navegar

Fuente: `src/shared/components/feedback/Toast.tsx`.

**Problema**: cuando el usuario navegaba entre rutas mientras habia un toast visible, React lanzaba un error `NotFoundError: Failed to execute 'removeChild'` porque el contenedor del toast era un nodo hijo del componente de ruta que ya se habia desmontado.

**Solucion**: el contenedor `<div>` de los toasts se renderiza con `createPortal(…, document.body)` en lugar de como hijo directo del componente. Al vivir directamente bajo `document.body`, queda fuera del arbol de rutas y nunca queda huerfano.

Impacto: cualquier toast puede sobrevivir a una navegacion sin errores. La logica de duracion y cierre manual sigue funcionando igual.

### GuiaDisponibilidadPanel — guard de posicion cero

Fuente: `src/features/atenciones/components/GuiaDisponibilidadPanel.tsx`.

**Problema**: el panel usaba `{posicion && (...)}` para mostrar la posicion en cola. Cuando la posicion era `0` (guia en primera posicion), la condicion evaluaba a falso y el badge de posicion no aparecia.

**Solucion**: cambiado a `{posicion !== null && (...)}` para distinguir entre "sin dato" y "posicion cero".

Impacto: el badge de posicion ahora se muestra correctamente para el primer guia en la cola.

### LoginPage — autocompletado con gestores de contraseñas

Fuente: `src/features/auth/LoginPage.tsx`.

**Cambio**: se agregaron atributos de autocompletado al formulario de login para mejorar la compatibilidad con gestores de contraseñas (1Password, LastPass, Chrome, etc.):

- Campo email: `autoComplete="email"`.
- Campo password: `autoComplete="current-password"`, `data-lpignore="true"`, `data-1p-ignore="true"`.

Impacto: los gestores de contraseñas detectan correctamente el formulario y ofrecen autorellenado. Los atributos `data-*` previenen interferencias de extensiones especificas cuando el campo ya tiene foco.

---

## Alertas operativas accionables (Epica 7+)

Fuente: `src/hooks/use-global-realtime.ts`, `src/app/stores/alert-store.ts`,
`src/shared/components/layout/AlertCenter.tsx`,
`src/shared/components/feedback/Toast.tsx`,
`src/features/turnos/TurnosPage.tsx`, `src/features/atenciones/AtencionesPage.tsx`.

Cada evento realtime `notif:*` se convierte en una **alerta accionable**:

1. **Toast accionable.** `useGlobalRealtime` muestra un toast con título, cuerpo
   y un botón **Ver** que navega al contexto (`router.navigate(route)`). El
   `ToastProvider` admite un overload retrocompatible:
   `showToast(type, message, duration)` sigue funcionando y se añade
   `showToast(type, message, { id, title, action, cooldownMs, duration })`.
   - `cooldownMs` + `id` silencian repeticiones del mismo `notificationId`
     dentro de la ventana (job-driven: 5 min; dirigidas al usuario: 15 s).

2. **Bandeja (campana en el Topbar).** `AlertCenter` lista las últimas 50
   alertas de la **sesión** (en memoria, no persiste entre recargas). Muestra
   contador de no leídas, acción **Ver**, marcar como leída/todas y eliminar.
   Si el mismo `notificationId` llega de nuevo, sube al tope con contador `×N`.
   El **dashboard** sigue siendo la fuente de las alertas agregadas; la bandeja
   cubre los eventos recibidos en vivo.

3. **Normalización de rutas (evita 404).** Rutas de detalle válidas
   (`/recaladas/:id`, `/atenciones/:id`, `/turnos/:id`) pasan tal cual.
   `GUIDE_PENALIZED` (y cualquier `route` `/perfil*`, que sólo existe en mobile)
   se normaliza a `/profile`. Como respaldo se reconstruye desde los ids del
   payload.

### Filtros por query param activados desde alertas

Las páginas leen query params para que una alerta abra su contexto ya filtrado:

- **Turnos** (`/turnos`): `status`, `atencionId`, `guiaId`, `buqueId`,
  `dateFrom`, `dateTo` inicializan los filtros. `checkInPending=1` hace scroll y
  resalta la sección de check-ins pendientes (supervisor).
- **Atenciones** (`/atenciones`): `operationalStatus`, `recaladaId`, `from`,
  `to` y `pendingEval=1` (atenciones cerradas sin evaluar). Con `pendingEval` o
  `recaladaId` activos se muestra un banner con opción "Quitar filtro".

### Menos ruido

- `useTurnoSocket` admite `notify: false`: mantiene la invalidación de cache
  pero no dispara toasts, para evitar duplicados cuando los `notif:*` ya cubren
  el aviso visible accionable.
- Las alertas automáticas del job (recalada vencida, atención próxima con turnos
  libres) llegan por socket como máximo cada 30 min por `notificationId`
  (cooldown server-side, ver `gestionguias-api/docs/realtime.md`).

## Matriz de QA manual

| Escenario | Resultado esperado |
| --- | --- |
| Llega `notif:recalada:overdue` | Toast con botón **Ver**; navega a `/recaladas/{id}`. |
| Misma alerta repetida dentro del cooldown | No se repite el toast; la bandeja sube la entrada con contador `×N`. |
| Abrir la campana del Topbar | Lista de alertas de la sesión; marcar leída/eliminar/limpiar funciona. |
| Abrir `/turnos?checkInPending=1` | Hace scroll y resalta la sección de check-ins pendientes. |
| Abrir `/atenciones?pendingEval=1` | Muestra atenciones cerradas sin evaluación y banner para quitar el filtro. |
| Alerta `GUIDE_PENALIZED` | El botón **Ver** navega a `/profile`, no a `/perfil/penalizaciones`. |
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
| Toast visible al navegar entre rutas | No se produce error `removeChild`; el toast desaparece normalmente por duracion. |
| Guia en posicion 0 de la cola de disponibilidad | El badge de posicion muestra "Posicion: 1" (o el valor correcto) sin desaparecer. |
| Abrir login con gestor de contraseñas activo | El gestor detecta los campos y ofrece autorellenado sin conflictos. |

## Notas de mantenimiento

- Los componentes con portal dependen de `document`; por eso renderizan el portal solo cuando `document` existe.
- Los formularios mantienen validacion local, pero el backend sigue siendo la fuente final de reglas de negocio.
- Cuando se agregue un nuevo enum visible, preferir `SearchableCombobox` con `searchable={false}`.
- Cuando se agregue un campo de fecha/hora en modal o toolbar, preferir `GlassDateTimeInput` para mantener consistencia visual.
- Si cambia el contrato de `GET /auth/sessions`, actualizar `Session` en `src/core/models/auth.ts` y este documento.
- Si se agrega un nuevo componente con contenedor flotante (dropdown, modal, tooltip), evaluar si necesita portal para evitar el mismo patron de recorte o crash que el toast.
