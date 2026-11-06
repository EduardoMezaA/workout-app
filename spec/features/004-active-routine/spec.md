# 004 · Active Routine

**Estado:** implementado ✅

## Qué hace

Guía al usuario a través de su rutina completa, fase por fase: animación de intro → calentamiento → ejercicios → descanso → estiramientos → pantalla final. Incluye timer de countdown para descansos y calentamiento, stopwatch acumulativo durante ejercicios, pausa global, sonidos y animaciones.

## Por qué

Es la experiencia central de la app — donde el usuario pasa más tiempo. Debe ser clara, sin distracciones y funcionar sin que el usuario tenga que pensar.

## Criterios de aceptación

- [x] Al entrar, se muestra una animación de intro con cuenta regresiva (¿Listo? → 3 → 2 → 1) con sonido en cada número.
- [x] La fase de calentamiento muestra ejercicios específicos al grupo muscular trabajado.
- [x] Cada ejercicio de calentamiento tiene un timer con la duración correcta (no siempre 40s).
- [x] Al terminar el tiempo de un ejercicio de calentamiento, pasa automáticamente al siguiente con su tiempo correcto.
- [x] El usuario puede avanzar manualmente al siguiente ejercicio de calentamiento.
- [x] La fase de ejercicio muestra nombre, descripción, GIF/imagen, reps, descanso y campo de peso opcional.
- [x] El GIF/imagen se muestra completo (aspect-square, object-contain) sin recortarse.
- [x] Durante la fase de ejercicio corre un stopwatch acumulativo que muestra el tiempo total de la rutina.
- [x] El botón de pausa detiene el stopwatch y el countdown durante ejercicios y descansos.
- [x] El botón de completar serie está deshabilitado mientras está en pausa.
- [x] La fase de descanso muestra countdown con el tiempo del ejercicio y permite saltarlo.
- [x] La fase de estiramientos muestra ejercicios específicos al grupo muscular trabajado con timers correctos.
- [x] Al terminar todos los estiramientos, se muestra la pantalla final con confeti.
- [x] La pantalla final muestra tiempo total, número de ejercicios y series totales.
- [x] Al completar la rutina se actualiza `completed_at` y `duration_seconds` en `routines`.
- [x] El peso ingresado por ejercicio se guarda en `routine_exercises`.
- [x] Suena un beep triple al terminar el countdown de cada ejercicio/descanso.
- [x] Suena una melodía de victoria al terminar la rutina completa.
- [x] No hay scroll vertical en ninguna de las fases.

## Fuera de alcance

- Editar series o reps durante la rutina activa.
- Pausar y reanudar la rutina en otra sesión (persistencia de estado).
- Notificaciones push cuando termina el descanso.
