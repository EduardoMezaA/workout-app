# spec/ — Spec Driven Development

> Documentación del proyecto WorkoutApp siguiendo SDD: primero la spec, luego el plan, luego las tareas, y solo entonces se toca el código.

## Estructura

```
spec/
├── constitution/            ← reglas estables del proyecto (cambian poco)
│   ├── mission.md           ← qué construimos y para quién
│   ├── tech-stack.md        ← tecnologías, convenciones y límites
│   └── roadmap.md           ← orden de las features
└── features/                ← una carpeta por feature
    ├── 001-auth/            ← login, registro y verificación de email
    ├── 002-admin-panel/     ← CRUD de ejercicios y grupos musculares
    ├── 003-routine-builder/ ← selector y generador de rutinas
    ├── 004-active-routine/  ← rutina activa con timer y fases
    ├── 005-workout-log/     ← bitácora de sesiones del usuario
    └── 006-progress/        ← gráficas y seguimiento de progreso
```

## Flujo para una feature nueva

1. Crear `features/NNN-nombre-feature/` con el siguiente número libre.
2. Escribir `spec.md`: qué hace, por qué y criterios de aceptación medibles.
3. Escribir `plan.md`: enfoque técnico respetando `constitution/tech-stack.md`.
4. Desglosar en `tasks.md` y marcar el progreso.
5. Implementar y validar.
6. Actualizar `constitution/roadmap.md` (mover la feature a "Hecho").

> La constitución manda: si una feature choca con `mission.md` o `tech-stack.md`, se replantea la feature, no la constitución.
