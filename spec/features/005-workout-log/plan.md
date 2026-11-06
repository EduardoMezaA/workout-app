# 005 · Workout Log — Plan

## Enfoque

Server Component que consulta `routines` con join a `routine_exercises` y `exercises`, filtrando solo las completadas del usuario autenticado. Lista expandible con estado local en Client Component hijo.

## Implementación

1. Crear `src/app/log/page.tsx` — Server Component que carga el historial.
2. Consultar `routines` con `completed_at not null`, ordenado por `created_at desc`, con join a `routine_exercises → exercises → muscle_groups`.
3. Crear componente `LogEntry` como Client Component para manejar el expand/collapse de cada entrada.
4. Mostrar grupos musculares únicos por rutina (deduplicados).
5. Mostrar ejercicios con series, reps y peso si existe.
6. Agregar empty state si no hay rutinas completadas.
7. Agregar link a `/log` en el nav del dashboard.

## Decisiones

- **Server Component para la carga** — no necesita interactividad al cargar; mejor rendimiento y SEO.
- **Client Component solo para expand/collapse** — el estado de UI no necesita ir al servidor.
- **Join en una sola query** — evita N+1 queries consultando todo de una vez con select anidado de Supabase.

## Riesgos

- **Queries grandes** — si el usuario tiene muchas rutinas, la query puede ser pesada. Paginar si supera 50 entradas.
- **Datos sin peso** — `weight_used` es nullable; la UI debe manejar el caso en que no se registró peso.
