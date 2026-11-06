# Roadmap

## Hecho ✅

1. **001 · Auth** — sistema de login, registro con verificación de email, pantalla de confirmación y rutas protegidas por middleware.
2. **002 · Admin Panel** — CRUD de grupos musculares y ejercicios con subida de imagen y GIF a Supabase Storage. Protegido por rol admin.
3. **003 · Routine Builder** — selector de grupos musculares y equipamiento, generación aleatoria de rutina sin repetir ejercicios del mismo grupo.
4. **004 · Active Routine** — rutina activa completa: animación de intro, calentamiento, ejercicios con stopwatch, descanso con countdown, estiramientos, pantalla final con confeti. Timer acumulativo con pausa. Sonidos con Web Audio API. Registro opcional de peso por ejercicio.
5. **005 · Workout Log** — bitácora de sesiones del usuario: historial de rutinas completadas con ejercicios realizados, series, reps, peso usado y tiempo total.

## Siguiente 🔜

6. **006 · Progress** — gráficas de progreso por ejercicio (peso levantado en el tiempo) y por volumen de entrenamiento semanal.

## Backlog / ideas 💡
- **007 · Polish UI** — mejora general del diseño: animaciones de transición entre páginas, estados de carga, empty states, mejora del dashboard.
- **008 · Deploy** — configurar despliegue en Vercel con variables de entorno de producción y URL de redirección de Supabase actualizada.
- **009 · PWA** — convertir la app en Progressive Web App para instalarla en el celular y usarla sin conexión durante el entreno.
- **010 · Ejercicios por sesión anterior** — evitar repetir los mismos ejercicios que se usaron en la sesión anterior del mismo grupo muscular.

> Cada feature nueva se crea como `features/NNN-nombre-feature/` con `spec.md`, `plan.md` y `tasks.md` antes de tocar código.
