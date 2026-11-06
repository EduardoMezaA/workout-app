# WorkoutApp

Aplicación web de rutinas de ejercicio personalizado para ganar fuerza y masa muscular.
El usuario elige grupos musculares y equipamiento disponible, y la app genera una rutina aleatoria con calentamiento, ejercicios, descansos temporizados y estiramientos. Incluye bitácora de progreso y sistema de login.

## Stack

- Lenguaje: TypeScript estricto (strict mode activado)
- Framework: Next.js 14 con App Router y Turbopack
- Runtime: Node.js 25
- Base de datos: Supabase (PostgreSQL) con RLS activado
- Auth: Supabase Auth con verificación de email
- Storage: Supabase Storage (bucket `exercises`) para imágenes y GIFs
- Estado global: Zustand (para timer y rutina activa)
- Estilos: Tailwind CSS
- Tests: ninguno configurado aún

## Comandos

- `npm run dev` — arranca el servidor en local con Turbopack
- `npm run build` — compila para producción
- `npm run lint` — revisa el estilo con ESLint
- `npm run start` — corre el build de producción en local

## Estructura del proyecto

- `src/app/` — rutas y páginas (App Router de Next.js)
- `src/app/(auth)/` — páginas de login, register y verify-email (Route Group, no afecta URL)
- `src/app/auth/confirm/` — página de bienvenida post-confirmación de email
- `src/app/dashboard/` — dashboard principal del usuario
- `src/app/dashboard/routine/builder/` — selector de grupos musculares y equipamiento
- `src/app/dashboard/routine/active/` — rutina activa con timer, stopwatch y fases
- `src/app/admin/` — panel de administración (solo rol admin)
- `src/app/admin/muscle-groups/` — CRUD de grupos musculares
- `src/app/admin/exercises/` — CRUD de ejercicios con subida de imagen y GIF
- `src/lib/supabase/client.ts` — cliente de Supabase para componentes del lado cliente
- `src/lib/supabase/server.ts` — cliente de Supabase para Server Components y Server Actions
- `src/lib/supabase/admin.ts` — cliente con service_role para operaciones admin (omite RLS)
- `src/components/` — componentes reutilizables (ej. LogoutButton)
- `src/proxy.ts` — middleware de Next.js para proteger rutas y manejar sesión
- `public/` — assets estáticos
- `.env.local` — variables de entorno locales (nunca subir al repo)

## Convenciones

- camelCase para variables y funciones; PascalCase para componentes y tipos.
- Archivos de página siempre llamados `page.tsx`; layouts `layout.tsx`.
- Componentes Client deben tener `'use client'` en la primera línea.
- Server Components por defecto; solo usar Client Components cuando se necesite estado, efectos o interactividad.
- Tipos de TypeScript definidos con `type`, no `interface`, salvo que se necesite extensión.
- No usar `any` salvo casos muy justificados y con comentario explicando por qué.
- Clientes de Supabase: usar `createClient()` de `@/lib/supabase/client` en Client Components y `createClient()` de `@/lib/supabase/server` en Server Components. Nunca mezclarlos.
- Para operaciones que requieran saltarse RLS usar `createAdminClient()` de `@/lib/supabase/admin` únicamente en Server Components o API routes.
- Estilos solo con clases de Tailwind; no agregar CSS personalizado salvo animaciones con `<style>` inline cuando sea estrictamente necesario.
- Los sonidos se generan con Web Audio API, sin archivos externos.

## Base de datos

Tablas en Supabase:
- `profiles` — extiende auth.users; tiene campo `role` (user | admin)
- `muscle_groups` — grupos musculares con name y slug
- `exercises` — ejercicios con muscle_group_id, equipment_type (array), image_url, gif_url, sets/reps/rest recomendados
- `routines` — rutinas generadas por usuario con duration_seconds y completed_at
- `routine_exercises` — ejercicios de cada rutina con sets_done, reps_done, weight_used

RLS activo en todas las tablas. Permisos de esquema otorgados explícitamente con `grant all on table X to authenticated`.

## Roles

- `user` — puede ver ejercicios, crear rutinas y ver su propia bitácora.
- `admin` — puede hacer CRUD de muscle_groups y exercises, subir imágenes/GIFs a Storage.
- El rol se lee desde `profiles.role` usando `createAdminClient()` en el layout de admin.

## Fases de la rutina activa

