-- =====================================================================
-- Antojo MVP · 04 Cuentas de demostración para el pitch
--
-- ANTES de ejecutar, creen dos cuentas desde la app (Ingresar → Crear cuenta):
--   1. Dueño:   elegir "Tengo un restaurante", nombre "Don Jorge"
--   2. Cliente: elegir "Quiero buscar platos", nombre "Valentina"
--
-- Luego cambien los dos correos de abajo por los que usaron y ejecuten
-- en Supabase: SQL Editor → New query → Run. Se puede ejecutar más de una vez.
-- =====================================================================

do $$
declare
  correo_dueno   text := 'alberto@gmail.com';    -- ← cambiar
  correo_cliente text := 'cecilia@gmail.com';  -- ← cambiar
  id_dueno   uuid;
  id_cliente uuid;
begin
  select id into id_dueno from auth.users where lower(email) = lower(correo_dueno);
  if id_dueno is null then
    raise exception 'No existe una cuenta con el correo %. Créenla primero desde la app.', correo_dueno;
  end if;

  select id into id_cliente from auth.users where lower(email) = lower(correo_cliente);
  if id_cliente is null then
    raise exception 'No existe una cuenta con el correo %. Créenla primero desde la app.', correo_cliente;
  end if;

  -- El dueño administra Burger Lab, que ya tiene reseñas y estadísticas
  update public.restaurantes set propietario_id = id_dueno where nombre = 'Burger Lab';

  -- Perfiles para que cada cuenta entre a su pantalla principal
  update auth.users set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"perfil": "restaurante"}'::jsonb where id = id_dueno;
  update auth.users set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"perfil": "comensal"}'::jsonb where id = id_cliente;

  raise notice 'Listo: % administra Burger Lab y % es la cuenta de cliente.', correo_dueno, correo_cliente;
end $$;

-- Comprobación: debe mostrar Burger Lab con el correo del dueño
select r.nombre as restaurante, u.email as dueno
from public.restaurantes r
join auth.users u on u.id = r.propietario_id
where r.nombre = 'Burger Lab';
