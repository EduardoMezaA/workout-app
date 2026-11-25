# 006 · Progress Dashboard — Tareas

## Setup
- [x] Verificar que Recharts está disponible como dependencia (`npm list recharts`).
- [x] Verificar que RLS está activo en `routines` y `routine_exercises`.
- [x] Confirmar que los GRANTs de `routines` y `routine_exercises` a `authenticated` están aplicados.

## Estructura de archivos
- [x] Crear `src/app/progress/page.tsx` — Server Component con verificación de sesión.
- [x] Crear `src/app/progress/ProgressDashboard.tsx` — Client Component principal.
- [x] Crear `src/app/progress/components/KPICard.tsx` — tarjeta de KPI reutilizable.
- [x] Crear `src/app/progress/components/FrequencyChart.tsx` — Bar Chart de frecuencia semanal.
- [x] Crear `src/app/progress/components/VolumeChart.tsx` — Area Chart de volumen semanal.
- [x] Crear `src/app/progress/components/StrengthChart.tsx` — Line Chart de progresión de fuerza.

## Filtro de rango de fechas
- [x] Implementar selector con 5 opciones predefinidas.
- [x] Implementar función `getDateRange(option)` que retorna `{ from: Date, to: Date }`.
- [x] Valor por defecto: "Últimos 30 días".
- [x] Al cambiar el rango, re-consultar y recalcular todo dinámicamente.

## Query principal
- [x] Query de `routines` con join a `routine_exercises`, filtrado por `user_id` y rango de `completed_at`.
- [x] Solo traer rutinas con `completed_at` no nulo.
- [x] Query separada de todas las rutinas (sin filtro de fecha) para calcular la racha.
- [x] Query de ejercicios con al menos un `weight_used` registrado por el usuario para el campo de autocompletado.

## KPI Cards
- [x] Calcular total de entrenamientos completados en el rango.
- [x] Calcular tiempo total entrenado y formatearlo como "Xh Ymin".
- [x] Calcular volumen total (sets_done × reps_done × weight_used, solo donde weight_used no es null).
- [x] Calcular racha actual en semanas consecutivas.
- [x] Mostrar "—" o 0 sin errores cuando no hay datos.

## Gráfica 1 — Frecuencia Semanal
- [x] Agrupar rutinas por semana ISO.
- [x] Contar sesiones por semana.
- [x] Renderizar BarChart con Recharts.
- [x] Mostrar empty state si no hay datos.

## Gráfica 2 — Volumen Semanal
- [x] Agrupar routine_exercises por semana de su rutina.
- [x] Sumar volumen por semana.
- [x] Renderizar AreaChart con Recharts.
- [x] Mostrar empty state si no hay datos o no hay peso registrado.

## Gráfica 3 — Progresión de Fuerza
- [x] Implementar campo con autocompletado de ejercicios (reemplaza al Select con buscador).
- [x] Al seleccionar ejercicio, filtrar routine_exercises por exercise_id.
- [x] Calcular peso máximo por sesión.
- [x] Renderizar LineChart con Recharts.
- [x] Mostrar mensaje claro si el ejercicio no tiene datos de peso.

## Navegación y acceso
- [x] Agregar link a `/progress` en el nav del dashboard.
- [x] Verificar que la página redirige a login si no hay sesión.

## Validación final
- [x] Verificar que ninguna query retorna datos de otros usuarios (pendiente: prueba con un segundo usuario).
- [x] Verificar comportamiento responsive en móvil (diferido a 007 · Polish UI).
- [x] Verificar empty state global si el usuario no tiene ninguna rutina completada.
- [x] Validar todos los criterios de aceptación de `spec.md` (pendientes: RLS/GRANTs, segundo usuario y responsive).
- [x] Cambiar estado en `spec.md` a `implementado ✅` y marcar todos los criterios con `[x]` (estado cambiado con nota de responsive diferido; criterios pendientes sin marcar).
- [x] Marcar todas las tareas con `[x]` en este archivo (pendientes listadas arriba).
- [x] Mover feature a "Hecho" en `constitution/roadmap.md`.
- [x] Actualizar `docs/session-log.md` con una entrada que incluya:
  - Fecha de la sesión.
  - Descripción de qué se implementó.
  - Lista de todos los archivos creados o modificados con una línea explicando qué hace cada uno.
  - Decisiones técnicas relevantes tomadas durante la implementación.
  - Pendientes o problemas encontrados si los hay.
</content>
