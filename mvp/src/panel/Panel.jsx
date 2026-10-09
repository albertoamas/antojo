import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../components/Avatar.jsx'
import { Esqueleto } from '../components/Esqueleto.jsx'
import { Isotipo } from '../components/Logo.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase'
import RequiereSesion from './RequiereSesion.jsx'

const NOMBRE_PLAN = { basico: 'Plan Básico', basico_plus: 'Plan Básico+', pro: 'Plan Pro' }

const BENEFICIOS = [
  { titulo: 'Gratis y sin comisión', texto: 'Aparecer en Antojo no cuesta nada y no cobramos por cada venta.' },
  { titulo: 'Reseñas verificadas', texto: 'Tus clientes califican tus platos con el QR de tu mesa.' },
  { titulo: 'Datos de tu negocio', texto: 'Ves cuántas personas miraron cada plato y cuántas fueron a tu local.' },
]

function MisRestaurantes() {
  const { usuario, esAdmin } = useAuth()
  const [restaurantes, setRestaurantes] = useState(null)

  useEffect(() => {
    let consulta = supabase.from('restaurantes').select('id, nombre, tipo, plan, propietario_id, zonas (nombre), platos (count)').order('nombre')
    if (!esAdmin) consulta = consulta.eq('propietario_id', usuario.id)
    consulta.then(({ data }) => setRestaurantes(data ?? []))
  }, [usuario.id, esAdmin])

  return (
    <main className="mx-auto max-w-4xl px-4 pt-8 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="animar-aparecer text-3xl font-extrabold sm:text-4xl">{esAdmin ? 'Todos los restaurantes' : 'Mi restaurante'}</h1>
          <p className="animar-aparecer mt-1 text-gris" style={{ '--retraso': '60ms' }}>
            {esAdmin ? 'Como administrador puedes cargar y editar cualquier local.' : 'Publica tus platos y mira cuántas personas los ven.'}
          </p>
        </div>
        {restaurantes?.length ? (
          <Link to="/panel/nuevo" className="boton animar-aparecer" style={{ '--retraso': '120ms' }}>
            + Registrar un restaurante
          </Link>
        ) : null}
      </div>

      {restaurantes === null ? (
        <div className="mt-8 flex flex-col gap-3">
          <Esqueleto className="h-20 w-full rounded-2xl" />
          <Esqueleto className="h-20 w-full rounded-2xl opacity-70" />
        </div>
      ) : restaurantes.length === 0 ? (
        <section className="animar-aparecer relative mt-8 overflow-hidden rounded-[2rem] bg-vino p-6 text-white sm:p-10">
          <div className="fondo-patron absolute inset-y-0 right-0 w-2/5 opacity-20 [mask-image:linear-gradient(to_left,black,transparent)]" aria-hidden="true" />
          <div className="relative max-w-lg">
            <h2 className="text-3xl leading-tight font-extrabold">Muestra tu mejor plato a quien todavía no te conoce</h2>
            <ul className="mt-6 flex flex-col gap-4">
              {BENEFICIOS.map((b, i) => (
                <li key={b.titulo} className="animar-aparecer flex gap-3" style={{ '--retraso': `${150 + i * 90}ms` }}>
                  <Isotipo className="mt-0.5 size-6 shrink-0" />
                  <span>
                    <strong className="block">{b.titulo}</strong>
                    <span className="text-vino-suave">{b.texto}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link to="/panel/nuevo" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-aji px-5 py-3 font-bold text-vino-oscuro shadow-[0_3px_0_#c98d1d] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none">
              Registrar mi restaurante
            </Link>
          </div>
        </section>
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {restaurantes.map((r, i) => (
            <li key={r.id} className="animar-aparecer" style={{ '--retraso': `${Math.min(i * 50, 400)}ms` }}>
              <Link
                to={`/panel/${r.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-linea bg-white p-4 transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-vino hover:shadow-[0_14px_30px_-22px_rgba(35,26,32,0.5)]"
              >
                <Avatar nombre={r.nombre} className="size-12 text-base" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg font-bold transition-colors group-hover:text-vino">{r.nombre}</p>
                  <p className="truncate text-sm text-gris">
                    {r.tipo} · {r.zonas?.nombre} · {r.platos?.[0]?.count ?? 0} platos
                    {esAdmin && !r.propietario_id ? ' · sin reclamar' : ''}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-aji-suave px-2.5 py-1 text-xs font-semibold">{NOMBRE_PLAN[r.plan]}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default function Panel() {
  return (
    <RequiereSesion>
      <MisRestaurantes />
    </RequiereSesion>
  )
}
