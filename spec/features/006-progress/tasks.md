# 006 · Progress Dashboard — Tareas

## Setup
- [ ] Verificar que Recharts está disponible como dependencia (`npm list recharts`).
- [ ] Verificar que RLS está activo en `routines` y `routine_exercises`.
- [ ] Confirmar que los GRANTs de `routines` y `routine_exercises` a `authenticated` están aplicados.

## Estructura de archivos
- [ ] Crear `src/app/progress/page.tsx` — Server Component con verificación de sesión.
- [ ] Crear `src/app/progress/ProgressDashboard.tsx` — Client Component principal.
- [ ] Crear `src/app/progress/components/KPICard.tsx` — tarjeta de KPI reutilizable.
- [ ] Crear `src/app/progress/components/FrequencyChart.tsx` — Bar Chart de frecuencia semanal.
- [ ] Crear `src/app/progress/components/VolumeChart.tsx` — Area Chart de volumen semanal.
- [ ] Crear `src/app/progress/components/StrengthChart.tsx` — Line Chart de progresión de fuerza.

## Filtro de rango de fechas
- [ ] Implementar selector con 5 opciones predefinidas.
- [ ] Implementar función `getDateRange(option)` que retorna `{ from: Date, to: Date }`.
- [ ] Valor por defecto: "Últimos 30 días".
- [ ] Al cambiar el rango, re-consultar y recalcular todo dinámicamente.

## Query principal
- [ ] Query de `routines` con join a `routine_exercises`, filtrado por `user_id` y rango de `completed_at`.
- [ ] Solo traer rutinas con `completed_at` no nulo.
- [ ] Query separada de todas las rutinas (sin filtro de fecha) para calcular la racha.
- [ ] Query de ejercicios con al menos un `weight_used` registrado por el usuario para el Select.

## KPI Cards
- [ ] Calcular total de entrenamientos completados en el rango.
- [ ] Calcular tiempo total entrenado y formatearlo como "Xh Ymin".
- [ ] Calcular volumen total (sets_done × reps_done × weight_used, solo donde weight_used no es null).
- [ ] Calcular racha actual en semanas consecutivas.
- [ ] Mostrar "—" o 0 sin errores cuando no hay datos.

## Gráfica 1 — Frecuencia Semanal
- [ ] Agrupar rutinas por semana ISO.
- [ ] Contar sesiones por semana.
- [ ] Renderizar BarChart con Recharts.
- [ ] Mostrar empty state si no hay datos.

## Gráfica 2 — Volumen Semanal
- [ ] Agrupar routine_exercises por semana de su rutina.
- [ ] Sumar volumen por semana.
- [ ] Renderizar AreaChart con Recharts.
- [ ] Mostrar empty state si no hay datos o no hay peso registrado.

## Gráfica 3 — Progresión de Fuerza
- [ ] Implementar Select con buscador de ejercicios.
- [ ] Al seleccionar ejercicio, filtrar routine_exercises por exercise_id.
- [ ] Calcular peso máximo por sesión.
- [ ] Renderizar LineChart con Recharts.
- [ ] Mostrar mensaje claro si el ejercicio no tiene datos de peso.

## Navegación y acceso
- [ ] Agregar link a `/progress` en el nav del dashboard.
- [ ] Verificar que la página redirige a login si no hay sesión.

## Validación final
- [ ] Verificar que ninguna query retorna datos de otros usuarios.
- [ ] Verificar comportamiento responsive en móvil.
- [ ] Verificar empty state global si el usuario no tiene ninguna rutina completada.
- [ ] Validar todos los criterios de aceptación de `spec.md`.
- [ ] Cambiar estado en `spec.md` a `implementado ✅` y marcar todos los criterios con `[x]`.
- [ ] Marcar todas las tareas con `[x]` en este archivo.
- [ ] Mover feature a "Hecho" en `constitution/roadmap.md`.
- [ ] Actualizar `docs/session-log.md` con una entrada que incluya:
  - Fecha de la sesión.
  - Descripción de qué se implementó.
  - Lista de todos los archivos creados o modificados con una línea explicando qué hace cada uno.
  - Decisiones técnicas relevantes tomadas durante la implementación.
  - Pendientes o problemas encontrados si los hay.