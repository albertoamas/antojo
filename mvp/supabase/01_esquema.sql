-- =====================================================================
-- Antojo MVP · 01 Esquema
-- Ejecutar en Supabase: SQL Editor → New query → pegar todo → Run.
-- Crea tablas, reglas de seguridad (RLS), vista de ranking, almacenamiento
-- de fotos y tiempo real. Se puede ejecutar una sola vez sobre un proyecto vacío.
-- Requisitos: docs/05-ingenieria-de-requisitos.md
-- =====================================================================

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- Catálogos: ciudades, zonas y categorías (RNF-09: preparado para escalar)
-- ---------------------------------------------------------------------
create table public.ciudades (
  id bigint generated always as identity primary key,
  nombre text not null unique,
  moneda text not null default 'BOB'
);

create table public.zonas (
  id bigint generated always as identity primary key,
  ciudad_id bigint not null references public.ciudades (id) on delete cascade,
  nombre text not null,
  unique (ciudad_id, nombre)
);

create table public.categorias (
  id bigint generated always as identity primary key,
  nombre text not null unique,
  slug text not null unique,
  -- Palabras alternativas para la búsqueda por antojo (RF-01)
  sinonimos text not null default ''
);

-- ---------------------------------------------------------------------
-- Restaurantes (RF-17)
-- ---------------------------------------------------------------------
create table public.restaurantes (
  id bigint generated always as identity primary key,
  -- null = cargado por el equipo y "sin reclamar" (RF-25)
  propietario_id uuid default auth.uid() references auth.users (id) on delete set null,
  zona_id bigint not null references public.zonas (id),
  nombre text not null check (char_length(nombre) between 2 and 80),
  tipo text not null check (char_length(tipo) between 2 and 60),
  direccion text not null check (char_length(direccion) between 3 and 160),
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  hora_apertura time,
  hora_cierre time,
  telefono text check (char_length(telefono) <= 30),
  enlace_delivery text check (char_length(enlace_delivery) <= 300),
  plan text not null default 'basico' check (plan in ('basico', 'basico_plus', 'pro')),
  creado_en timestamptz not null default now()
);
create index restaurantes_propietario_id_idx on public.restaurantes (propietario_id);
create index restaurantes_zona_id_idx on public.restaurantes (zona_id);

-- Código secreto del QR de cada local (RF-20). Va en una tabla aparte
-- para que solo el dueño pueda leerlo: si fuera público, cualquiera
-- podría marcar sus reseñas como verificadas.
create table public.restaurante_qr (
  restaurante_id bigint primary key references public.restaurantes (id) on delete cascade,
  codigo uuid not null default gen_random_uuid() unique
);

-- ---------------------------------------------------------------------
-- Platos (RF-18)
-- ---------------------------------------------------------------------
create table public.platos (
  id bigint generated always as identity primary key,
  restaurante_id bigint not null references public.restaurantes (id) on delete cascade,
  categoria_id bigint not null references public.categorias (id),
  nombre text not null check (char_length(nombre) between 2 and 80),
  descripcion text not null default '' check (char_length(descripcion) <= 300),
  precio numeric(8, 2) not null check (precio > 0),
  foto_url text check (char_length(foto_url) <= 500),
  disponible boolean not null default true,
  precio_actualizado_en timestamptz not null default now(),
  creado_en timestamptz not null default now()
);
create index platos_restaurante_id_idx on public.platos (restaurante_id);
create index platos_categoria_id_idx on public.platos (categoria_id);

-- ---------------------------------------------------------------------
-- Reseñas (RF-12, RF-13) y respuestas del restaurante (RF-19)
-- ---------------------------------------------------------------------
create table public.resenas (
  id bigint generated always as identity primary key,
  plato_id bigint not null references public.platos (id) on delete cascade,
  usuario_id uuid default auth.uid() references auth.users (id) on delete set null,
  autor_nombre text not null check (char_length(autor_nombre) between 1 and 60),
  estrellas smallint not null check (estrellas between 1 and 5),
  comentario text not null default '' check (char_length(comentario) <= 500),
  foto_url text check (char_length(foto_url) <= 500),
  -- Lo decide la base de datos, nunca el cliente (ver private.verificar_resena)
  verificada boolean not null default false,
  -- El cliente envía aquí el código del QR escaneado; el trigger lo valida y lo borra
  codigo_qr uuid,
  creado_en timestamptz not null default now(),
  -- RN-02 simplificada para el MVP: una reseña por persona y plato (se puede editar)
  unique (usuario_id, plato_id)
);
create index resenas_plato_id_idx on public.resenas (plato_id);

