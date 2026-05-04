# Documentacion funcional del front web

Ultima revision contra codigo: 2026-05-04.

Esta carpeta documenta comportamiento visible de la aplicacion web administrativa y de supervision. No reemplaza la documentacion de contrato de `gestionguias-api/docs`; la complementa desde la experiencia del usuario en navegador.

## Indice

| Documento | Alcance |
| --- | --- |
| [operatividad-web.md](./operatividad-web.md) | Cambios recientes y reglas visibles en sesiones, turnos, formularios y componentes compartidos. |

## Relacion con backend

- Los contratos HTTP viven en `gestionguias-api/docs`.
- La UI web usa esos contratos mediante `src/core/api/*` y hooks en `src/hooks/*`.
- Si cambia una respuesta visible para el front, se debe actualizar tanto la documentacion de API como esta documentacion.
