# 001 · Auth — Plan

## Enfoque

Supabase Auth maneja toda la lógica de autenticación. Next.js con App Router usa Server Components para verificar sesión en el servidor y el middleware (`src/proxy.ts`) para proteger rutas a nivel de request, antes de que la página se renderice.

## Implementación

1. Configurar clientes de Supabase — `src/lib/supabase/client.ts` (browser), `src/lib/supabase/server.ts` (SSR con cookies), `src/lib/supabase/admin.ts` (service_role).
2. Crear middleware en `src/proxy.ts` — intercepta cada request, verifica sesión y redirige según el estado.
3. Crear páginas de auth en `src/app/(auth)/` — login, register, verify-email.
4. Crear página de confirmación en `src/app/auth/confirm/` — recibe al usuario tras hacer clic en el link del email.
5. Crear `src/components/LogoutButton.tsx` — Client Component que llama a `supabase.auth.signOut()`.
6. Configurar trigger en Supabase — crea un perfil en `profiles` automáticamente al registrarse.
7. Configurar `emailRedirectTo` en el registro para apuntar a `/auth/confirm`.

## Decisiones

- **Route Group `(auth)`** — agrupa las páginas de auth sin afectar la URL, permite layouts separados.
- **Middleware en `proxy.ts`** — renombrado desde `middleware.ts` por deprecación en Next.js 15.
- **Verificación de sesión en Server Components** — más seguro que solo validar en el cliente; el usuario nunca ve contenido protegido sin sesión válida.
- **`createAdminClient()` para leer profiles en el layout de admin** — el RLS bloqueaba la consulta con el cliente normal; service_role la omite de forma controlada.

## Riesgos

- **Stale session** — si el token expira mientras el usuario está en la app, el middleware lo redirige al login en la siguiente navegación. No hay manejo de refresh automático en el cliente.
- **Confirmar email** — si el usuario no confirma, no puede entrar. No hay reenvío de correo desde la UI actualmente.