create table public.respuestas (
  id bigint generated always as identity primary key,
  resena_id bigint not null unique references public.resenas (id) on delete cascade,
  texto text not null check (char_length(texto) between 1 and 500),
  creado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Eventos para las estadísticas del restaurante (RF-21)
-- ---------------------------------------------------------------------
create table public.eventos (
  id bigint generated always as identity primary key,
  tipo text not null check (tipo in ('vista_plato', 'como_llegar', 'busqueda')),
  plato_id bigint references public.platos (id) on delete cascade,
  restaurante_id bigint references public.restaurantes (id) on delete cascade,
  termino text check (char_length(termino) <= 80),
  zona_id bigint references public.zonas (id) on delete set null,
  creado_en timestamptz not null default now(),
  check ((tipo = 'busqueda') = (plato_id is null))
);
create index eventos_plato_id_idx on public.eventos (plato_id);
create index eventos_restaurante_id_idx on public.eventos (restaurante_id);
create index eventos_zona_id_idx on public.eventos (zona_id);
create index eventos_tipo_creado_en_idx on public.eventos (tipo, creado_en);

-- ---------------------------------------------------------------------
-- Funciones internas (esquema private, no expuesto por la API)
-- ---------------------------------------------------------------------

-- Crea el código QR de cada restaurante nuevo
create or replace function private.crear_qr_restaurante()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.restaurante_qr (restaurante_id) values (new.id);
  return new;
end;
$$;

create trigger restaurantes_crear_qr
  after insert on public.restaurantes
  for each row execute function private.crear_qr_restaurante();

-- Marca la reseña como verificada solo si el código del QR corresponde
-- al restaurante del plato (RF-13, RN-03). Necesita leer restaurante_qr,
-- que los clientes no pueden ver, por eso es security definer.
create or replace function private.verificar_resena()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.verificada := false;
  else
    new.verificada := old.verificada;
  end if;

  if new.codigo_qr is not null then
    new.verificada := new.verificada or exists (
      select 1
      from public.restaurante_qr q
      join public.platos p on p.restaurante_id = q.restaurante_id
      where p.id = new.plato_id and q.codigo = new.codigo_qr
    );
  end if;

  new.codigo_qr := null;
  return new;
end;
$$;

create trigger resenas_verificar
  before insert or update on public.resenas
  for each row execute function private.verificar_resena();

-- Registra cuándo cambió el precio (RN-05)
create or replace function private.marcar_cambio_precio()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.precio is distinct from old.precio then
    new.precio_actualizado_en := now();
  end if;
  return new;
end;
$$;

create trigger platos_cambio_precio
  before update on public.platos
  for each row execute function private.marcar_cambio_precio();

revoke execute on function private.crear_qr_restaurante() from public, anon, authenticated;
revoke execute on function private.verificar_resena() from public, anon, authenticated;
revoke execute on function private.marcar_cambio_precio() from public, anon, authenticated;

-- ---------------------------------------------------------------------
-- Vista del ranking (RF-02, RN-04)
-- puntaje = 70 % calificación ajustada + 30 % índice de precio
-- · calificación ajustada: promedio bayesiano con 5 votos de referencia
--   del promedio de la categoría; las reseñas verificadas pesan el doble
-- · índice de precio: 1 = el más barato de su categoría, 0 = el más caro
-- ---------------------------------------------------------------------
create view public.platos_ranking
with (security_invoker = true)
as
with stats as (
  select
    plato_id,
    count(*) as n_resenas,
    count(*) filter (where verificada) as n_verificadas,
    sum(case when verificada then 2 else 1 end) as peso,
    sum(estrellas * case when verificada then 2 else 1 end)::numeric as suma
  from public.resenas
  group by plato_id
),
base as (
  select
    p.id,
    p.nombre,
    p.descripcion,
    p.precio,
    p.foto_url,
    p.precio_actualizado_en,
    p.restaurante_id,
    p.categoria_id,
    c.nombre as categoria,
    c.slug as categoria_slug,
    c.sinonimos,
    r.nombre as restaurante,
    r.tipo as restaurante_tipo,
    r.direccion,
    r.lat,
    r.lng,
    r.zona_id,
    z.nombre as zona,
    r.hora_apertura,
    r.hora_cierre,
    r.enlace_delivery,
    coalesce(s.n_resenas, 0) as n_resenas,
    coalesce(s.n_verificadas, 0) as n_verificadas,
    coalesce(s.peso, 0) as peso,
    s.suma / nullif(s.peso, 0) as promedio
  from public.platos p
  join public.categorias c on c.id = p.categoria_id
  join public.restaurantes r on r.id = p.restaurante_id
  join public.zonas z on z.id = r.zona_id
  left join stats s on s.plato_id = p.id
  where p.disponible
),
por_categoria as (
  select categoria_id, avg(promedio) as promedio_categoria
  from base
  group by categoria_id
),
calculado as (
  select
    b.*,
    (b.peso * coalesce(b.promedio, 0) + 5 * coalesce(pc.promedio_categoria, 3.5)) / (b.peso + 5)
      as calificacion_ajustada,
    1 - percent_rank() over (partition by b.categoria_id order by b.precio) as indice_precio
  from base b
  join por_categoria pc on pc.categoria_id = b.categoria_id
)
select
  id, nombre, descripcion, precio, foto_url, precio_actualizado_en,
  restaurante_id, categoria_id, categoria, categoria_slug, sinonimos,
  restaurante, restaurante_tipo, direccion, lat, lng, zona_id, zona,
  hora_apertura, hora_cierre, enlace_delivery,
  n_resenas, n_verificadas,
  round(promedio, 1) as promedio,
  round(calificacion_ajustada, 2) as calificacion_ajustada,
  round(indice_precio::numeric, 3) as indice_precio,
  round(0.7 * (calificacion_ajustada / 5) + 0.3 * indice_precio::numeric, 4) as puntaje
from calculado;

-- ---------------------------------------------------------------------
-- Permisos de la API (las tablas nuevas no se exponen solas)
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on public.ciudades, public.zonas, public.categorias to anon, authenticated;
grant select on public.restaurantes, public.platos, public.resenas, public.respuestas to anon, authenticated;
grant select on public.platos_ranking to anon, authenticated;

grant insert, update, delete on public.restaurantes, public.platos, public.resenas, public.respuestas to authenticated;
grant select on public.restaurante_qr to authenticated;
grant insert on public.eventos to anon, authenticated;
grant select on public.eventos to authenticated;

-- ---------------------------------------------------------------------
-- Seguridad por filas (RLS)
-- Administrador: usuario con app_metadata.rol = 'admin' (lo asigna el equipo)
-- ---------------------------------------------------------------------
alter table public.ciudades enable row level security;
alter table public.zonas enable row level security;
alter table public.categorias enable row level security;
alter table public.restaurantes enable row level security;
alter table public.restaurante_qr enable row level security;
alter table public.platos enable row level security;
alter table public.resenas enable row level security;
alter table public.respuestas enable row level security;
alter table public.eventos enable row level security;

-- Catálogos: lectura pública
create policy "Catálogo de ciudades visible para todos" on public.ciudades
  for select to anon, authenticated using (true);
create policy "Catálogo de zonas visible para todos" on public.zonas
  for select to anon, authenticated using (true);
create policy "Catálogo de categorías visible para todos" on public.categorias
  for select to anon, authenticated using (true);

-- Restaurantes
create policy "Restaurantes visibles para todos" on public.restaurantes
  for select to anon, authenticated using (true);
create policy "Usuarios registran su propio restaurante" on public.restaurantes
  for insert to authenticated
  with check (
    propietario_id = (select auth.uid())
    or ((select auth.jwt()) -> 'app_metadata' ->> 'rol') = 'admin'
  );
create policy "Dueños editan su restaurante" on public.restaurantes
  for update to authenticated
  using (
    propietario_id = (select auth.uid())
    or ((select auth.jwt()) -> 'app_metadata' ->> 'rol') = 'admin'
  )
  with check (
    propietario_id = (select auth.uid())
    or ((select auth.jwt()) -> 'app_metadata' ->> 'rol') = 'admin'
  );
create policy "Dueños eliminan su restaurante" on public.restaurantes
  for delete to authenticated
  using (
    propietario_id = (select auth.uid())
    or ((select auth.jwt()) -> 'app_metadata' ->> 'rol') = 'admin'
  );

-- Código QR: solo el dueño
create policy "Dueños ven el QR de su restaurante" on public.restaurante_qr
  for select to authenticated
  using (
    exists (
      select 1 from public.restaurantes r
      where r.id = restaurante_id
        and (
          r.propietario_id = (select auth.uid())
          or ((select auth.jwt()) -> 'app_metadata' ->> 'rol') = 'admin'
        )
    )
  );

-- Platos
create policy "Platos visibles para todos" on public.platos
  for select to anon, authenticated using (true);
create policy "Dueños agregan platos a su restaurante" on public.platos
  for insert to authenticated
  with check (
    exists (
      select 1 from public.restaurantes r
      where r.id = restaurante_id
        and (
          r.propietario_id = (select auth.uid())
          or ((select auth.jwt()) -> 'app_metadata' ->> 'rol') = 'admin'
        )
    )
  );
create policy "Dueños editan los platos de su restaurante" on public.platos
  for update to authenticated
  using (
    exists (
      select 1 from public.restaurantes r
      where r.id = restaurante_id
        and (
          r.propietario_id = (select auth.uid())
          or ((select auth.jwt()) -> 'app_metadata' ->> 'rol') = 'admin'
        )
    )
  )
  with check (
    exists (
      select 1 from public.restaurantes r
      where r.id = restaurante_id
        and (
          r.propietario_id = (select auth.uid())
          or ((select auth.jwt()) -> 'app_metadata' ->> 'rol') = 'admin'
        )
    )
  );
create policy "Dueños eliminan los platos de su restaurante" on public.platos
  for delete to authenticated
  using (
    exists (
      select 1 from public.restaurantes r
      where r.id = restaurante_id
        and (
          r.propietario_id = (select auth.uid())
          or ((select auth.jwt()) -> 'app_metadata' ->> 'rol') = 'admin'
        )
    )
  );

-- Reseñas: todos leen; cada persona gestiona solo las suyas (RN-06: el dueño no puede borrarlas)
create policy "Reseñas visibles para todos" on public.resenas
  for select to anon, authenticated using (true);
create policy "Usuarios publican sus reseñas" on public.resenas
  for insert to authenticated
  with check (usuario_id = (select auth.uid()));
create policy "Usuarios editan sus reseñas" on public.resenas
  for update to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));
