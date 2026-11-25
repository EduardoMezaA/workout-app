# Session Log — WorkoutApp

## 2026-09-11 — Setup inicial del proyecto

**Estado:** Completado

**Qué se hizo:**
- Configuración de Next.js 14 con App Router, Tailwind y TypeScript
- Integración con Supabase (Auth, Database, Storage)
- Sistema de login, registro y verificación de email
- Middleware de protección de rutas (src/proxy.ts)
- Panel de admin con CRUD de grupos musculares y ejercicios
- Subida de imágenes y GIFs a Supabase Storage
- Generador de rutinas aleatorias por grupo muscular y equipamiento
- Rutina activa con fases: warmup, exercise, rest, stretching, finished
- Timer con countdown para descansos y calentamiento
- Stopwatch acumulativo con pausa durante ejercicios
- Animación de intro con cuenta regresiva y sonidos
- Confeti y pantalla de resumen al terminar la rutina
- Ejercicios de calentamiento y estiramiento dinámicos por grupo muscular
- Botón de cerrar sesión

**Archivos principales:**
- `src/app/(auth)/` — login, register, verify-email
- `src/app/auth/confirm/` — página post-confirmación de email
- `src/app/dashboard/` — dashboard principal
- `src/app/dashboard/routine/builder/` — selector de rutina
- `src/app/dashboard/routine/active/` — rutina activa con timer
- `src/app/admin/` — panel de administración
- `src/lib/supabase/` — clientes de Supabase (client, server, admin)
- `src/components/LogoutButton.tsx` — botón de cerrar sesión
- `src/proxy.ts` — middleware de rutas protegidas

**Pendiente / siguiente paso:**
- Fase 5: Bitácora de sesiones del usuario
- Fase 6: Gráficas de progreso
- Mejorar diseño general de la app (polish)
- Configurar URL de redirección de Supabase para producción

**Notas importantes:**
- RLS activo en todas las tablas — requiere `grant all` explícito para que funcione con service_role
- El middleware se llama `proxy.ts` (no middleware.ts) por cambio en Next.js 15
- Los tiempos de calentamiento y estiramiento viven en `WARMUP_BY_GROUP` y `STRETCHING_BY_GROUP` dentro de active/page.tsx
- El admin client usa service_role para saltarse RLS en el layout de admin

## 2026-10-07 — Feature 005: Workout Log (Bitácora de Entrenamientos)

**Estado:** Completado

**Qué se hizo:**
- Implementación de la página de bitácora de entrenamientos en `/dashboard/log`
- Creación de Server Component (`page.tsx`) para consulta protegida de rutinas completadas con sus ejercicios y grupos musculares mediante Supabase SSR
- Creación de Client Component (`WorkoutLogClient.tsx`) con listado ordenado por fecha, duración formateada, badges de grupos musculares e interfaz acordeón expandible para ver series, repeticiones y peso registrado por ejercicio
- Empty state con invitación a entrenar cuando no hay rutinas completadas
- Actualización del enlace "Bitácora" en el dashboard principal (`/dashboard/page.tsx`)

**Archivos modificados:**
- `src/app/dashboard/log/page.tsx` — servidor de bitácora con consulta a Supabase
- `src/app/dashboard/log/WorkoutLogClient.tsx` — interfaz cliente de historial y detalle colapsable
- `src/app/dashboard/page.tsx` — actualización de enlace a `/dashboard/log`
- `docs/session-log.md` — actualización del log de sesión

**Pendiente / siguiente paso:**
- Fase 6: Gráficas de progreso
- Mejorar diseño general de la app (polish)

## 2026-10-22 — Feature 006: Progress Dashboard (INCOMPLETO)

**Estado:** En progreso — interrumpido por límite de cuota de API

**Qué se hizo:**
- Se crearon los archivos de spec, plan y tasks en `spec/features/006-progress/`
- Se leyó la especificación y se revisó la estructura del proyecto
- Se instaló Recharts (`npm install recharts`)
- NO se creó ningún archivo de código todavía

**Archivos creados hasta el momento:**
- `spec/features/006-progress/spec.md` ✅
- `spec/features/006-progress/plan.md` ✅
- `spec/features/006-progress/tasks.md` ✅

