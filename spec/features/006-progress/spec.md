# 006 · Progress Dashboard

**Estado:** propuesta

## Qué hace

Dashboard de progreso personal donde el usuario visualiza la evolución de su entrenamiento a lo largo del tiempo. Incluye tarjetas de KPI, gráfica de frecuencia semanal, evolución de volumen y progresión de fuerza por ejercicio específico. Todo filtrable por rango de fechas.

## Por qué

Sin visualización de progreso, el usuario no puede ver si está mejorando. Es la pieza que cierra el ciclo: entrenas → registras → ves tu progreso → te motivas a seguir.

## Criterios de aceptación

### Seguridad
- [ ] Todas las consultas aplican RLS estricto — el usuario solo ve sus propios datos.
- [ ] Ninguna query expone datos de otros usuarios ni permite inferirlos.

### Filtro de rango de fechas
- [ ] El selector de rango aparece en la parte superior de la página.
- [ ] Las opciones predefinidas son: "Últimos 30 días" (por defecto), "Últimos 3 meses", "Últimos 6 meses", "Último año", "Todo el historial".
- [ ] Al cambiar el rango, todas las KPI cards y gráficas se actualizan dinámicamente sin recargar la página.

### KPI Cards
- [ ] Se muestra el total de entrenamientos completados en el rango seleccionado.
- [ ] Se muestra el tiempo total entrenado formateado en horas y minutos (ej. "3h 45min").
- [ ] Se muestra el volumen total acumulado (sum de sets_done × reps_done × weight_used) en el rango.
- [ ] Se muestra la racha actual en semanas consecutivas con al menos un entrenamiento registrado.
- [ ] Si no hay datos en el rango, las KPI cards muestran cero o "—" sin errores.

### Gráfica 1 — Frecuencia de Entrenamiento Semanal
- [ ] Es un Bar Chart.
- [ ] El eje X muestra semanas (fecha de inicio de semana).
- [ ] El eje Y muestra la cantidad de sesiones entrenadas en esa semana.
- [ ] Si no hay datos en el rango, muestra un empty state claro.

### Gráfica 2 — Evolución del Volumen Semanal
- [ ] Es un Area Chart o Line Chart.
- [ ] El eje X muestra semanas dentro del rango seleccionado.
- [ ] El eje Y muestra el volumen semanal total (sets_done × reps_done × weight_used).
- [ ] Si no hay datos en el rango, muestra un empty state claro.

### Gráfica 3 — Progresión de Fuerza por Ejercicio
- [ ] Incluye un Select con buscador para elegir un ejercicio de la tabla `exercises`.
- [ ] Solo muestra ejercicios que el usuario ha realizado al menos una vez con peso registrado.
- [ ] Es un Line Chart temporal.
- [ ] El eje X muestra las fechas de las sesiones donde se realizó el ejercicio.
- [ ] El eje Y muestra el máximo peso levantado (weight_used) en esa sesión.
- [ ] Si el ejercicio seleccionado no tiene datos de peso, muestra un mensaje claro.

### General
- [ ] La página está protegida — solo usuarios autenticados pueden acceder.
- [ ] La página es responsive y funciona bien en móvil.
- [ ] Si el usuario no tiene ninguna rutina completada aún, se muestra un empty state global con invitación a entrenar.

## Fuera de alcance

- Comparar progreso entre usuarios.
- Exportar datos o gráficas como imagen/PDF.
- Gráficas por grupo muscular (puede agregarse en feature futura).
- Volumen diario en la gráfica 3 — solo peso máximo por sesión por ahora.
- Notificaciones o metas de progreso.