create policy "Usuarios eliminan sus reseñas" on public.resenas
  for delete to authenticated
  using (usuario_id = (select auth.uid()));

-- Respuestas: solo el dueño del restaurante del plato reseñado
create policy "Respuestas visibles para todos" on public.respuestas
  for select to anon, authenticated using (true);
create policy "Dueños responden reseñas de sus platos" on public.respuestas
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.resenas rs
      join public.platos p on p.id = rs.plato_id
      join public.restaurantes r on r.id = p.restaurante_id
      where rs.id = resena_id and r.propietario_id = (select auth.uid())
    )
  );
create policy "Dueños editan sus respuestas" on public.respuestas
  for update to authenticated
  using (
    exists (
      select 1
      from public.resenas rs
      join public.platos p on p.id = rs.plato_id
      join public.restaurantes r on r.id = p.restaurante_id
      where rs.id = resena_id and r.propietario_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.resenas rs
      join public.platos p on p.id = rs.plato_id
      join public.restaurantes r on r.id = p.restaurante_id
      where rs.id = resena_id and r.propietario_id = (select auth.uid())
    )
  );
create policy "Dueños eliminan sus respuestas" on public.respuestas
  for delete to authenticated
  using (
    exists (
      select 1
      from public.resenas rs
      join public.platos p on p.id = rs.plato_id
      join public.restaurantes r on r.id = p.restaurante_id
      where rs.id = resena_id and r.propietario_id = (select auth.uid())
    )
  );

-- Eventos: cualquiera registra; el dueño ve los de su restaurante y todos ven las búsquedas
create policy "Cualquiera registra eventos" on public.eventos
  for insert to anon, authenticated
  with check (
    (tipo = 'busqueda' and plato_id is null and restaurante_id is null)
    or (
      tipo in ('vista_plato', 'como_llegar')
      and exists (
        select 1 from public.platos p
        where p.id = plato_id and p.restaurante_id = eventos.restaurante_id
      )
    )
  );
create policy "Dueños ven los eventos de su restaurante" on public.eventos
  for select to authenticated
  using (
    tipo = 'busqueda'
    or exists (
      select 1 from public.restaurantes r
      where r.id = restaurante_id
        and (
          r.propietario_id = (select auth.uid())
          or ((select auth.jwt()) -> 'app_metadata' ->> 'rol') = 'admin'
        )
    )
  );

-- ---------------------------------------------------------------------
-- Fotos: bucket público de lectura; cada usuario sube solo a su carpeta
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create policy "Usuarios suben fotos a su carpeta" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'fotos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "Usuarios eliminan sus fotos" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'fotos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ---------------------------------------------------------------------
-- Tiempo real: las reseñas nuevas aparecen al instante en la ficha del plato
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table public.resenas;
