# 005 · Workout Log

**Estado:** implementado ✅

## Qué hace

Sección donde el usuario puede ver el historial de todas sus rutinas completadas. Por cada sesión muestra: fecha, duración total, grupos musculares trabajados, ejercicios realizados con series, reps y peso usado.

## Por qué

Sin un historial el usuario no puede ver su progreso ni recordar qué trabajó en sesiones anteriores. Es la pieza que convierte la app de "herramienta de entreno" a "herramienta de progreso".

## Criterios de aceptación

- [x] El usuario ve una lista de sus rutinas completadas ordenadas por fecha (más reciente primero).
- [x] Cada entrada muestra: fecha, duración total formateada (mm:ss o hh:mm), grupos musculares trabajados.
- [x] El usuario puede expandir una entrada para ver el detalle de ejercicios (nombre, series × reps, peso si se registró).
- [x] Si no hay rutinas completadas, se muestra un empty state con invitación a entrenar.
- [x] Solo se muestran rutinas con `completed_at` no nulo.
- [x] La página está protegida — solo usuarios autenticados pueden acceder.
- [x] El usuario solo ve sus propias rutinas (RLS).

## Fuera de alcance

- Editar o eliminar entradas del historial.
- Filtrar por grupo muscular o rango de fechas — puede agregarse en feature 006.
- Exportar el historial.
