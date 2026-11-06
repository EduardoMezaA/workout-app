# Tech stack y convenciones

## Tecnologías

- **Lenguaje:** TypeScript estricto (strict mode activado)
- **Framework:** Next.js 14 con App Router y Turbopack
- **Runtime:** Node.js 25
- **Base de datos:** Supabase (PostgreSQL) con Row Level Security activo
- **Auth:** Supabase Auth con verificación de email
- **Storage:** Supabase Storage — bucket `exercises` para imágenes y GIFs de ejercicios
- **Estado global:** Zustand — para timer y estado de rutina activa
- **Estilos:** Tailwind CSS (solo clases utilitarias, sin CSS personalizado salvo animaciones puntuales con `<style>` inline)
- **Audio:** Web Audio API nativa — sin archivos externos ni librerías de sonido
- **Confeti:** canvas-confetti — solo en pantalla de rutina completada
- **Tests:** ninguno configurado aún
- **Despliegue:** pendiente (Vercel es la opción prevista)

## Archivos y módulos clave

- `src/app/(auth)/` — páginas de login, register y verify-email (Route Group, no afecta URL)
- `src/app/auth/confirm/` — página de bienvenida post-confirmación de email
- `src/app/dashboard/` — dashboard principal del usuario autenticado
- `src/app/dashboard/routine/builder/` — selector de grupos musculares y equipamiento
- `src/app/dashboard/routine/active/` — rutina activa con todas las fases y timer
- `src/app/admin/` — panel de administración protegido por rol
- `src/app/admin/muscle-groups/` — CRUD de grupos musculares
- `src/app/admin/exercises/` — CRUD de ejercicios con subida de imagen y GIF
- `src/lib/supabase/client.ts` — cliente Supabase para Client Components
- `src/lib/supabase/server.ts` — cliente Supabase para Server Components y Server Actions
- `src/lib/supabase/admin.ts` — cliente con service_role (omite RLS, solo para operaciones admin)
- `src/components/LogoutButton.tsx` — componente de cerrar sesión
- `src/proxy.ts` — middleware de Next.js para proteger rutas y manejar sesión

## Comandos

- `npm run dev` — arranca el servidor local con Turbopack
- `npm run build` — compila para producción
- `npm run lint` — revisa el estilo con ESLint
- `npm run start` — corre el build de producción en local

## Modelo de datos

### Tablas en Supabase

- `profiles` — extiende `auth.users`; campo `role` tipo enum (`user` | `admin`). Se crea automáticamente vía trigger al registrarse.
- `muscle_groups` — grupos musculares con `name` (texto) y `slug` (único, usado para mapear calentamientos y estiramientos).
- `exercises` — ejercicios con `muscle_group_id` (FK), `equipment_type` (array de texto: `bodyweight` | `dumbbell` | `gym`), `image_url`, `gif_url`, `sets_recommended`, `reps_recommended`, `rest_seconds`.
- `routines` — rutinas generadas por usuario con `user_id`, `created_at`, `completed_at`, `duration_seconds`.
- `routine_exercises` — join entre rutina y ejercicio con `order_index`, `sets_done`, `reps_done`, `weight_used` (nullable).

### Reglas importantes

- RLS activo en todas las tablas. Requiere `GRANT ALL ON TABLE X TO authenticated` explícito para que funcione correctamente.
- El cliente `admin.ts` usa `service_role` y omite RLS — usar solo en Server Components o API Routes para operaciones administrativas.
- Los ejercicios de la app solo los puede crear/editar el admin — nunca desde código del lado usuario.

## Fases de la rutina activa

El componente `active/page.tsx` maneja estas fases en orden estricto:

1. **intro** — animación de cuenta regresiva (¿Listo? → 3 → 2 → 1) con sonido antes de empezar
2. **warmup** — ejercicios de calentamiento dinámicos según los grupos musculares elegidos, con timer individual por ejercicio
3. **exercise** — ejercicios generados aleatoriamente, con stopwatch acumulativo total y registro de peso opcional
4. **rest** — countdown entre series y entre ejercicios
5. **stretching** — estiramientos dinámicos según grupos trabajados, con timer individual
6. **finished** — pantalla de resumen con confeti, tiempo total, series y peso máximo

El timer acumula `totalElapsed` en todas las fases. Se detiene cuando `isPaused === true`.

Los ejercicios de calentamiento y estiramiento se generan dinámicamente según el `slug` del grupo muscular en los objetos `WARMUP_BY_GROUP` y `STRETCHING_BY_GROUP` dentro de `active/page.tsx`.

## Convenciones

- `camelCase` para variables y funciones; `PascalCase` para componentes y tipos.
- Archivos de página: `page.tsx`; layouts: `layout.tsx`.
- Client Components deben tener `'use client'` en la primera línea.
- Server Components por defecto — usar Client Components solo cuando se necesite estado, efectos o interactividad.
- Tipos con `type`, no `interface`, salvo que se necesite extensión.
- No usar `any` sin justificarlo con un comentario inline.
- Estilos solo con clases de Tailwind. Animaciones CSS con `<style>` inline solo si Tailwind no las cubre.
- No definir componentes dentro de otros componentes — causa pérdida de foco en inputs y re-renders innecesarios.
- Usar la forma funcional de `setState` cuando el nuevo estado depende del anterior.
- Usar `useRef` para valores que persisten entre renders sin causar re-render (timers, flags de control).

## Estilo visual

- Tema oscuro por defecto: fondo `gray-950`, superficies `gray-900`, bordes `gray-800`.
- Acento principal: `blue-600` / `blue-500` (hover).
- Colores por fase: calentamiento `yellow-400`, descanso `green-400`, estiramientos `purple-400`.
- Mobile-first: layouts con `max-w-lg mx-auto`, padding `px-6`.
- Sin scroll vertical en pantallas de rutina activa — todo debe caber en el viewport.

## Límites duros

- **Nunca** subir `.env.local` al repositorio — contiene keys de Supabase.
- **No usar** `localStorage` ni `sessionStorage` — Supabase maneja la sesión con cookies vía middleware.
- **No mezclar** el cliente de Supabase de servidor con el de cliente — causará errores de hidratación.
- **No instalar** dependencias nuevas sin justificarlo.
- **No modificar** tablas de Supabase sin actualizar también las políticas RLS y los GRANTs correspondientes.
- **No usar** `any` en TypeScript sin comentario que lo justifique.
- **No definir** componentes dentro de otros componentes.
- **No hardcodear** tiempos de ejercicio fuera de `WARMUP_BY_GROUP` y `STRETCHING_BY_GROUP`.
