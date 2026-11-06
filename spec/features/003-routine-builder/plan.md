# 003 · Routine Builder — Plan

## Enfoque

Client Component que consulta grupos musculares al montar, permite selección múltiple con estado local, filtra ejercicios por `muscle_group_id` y `equipment_type` (con `.overlaps()` de Supabase), baraja y selecciona hasta 3 por grupo, guarda la rutina en dos inserts y redirige.

## Implementación

1. Crear tablas `routines` y `routine_exercises` en Supabase con SQL.
2. Activar RLS y otorgar permisos a ambas tablas.
3. Crear `src/app/dashboard/routine/builder/page.tsx` como Client Component.
4. Al montar, cargar grupos musculares desde Supabase.
5. Manejar selección de grupos y equipamiento con arrays en estado local.
6. Al confirmar: filtrar ejercicios → barajar → seleccionar → insertar rutina → insertar routine_exercises → redirigir.

## Decisiones

- **`.overlaps()` para equipamiento** — los ejercicios tienen `equipment_type` como array; `.overlaps()` filtra correctamente cuando el usuario selecciona uno o varios tipos.
- **Barajado con `sort(() => Math.random() - 0.5)`** — suficiente para variedad en este contexto; no se requiere Fisher-Yates.
- **Dos inserts separados** — primero `routines` para obtener el ID, luego `routine_exercises` en batch con ese ID.
- **Redirección con query param `?id=`** — pasa el ID de la rutina a la página activa sin estado global.

## Riesgos

- **Rutinas sin completar** — si el usuario abandona a mitad de la rutina, queda un registro en `routines` sin `completed_at`. No es crítico pero puede acumular datos basura.
- **Sin seed para el random** — el barajado es puramente aleatorio; puede repetir los mismos ejercicios en sesiones consecutivas. Feature 010 lo mitiga.
