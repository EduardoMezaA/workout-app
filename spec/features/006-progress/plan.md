# 006 · Progress Dashboard — Plan

## Enfoque

Client Component principal que maneja el estado del rango de fechas seleccionado. Al cambiar el rango, re-consulta Supabase y recalcula todos los KPIs y datos de gráficas en el cliente. Gráficas con Recharts (ya disponible en el proyecto vía CDN). Select con buscador nativo usando `<datalist>` o librería ligera.

## Implementación

1. Crear `src/app/progress/page.tsx` — Server Component que verifica sesión y renderiza el Client Component.
2. Crear `src/app/progress/ProgressDashboard.tsx` — Client Component principal con estado del rango de fechas.
3. Implementar selector de rango de fechas con 5 opciones predefinidas.
4. Implementar función `getDateRange(option)` que retorna `{ from: Date, to: Date }`.
5. Implementar query principal: `routines` con join a `routine_exercises`, filtrado por `user_id` y rango de `completed_at`.
6. Calcular KPIs en el cliente a partir de los datos crudos:
   - Total entrenamientos: `routines.length`
   - Tiempo total: `sum(duration_seconds)` → formatear a horas/minutos
   - Volumen total: `sum(sets_done × reps_done × weight_used)` — solo donde `weight_used` no es null
   - Racha: agrupar por semana ISO, contar semanas consecutivas hasta hoy
7. Transformar datos para Gráfica 1: agrupar rutinas por semana, contar sesiones por semana.
8. Transformar datos para Gráfica 2: agrupar por semana, sumar volumen por semana.
9. Implementar Select con buscador para ejercicios — cargar solo ejercicios con al menos un `weight_used` registrado por el usuario.
10. Al seleccionar ejercicio, filtrar `routine_exercises` por `exercise_id` y trazar peso máximo por sesión.
11. Crear componentes separados para cada gráfica: `FrequencyChart`, `VolumeChart`, `StrengthChart`.
12. Crear componente `KPICard` reutilizable para las 4 tarjetas.
13. Agregar link a `/progress` en el nav del dashboard.

## Stack de gráficas

Usar **Recharts** — ya está disponible como dependencia en el proyecto. No instalar librerías adicionales.

- Gráfica 1: `<BarChart>` de Recharts
- Gráfica 2: `<AreaChart>` de Recharts
- Gráfica 3: `<LineChart>` de Recharts

## Modelo de datos relevante

```
routines
  id, user_id, completed_at, duration_seconds

routine_exercises
  routine_id, exercise_id, sets_done, reps_done, weight_used (nullable)

exercises
  id, name
```

La query principal trae `routines` con sus `routine_exercises` en un solo request para no hacer N+1 queries.

## Cálculo de racha

```
1. Obtener todas las rutinas completadas (sin filtro de fecha para la racha)
2. Agrupar por semana ISO (lunes a domingo)
3. Ordenar semanas desc
4. Contar semanas consecutivas desde la semana actual hacia atrás
5. Si la semana actual no tiene entrenamiento, la racha es 0
```

## Decisiones

- **Todo en el cliente** — los datos de progreso son relativamente pequeños (máximo cientos de filas) y recalcular en el cliente evita una API route por cada cambio de rango.
- **Recharts sobre otras librerías** — ya está en el proyecto, evita instalar dependencias nuevas.
- **Solo ejercicios con peso registrado en el Select** — no tiene sentido mostrar ejercicios de los que no hay datos de fuerza.
- **Peso máximo por sesión en Gráfica 3** — más representativo del progreso real que el promedio.
- **Query sin filtro de fecha para la racha** — la racha debe calcularse sobre todo el historial, no sobre el rango seleccionado.

## Riesgos

- **Sin datos de peso** — muchos usuarios pueden no registrar peso. Volumen total y Gráfica 3 pueden aparecer vacíos o en cero. La UI debe manejarlo sin errores y con mensajes claros.
- **Rendimiento con historial largo** — si el usuario tiene cientos de rutinas, la query puede ser pesada. Limitar a los últimos 365 días en la query base y calcular la racha por separado.
- **Semanas con formato consistente** — usar `date-fns` o cálculo manual con `getISOWeek` para evitar bugs de zona horaria al agrupar por semana.
