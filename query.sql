-- Roles de usuario
create type user_role as enum ('user', 'admin');

-- Perfil de usuario (extiende el auth de Supabase)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role user_role default 'user',
  created_at timestamp with time zone default timezone('utc', now())
);

-- Grupos musculares
create table muscle_groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  image_url text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Ejercicios
create table exercises (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  muscle_group_id uuid references muscle_groups(id) on delete cascade,
  equipment_type text[] default '{}',
  image_url text,
  gif_url text,
  sets_recommended int default 3,
  reps_recommended int default 12,
  rest_seconds int default 60,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Trigger para crear perfil automáticamente al registrarse
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();



-- ******************************************************************************************************************************************************

  -- RLS para profiles
alter table profiles enable row level security;

create policy "Usuarios ven su propio perfil"
  on profiles for select
  using (auth.uid() = id);

create policy "Usuarios editan su propio perfil"
  on profiles for update
  using (auth.uid() = id);

-- RLS para muscle_groups
alter table muscle_groups enable row level security;

create policy "Todos pueden ver grupos musculares"
  on muscle_groups for select
  to authenticated
  using (true);

create policy "Solo admin puede modificar grupos musculares"
  on muscle_groups for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- RLS para exercises
alter table exercises enable row level security;

create policy "Todos pueden ver ejercicios"
  on exercises for select
  to authenticated
  using (true);

create policy "Solo admin puede modificar ejercicios"
  on exercises for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );




  -- ******************************************************************************************************************************************************


  update profiles
set role = 'admin'
where id = 'de1eb7fd-b7bc-41d9-9514-bd9ff3e15a84';

  -- ******************************************************************************************************************************************************


-- Crear bucket exercises y public bucket activado

create policy "Admin puede subir imágenes"
  on storage.objects for insert
  with check (
    bucket_id = 'exercises' and
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Todos pueden ver imágenes"
  on storage.objects for select
  using (bucket_id = 'exercises');

create policy "Admin puede borrar imágenes"
  on storage.objects for delete
  using (
    bucket_id = 'exercises' and
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ******************************************************************************************************************************************************

   

   -- Elimina las políticas anteriores de profiles
drop policy if exists "Usuarios ven su propio perfil" on profiles;
drop policy if exists "Usuarios editan su propio perfil" on profiles;

-- Crea una política más permisiva para lectura
create policy "Usuarios autenticados ven su propio perfil"
  on profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Usuarios autenticados editan su propio perfil"
  on profiles for update
  to authenticated
  using (auth.uid() = id);


  -- Dar permisos explícitos al service_role
grant all on table profiles to service_role;
grant all on table profiles to authenticated;
grant all on table profiles to anon;


alter table profiles disable row level security;

alter table profiles enable row level security;



grant all on table muscle_groups to service_role;
grant all on table muscle_groups to authenticated;
grant all on table muscle_groups to anon;

grant all on table exercises to service_role;
grant all on table exercises to authenticated;
grant all on table exercises to anon;



-- ******************************************************************************************************************************************************

-- Rutinas generadas
create table routines (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  created_at timestamp with time zone default timezone('utc', now()),
  completed_at timestamp with time zone,
  duration_seconds int,
  notes text
);

-- Ejercicios de cada rutina
create table routine_exercises (
  id uuid default gen_random_uuid() primary key,
  routine_id uuid references routines(id) on delete cascade,
  exercise_id uuid references exercises(id) on delete cascade,
  order_index int,
  sets_done int,
  reps_done int,
  weight_used numeric,
  duration_seconds int
);

-- Permisos
grant all on table routines to service_role;
grant all on table routines to authenticated;
grant all on table routine_exercises to service_role;
grant all on table routine_exercises to authenticated;

-- RLS
alter table routines enable row level security;
alter table routine_exercises enable row level security;

create policy "Usuarios ven sus rutinas"
  on routines for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Usuarios ven sus ejercicios de rutina"
  on routine_exercises for all
  to authenticated
  using (
    exists (
      select 1 from routines
      where id = routine_id and user_id = auth.uid()
    )
  );