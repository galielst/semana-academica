-- Habilitar RLS por seguridad
alter table if exists public.profiles enable row level security;
alter table if exists public.events enable row level security;
alter table if exists public.registrations enable row level security;
alter table if exists public.attendance enable row level security;

-- Tabla de perfiles (1 a 1 con auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  role text check (role in ('admin','alumno')) default 'alumno',
  full_name text,
  phone text,
  created_at timestamp with time zone default now()
);

-- Tabla de eventos
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text check (type in ('taller','conferencia')) not null,
  starts_at timestamp with time zone not null,
  capacity int not null check (capacity > 0),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Tabla de registros (inscripciones)
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  created_at timestamp with time zone default now(),
  checked_in_at timestamp with time zone
);
create unique index if not exists registrations_unique on public.registrations(user_id, event_id);

-- Tabla de asistencia (cada escaneo)
create table if not exists public.attendance (
  id bigserial primary key,
  registration_id uuid not null references public.registrations(id) on delete cascade,
  scanned_at timestamp with time zone default now()
);
create index if not exists attendance_reg_idx on public.attendance(registration_id);

-- Conteo de inscritos por evento
create or replace view public.events_counts as
select e.*, coalesce(count(r.id),0)::int as registered_count
from events e
left join registrations r on r.event_id = e.id
group by e.id;

-- RPC para traer eventos con conteo
create or replace function public.events_with_counts()
returns setof events_counts language sql stable as $$
  select * from events_counts order by starts_at asc;
$$;

-- Vista para "Mis registros"
create or replace view public.registrations_view as
select r.id, r.user_id, r.event_id, e.title, e.type, e.starts_at
from registrations r
join events e on e.id = r.event_id;

-- Vista para admin
create or replace view public.registrations_admin_view as
select r.id, r.event_id, p.email as user_email, p.full_name, p.phone, r.checked_in_at, e.title
from registrations r
join profiles p on p.id = r.user_id
join events e on e.id = r.event_id;

-- RLS policies
create policy if not exists "profiles select own or admin" on public.profiles
for select using (
  auth.uid() = id or exists(select 1 from public.profiles ap where ap.id = auth.uid() and ap.role = 'admin')
);
create policy if not exists "profiles update own or admin" on public.profiles
for update using (
  auth.uid() = id or exists(select 1 from public.profiles ap where ap.id = auth.uid() and ap.role = 'admin')
);
create policy if not exists "profiles insert self" on public.profiles
for insert with check ( auth.uid() = id );

create policy if not exists "events read all" on public.events for select using ( true );
create policy if not exists "events insert admin" on public.events for insert with check (
  exists(select 1 from public.profiles ap where ap.id = auth.uid() and ap.role = 'admin')
);
create policy if not exists "events delete admin" on public.events for delete using (
  exists(select 1 from public.profiles ap where ap.id = auth.uid() and ap.role = 'admin')
);

create policy if not exists "regs select own or admin" on public.registrations for select using (
  user_id = auth.uid() or exists(select 1 from public.profiles ap where ap.id = auth.uid() and ap.role = 'admin')
);
create policy if not exists "regs insert own" on public.registrations for insert with check (
  user_id = auth.uid()
);
create policy if not exists "regs update own or admin" on public.registrations for update using (
  user_id = auth.uid() or exists(select 1 from public.profiles ap where ap.id = auth.uid() and ap.role = 'admin')
);
create policy if not exists "regs delete admin" on public.registrations for delete using (
  exists(select 1 from public.profiles ap where ap.id = auth.uid() and ap.role = 'admin')
);

create policy if not exists "attendance admin select" on public.attendance for select using (
  exists(select 1 from public.profiles ap where ap.id = auth.uid() and ap.role = 'admin')
);
create policy if not exists "attendance admin insert" on public.attendance for insert with check (
  exists(select 1 from public.profiles ap where ap.id = auth.uid() and ap.role = 'admin')
);

-- Trigger anti-sobrecupo
create or replace function public.prevent_overbooking()
returns trigger language plpgsql as $$
begin
  if (select count(*) from registrations where event_id = NEW.event_id) >= (select capacity from events where id = NEW.event_id) then
    raise exception 'Cupo lleno';
  end if;
  return NEW;
end; $$;

drop trigger if exists trg_prevent_overbooking on public.registrations;
create trigger trg_prevent_overbooking before insert on public.registrations
for each row execute function public.prevent_overbooking();
