# 002 · Admin Panel

**Estado:** implementado ✅

## Qué hace

Panel exclusivo para el administrador donde puede crear, editar y eliminar grupos musculares y ejercicios. Incluye subida de imagen estática y GIF demostrativo por ejercicio, almacenados en Supabase Storage.

## Por qué

Los ejercicios son el contenido central de la app. El admin necesita una forma cómoda de gestionarlos sin tocar código ni la consola de Supabase directamente.

## Criterios de aceptación

- [x] Solo usuarios con `role = 'admin'` pueden acceder a `/admin`.
- [x] El admin puede crear grupos musculares con nombre y slug.
- [x] El admin puede eliminar grupos musculares.
- [x] El admin puede crear ejercicios con: nombre, descripción, grupo muscular, equipamiento (uno o varios: bodyweight/dumbbell/gym), series, reps y segundos de descanso.
- [x] El admin puede subir imagen y GIF por ejercicio.
- [x] El admin puede editar ejercicios existentes desde un modal.
- [x] Al editar, si no se sube nuevo archivo, se conserva el anterior.
- [x] Al guardar un ejercicio, el formulario se limpia completamente incluyendo los inputs de archivo.
- [x] Los inputs de texto del modal de edición mantienen el foco al escribir.
- [x] El admin puede eliminar ejercicios.

## Fuera de alcance

- Edición de grupos musculares (solo crear/eliminar por ahora).
- Reordenar ejercicios manualmente.
- Vista previa del GIF antes de subir.
- Gestión de usuarios desde el panel.
