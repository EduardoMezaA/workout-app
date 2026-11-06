# 001 · Auth

**Estado:** implementado ✅

## Qué hace

Permite a los usuarios crear una cuenta con correo y contraseña, verificar su email, iniciar sesión y cerrar sesión. Las rutas de la app están protegidas — sin sesión activa, el usuario es redirigido al login automáticamente.

## Por qué

Es la base de toda la app. Sin auth no hay forma de asociar rutinas, progreso ni bitácora a un usuario específico.

## Criterios de aceptación

- [x] El usuario puede registrarse con correo y contraseña.
- [x] Al registrarse recibe un correo de verificación y es redirigido a una pantalla de aviso.
- [x] Al confirmar el email es redirigido a una pantalla de bienvenida con botón llamativo para ir al dashboard.
- [x] El usuario puede iniciar sesión con correo y contraseña.
- [x] Presionar Enter en los inputs de login dispara el submit.
- [x] El usuario puede cerrar sesión desde el dashboard.
- [x] Las rutas protegidas redirigen al login si no hay sesión.
- [x] Si hay sesión activa y el usuario va a login/register, es redirigido al dashboard.
- [x] Los errores de credenciales incorrectas se muestran de forma clara.

## Fuera de alcance

- Login con Google, GitHub u otros proveedores OAuth — puede agregarse en el futuro.
- Recuperación de contraseña desde la UI — actualmente solo disponible desde el panel de Supabase.
- Edición de perfil (nombre, avatar) — feature futura.
