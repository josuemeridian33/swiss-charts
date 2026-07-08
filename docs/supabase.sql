-- Swiss Charts — esquema de licencias
-- Se ejecuta en el proyecto Supabase COMPARTIDO "meridian engagement ai".
-- Las tablas/funciones usan prefijo sc_ para NO chocar con tu proyecto existente.

create table if not exists public.sc_licenses (
  code text primary key,
  email text,
  max_uses int not null default 50,
  used int not null default 0,
  source text default 'hotmart',
  transaction text unique,
  created_at timestamptz not null default now()
);

create index if not exists sc_licenses_email_idx on public.sc_licenses (email);

-- Consume 1 uso de forma atómica.
-- Devuelve: usos restantes (>=0), -1 si el código no existe, -2 si está agotada.
create or replace function public.sc_consume_license(p_code text)
returns int
language plpgsql
security definer
as $$
declare
  rem int;
begin
  update public.sc_licenses
     set used = used + 1
   where code = p_code
     and used < max_uses
  returning max_uses - used into rem;

  if not found then
    if exists (select 1 from public.sc_licenses where code = p_code) then
      return -2; -- existe pero está agotada
    else
      return -1; -- no existe
    end if;
  end if;

  return rem;
end;
$$;

-- La tabla se accede solo con la service role key desde el servidor.
alter table public.sc_licenses enable row level security;
