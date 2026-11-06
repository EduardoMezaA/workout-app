# 002 · Admin Panel — Plan

## Enfoque

Layout de admin con verificación de rol en servidor usando `createAdminClient()`. CRUD de muscle_groups y exercises como Client Components que consultan Supabase directamente. Subida de archivos a Supabase Storage con URL pública.

## Implementación

1. Crear `src/app/admin/layout.tsx` — verifica sesión y rol admin; redirige si no cumple.
2. Crear `src/app/admin/page.tsx` — índice con accesos a las dos secciones.
3. Crear `src/app/admin/muscle-groups/page.tsx` — formulario de creación y lista con opción de eliminar.
4. Crear `src/app/admin/exercises/page.tsx` — formulario de creación, lista y modal de edición.
5. Configurar bucket `exercises` en Supabase Storage como público.
6. Agregar políticas de Storage para que solo admin pueda subir/borrar y todos puedan leer.
7. Otorgar permisos `GRANT ALL` a tablas `muscle_groups` y `exercises`.

## Decisiones

- **`createAdminClient()` en layout** — el RLS bloqueaba la lectura de `profiles` con el cliente normal. Service_role omite RLS de forma controlada solo en este punto del servidor.
- **`FormFields` como componente externo** — definirlo dentro del componente padre causaba pérdida de foco en inputs al re-renderizar. Moverlo fuera soluciona el problema.
- **`fileInputKey` con estado numérico** — cambiar la `key` del input de archivo fuerza a React a desmontarlo y remontarlo, limpiándolo completamente sin necesidad de manipular el DOM.
- **Modal de edición con estado separado** — `editForm`, `editImageFile`, `editGifFile` independientes del formulario de creación para no mezclar estados.

## Riesgos

- **Archivos huérfanos en Storage** — al eliminar un ejercicio, sus archivos en Storage no se borran automáticamente. Se puede limpiar manualmente desde el dashboard de Supabase.
- **Slugs duplicados en muscle_groups** — hay validación a nivel de base de datos (unique constraint) pero no feedback claro en la UI si falla.
