# Antojo · MVP

Web para buscar platos (no restaurantes) en Tarija, comparados por calificación y precio. Incluye el panel para que los restaurantes publiquen sus platos, respondan reseñas, vean estadísticas e impriman su QR.

Documentación del proyecto: [`../docs/`](../docs/README.md). Arquitectura: [Fase 6](../docs/06-desarrollo-mvp.md).

## Requisitos

- Node.js 20 o superior
- Un proyecto de Supabase (plan gratuito)

## 1. Preparar la base de datos (una sola vez)

En Supabase: **SQL Editor → New query**, pegar y ejecutar con **Run**, en este orden:

1. `supabase/01_esquema.sql`: tablas, seguridad, ranking, fotos y tiempo real.
2. `supabase/02_datos_ejemplo.sql`: locales, platos y reseñas de ejemplo de Tarija.
3. `supabase/03_fotos_temporales.sql` (opcional): fotos referenciales de TheMealDB para los platos de ejemplo. No pisa fotos subidas desde el panel.

## 2. Configurar las claves

Copiar `.env.example` como `.env.local` y completar con los datos de **Connect** (o **Project Settings → API Keys**):

```
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Nunca usar la *secret key* en este archivo.

## 3. Ejecutar

```bash
npm install
npm run dev
```

Abrir http://localhost:5173.

Para probar desde el celular en la misma red wifi: `npm run dev -- --host` y abrir la dirección "Network" que muestra la terminal.

## Preparar la demo

**Asignar un restaurante de ejemplo a una cuenta** (por ejemplo, Burger Lab, que ya tiene reseñas y estadísticas). Primero crear la cuenta en la app y luego, en el SQL Editor:

```sql
update public.restaurantes
set propietario_id = (select id from auth.users where email = 'correo@ejemplo.com')
where nombre = 'Burger Lab';
```

**Dar rol de administrador** (puede ver y editar todos los locales). La persona debe salir y volver a ingresar después:

```sql
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"rol": "admin"}'
where email = 'correo@ejemplo.com';
```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Versión optimizada en `dist/` |
| `npm run preview` | Sirve la versión de `dist/` |
| `npm run lint` | Revisa el código |
