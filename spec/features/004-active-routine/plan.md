# 004 · Active Routine — Plan

## Enfoque

Client Component único con máquina de estados (`phase`) que controla el flujo. Timer basado en `useEffect` + `setInterval` con refs para evitar stale closures. Stopwatch acumulativo en `totalElapsed`. Sonidos con Web Audio API sin archivos externos.

## Implementación

1. Cargar `routine_exercises` con join a `exercises` y `muscle_groups` al montar.
2. Generar listas de calentamiento y estiramiento dinámicas según slugs de grupos trabajados.
3. Mostrar animación de intro con `showIntro` y cuenta regresiva con `introStep`.
4. Fase `warmup`: timer individual por ejercicio usando `warmupListRef` para evitar stale closure.
5. Fase `exercise`: stopwatch acumulativo en `totalElapsed`, pausa, registro de peso, botón de completar serie.
6. Fase `rest`: countdown con `seconds`, botón de saltar.
7. Fase `stretching`: igual que warmup con `stretchingListRef`.
8. Fase `finished`: guardar en Supabase, confeti con `canvas-confetti`, pantalla de resumen.

## Decisiones

- **Refs para listas de ejercicios** (`warmupListRef`, `stretchingListRef`) — el `useEffect` del timer captura el estado en el momento de crearse (stale closure); usar refs permite leer el valor actual desde dentro del interval.
- **`timerEndCalledRef`** — guard para evitar que `handleTimerEnd` se ejecute dos veces si el interval dispara en el mismo tick en que se limpia.
- **`useEffect` separado para `totalElapsed` en fase `exercise`** — el timer principal solo corre cuando `seconds > 0`; en la fase de ejercicio `seconds` es 0, así que se necesita un interval independiente.
- **`setTimeout(() => handleTimerEnd(), 0)`** — saca la llamada del contexto del setter de React para evitar actualizaciones de estado anidadas.
- **Web Audio API** — evita dependencias externas y archivos de audio; los sonidos se generan programáticamente.
- **`canvas-confetti` con import dinámico** — solo se carga cuando se necesita (fase `finished`).

## Riesgos

- **Stale closures en timers** — resuelto con refs. Si se agregan nuevas fases o estados al timer, verificar que se usen refs para valores que cambian.
- **AudioContext en SSR** — resuelto con `if (typeof window === 'undefined') return` al inicio de `playBeep`.
- **Scroll en pantallas pequeñas** — resuelto con `overflow-hidden` en el contenedor y padding reducido. Si se agregan elementos, verificar en móvil.