El componente `active/page.tsx` maneja estas fases en orden:
1. `warmup` — ejercicios de calentamiento según grupos musculares elegidos, con timer por ejercicio
2. `exercise` — ejercicios generados aleatoriamente, con stopwatch acumulativo y registro de peso opcional
3. `rest` — descanso con countdown entre series y ejercicios
4. `stretching` — estiramientos según grupos musculares trabajados, con timer por ejercicio
5. `finished` — pantalla final con confeti, tiempo total, series y peso máximo

El timer acumula `totalElapsed` en todas las fases excepto cuando `isPaused === true`.

## No hagas

- No subir `.env.local` al repositorio bajo ninguna circunstancia — contiene las keys de Supabase.
- No usar `any` en TypeScript sin justificarlo con un comentario.
- No mezclar el cliente de Supabase de servidor con el de cliente — causará errores de hidratación.
- No modificar las tablas de Supabase sin actualizar también las políticas RLS correspondientes.
- No instalar dependencias nuevas sin avisar y justificar por qué se necesitan.
- No tocar `src/lib/supabase/admin.ts` para usos que no sean estrictamente operaciones de administración — tiene acceso sin restricciones a la base de datos.
- No usar `localStorage` ni `sessionStorage` — Supabase maneja la sesión con cookies a través del middleware.
- No crear componentes con estado dentro de otros componentes (causará pérdida de foco en inputs).
- No hardcodear tiempos de ejercicio en segundos fuera de los objetos `WARMUP_BY_GROUP` y `STRETCHING_BY_GROUP`.

## Flujo de trabajo

- Antes de una tarea no trivial, propón un plan y espera aprobación.
- Una tarea a la vez; al terminar, describe qué archivos cambiaste y por qué.
- Si algo no está claro al 80%, pregunta antes de asumir.
- Los ejercicios de la app solo los puede agregar el admin — nunca generar ni modificar ejercicios desde código del lado usuario.
- Al agregar nuevas tablas en Supabase, siempre activar RLS y otorgar permisos explícitos con GRANT.


## Memoria y log de sesión

Antes de comenzar cualquier tarea, lee el archivo `docs/session-log.md` para 
entender el contexto de sesiones anteriores.

Al terminar cada tarea o bloque de trabajo, actualiza `docs/session-log.md` 
con una entrada en este formato:

    [Fecha] — [Descripción breve de la tarea]

    Estado: Completado | En progreso | Bloqueado

    Qué se hizo:
        - [Cambio 1]
        - [Cambio 2]

    Archivos modificados:
        - src/ruta/archivo.tsx — [por qué se modificó]

    Pendiente / siguiente paso:
        - [Qué sigue o qué quedó pendiente]

    Notas importantes:
        - [Decisiones tomadas, problemas encontrados, contexto relevante]


### Reglas del log

- Nunca borres entradas anteriores, solo agrega al final.
- Si retomas una tarea de una sesión anterior, menciona la fecha de la entrada 
  original.
- Si hay un bug conocido o algo bloqueado, márcalo claramente con 
  `**Estado:** Bloqueado` para no olvidarlo.
- Al iniciar una sesión nueva, resume en 2-3 líneas el estado actual del 
  proyecto antes de empezar.


## Progreso y checkpoint de sesión

- Cuando completes una tarea del feature en curso, márcala con `[x]` en su `tasks.md` de inmediato, en ese mismo turno. Marca `[x]` solo si está terminada y verificada en el código; si está a medias, déjala sin marcar.
- Cuando el usuario escriba "CHECKPOINT": detente, no hagas cambios de código y haz esto:
  1. Revisa el `tasks.md` del feature en curso y asegúrate de que los `[x]` reflejen lo que realmente está hecho en el código.
  2. Agrega al final de `docs/session-log.md` una entrada de máximo 10 líneas con: qué quedó terminado, qué archivo se estaba editando, el siguiente paso exacto y problemas abiertos. Nunca reescribas entradas anteriores.
- No marques los criterios de `spec.md` ni muevas el feature en `roadmap.md` hasta la validación final.


## Documentación

- Next.js App Router: https://nextjs.org/docs/app
- Supabase Auth con SSR: https://supabase.com/docs/guides/auth/server-side/nextjs
- Supabase Storage: https://supabase.com/docs/guides/storage
- Tailwind CSS: https://tailwindcss.com/docs
- Zustand: https://zustand.docs.pmnd.rs


### Documentación adicional

- `docs/session-log.md` — log de sesiones y tareas realizadas
- `docs/schema.md` — estructura de tablas de Supabase (actualizar si cambia el schema)
- `docs/decisions.md` — decisiones de arquitectura y por qué se tomaron