**Pendiente / siguiente paso:**
- Comenzar desde cero la implementación — ningún archivo de código fue creado
- Primer task pendiente: crear `src/app/progress/page.tsx`
- Continuar con todos los tasks en `spec/features/006-progress/tasks.md`

**Notas importantes:**
- Recharts ya está instalado, no reinstalar
- Sesión interrumpida por límite de cuota antes de tocar cualquier archivo de código

## 2026-10-24 — Feature 006: Progress Dashboard (INCOMPLETO - intento 3)

**Estado:** En progreso — interrumpido por alta demanda/límite de cuota

**Qué se hizo:**
- Archivos de código creados en sesión anterior (puede haber código incompleto):
  - `src/app/progress/page.tsx`
  - `src/app/progress/ProgressDashboard.tsx`
  - `src/app/progress/components/KPICard.tsx`
  - `src/app/progress/components/FrequencyChart.tsx`
  - `src/app/progress/components/VolumeChart.tsx`
  - `src/app/progress/components/StrengthChart.tsx`
- En este intento solo alcanzó a leer algunos archivos, no modificó nada

**Archivos que NO leyó antes de interrumpirse:**
- `src/app/progress/ProgressDashboard.tsx`
- `src/app/progress/components/VolumeChart.tsx`
- `src/app/progress/components/StrengthChart.tsx`

**Pendiente:**
- Terminar de leer y verificar todos los archivos de código
- Completar lo que falte según spec.md y tasks.md
- Actualizar documentación al terminar

**Notas importantes:**
- Recharts ya instalado, no reinstalar
- workout_log = routines en este proyecto
- spec.md y tasks.md del feature 006 NO han sido actualizados aún

## 2026-11-24 — Feature 006: Progress Dashboard (cierre)

**Estado:** Completado (responsive diferido a 007 · Polish UI)

**Qué se hizo:**
- Dashboard de progreso completo: KPI cards, frecuencia semanal, volumen semanal, progresión de fuerza por ejercicio y filtro de rango.
- Cambios fuera de la spec original:
  - Filtro `.eq("user_id", user.id)` en las queries de `routines` (ProgressDashboard.tsx).
  - Estado `exercisesLoading` para no mostrar "Sin historial de cargas" mientras carga la lista de ejercicios.
  - Campo con autocompletado en lugar de select + buscador, con botón "✕" para limpiar la búsqueda. Filtra sin distinguir mayúsculas ni acentos.
  - Regla de racha: si la semana actual no tiene entrenamiento, se cuenta desde la anterior; si tampoco, la racha es 0.
  - `overscroll-behavior-y: none` en globals.css (presente en el archivo; no fue un cambio de esta sesión, origen no verificado).
  - Aviso `beforeunload` en la rutina activa mientras `phase !== "finished"` (active/page.tsx).
- Lint y tsc: sin errores en src/app/progress/ ni en dashboard/page.tsx.

**Archivos modificados:**
- src/app/progress/ProgressDashboard.tsx — página principal del dashboard, queries, KPIs, gráficas y estado de carga.
- src/app/progress/page.tsx — Server Component con verificación de sesión.
- src/app/progress/components/KPICard.tsx — tarjeta KPI reutilizable.
- src/app/progress/components/FrequencyChart.tsx — BarChart de sesiones por semana.
- src/app/progress/components/VolumeChart.tsx — AreaChart de volumen semanal.
- src/app/progress/components/StrengthChart.tsx — LineChart de peso máximo por sesión con campo de autocompletado.
- src/app/dashboard/routine/active/page.tsx — listener `beforeunload` mientras la rutina no ha terminado.
- spec/features/006-progress/spec.md, tasks.md, plan.md y spec/constitution/roadmap.md — estado y criterios.

**Decisiones:**
- Todo el cálculo de KPIs y gráficas en el cliente (volumen de datos pequeño, evita API routes).
- Racha calculada sobre todo el historial, no sobre el rango seleccionado.
- Gráfica 3 usa el peso máximo por sesión.

**Pendientes:**
- Verificar RLS y GRANTs de `routines` y `routine_exercises`.
- Prueba con un segundo usuario para confirmar que no se exponen datos ajenos.
- Responsive en móvil (diferido a 007 · Polish UI).
- Limpieza de lint en admin, builder, active y log (26 errores, 11 warnings), fuera de este feature.
- Retomar rutina tras recarga (backlog).
- No se ejecutó `npm run build` en esta sesión.