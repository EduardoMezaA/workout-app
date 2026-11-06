# 002 · Admin Panel — Tareas

- [x] Crear tablas `muscle_groups` y `exercises` en Supabase con SQL.
- [x] Activar RLS y crear políticas para ambas tablas.
- [x] Otorgar permisos `GRANT ALL` a `muscle_groups`, `exercises` y `profiles`.
- [x] Configurar bucket `exercises` en Supabase Storage como público.
- [x] Agregar políticas de Storage para admin (insert, delete) y todos (select).
- [x] Crear `src/app/admin/layout.tsx` con verificación de rol.
- [x] Crear `src/app/admin/page.tsx` con accesos a secciones.
- [x] Crear `src/app/admin/muscle-groups/page.tsx` con CRUD.
- [x] Crear `src/app/admin/exercises/page.tsx` con CRUD y subida de archivos.
- [x] Extraer `FormFields` fuera del componente para evitar pérdida de foco.
- [x] Implementar modal de edición con estado separado.
- [x] Implementar `fileInputKey` para limpiar inputs de archivo al guardar.
- [x] Validar criterios de aceptación de `spec.md`.
- [x] Mover la feature a "Hecho" en `constitution/roadmap.md`.
