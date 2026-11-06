# 003 · Routine Builder

**Estado:** implementado ✅

## Qué hace

Pantalla donde el usuario elige qué grupos musculares trabajar y con qué equipamiento tiene disponible. Al confirmar, la app genera una rutina aleatoria con hasta 3 ejercicios por grupo, la guarda en base de datos y redirige a la rutina activa.

## Por qué

La generación automática elimina la fricción de planear el entreno. El usuario solo decide qué trabajar hoy y con qué; el resto lo hace la app.

## Criterios de aceptación

- [x] El usuario ve todos los grupos musculares disponibles como tarjetas seleccionables.
- [x] El usuario puede seleccionar uno o más grupos musculares.
- [x] El usuario puede seleccionar uno o más tipos de equipamiento (peso propio, mancuernas, gym).
- [x] Si no selecciona al menos un grupo y un equipamiento, se muestra un error claro.
- [x] La app filtra ejercicios por grupo muscular Y equipamiento seleccionado.
- [x] Se asignan hasta 3 ejercicios aleatorios por grupo muscular.
- [x] Si no hay ejercicios para la combinación elegida, se muestra un error claro.
- [x] La rutina generada se guarda en `routines` y sus ejercicios en `routine_exercises`.
- [x] Al generar la rutina, el usuario es redirigido a `/dashboard/routine/active?id=...`.

## Fuera de alcance

- Evitar repetir ejercicios de la sesión anterior — feature futura (010).
- Elegir número de series o reps manualmente — se usan los valores del ejercicio.
- Guardar rutinas favoritas para reutilizar.
