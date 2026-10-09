import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Aviso from '../components/Aviso.jsx'
import { Esqueleto, ListaEsqueleto } from '../components/Esqueleto.jsx'
import { Isotipo } from '../components/Logo.jsx'
import Sello from '../components/Sello.jsx'
import TarjetaPlato from '../components/TarjetaPlato.jsx'
import { abiertoAhora, horario } from '../lib/formato'
import { comoLlegarUrl } from '../lib/geo'
import { guardarCodigoQr, leerCodigoQr } from '../lib/qr'
import { compararRanking } from '../lib/ranking'
import { supabase } from '../lib/supabase'

const MapaLocal = lazy(() => import('../components/MapaLocal.jsx'))

export default function Restaurante() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const [restaurante, setRestaurante] = useState(undefined)
  const [platos, setPlatos] = useState(null)

  // Llegada desde el QR de la mesa: se guarda el código y se limpia la dirección
  const codigo = params.get('qr')
  const escaneado = Boolean(codigo || leerCodigoQr(id))
  useEffect(() => {
    if (!codigo) return
    guardarCodigoQr(id, codigo)
    setParams({}, { replace: true })
  }, [codigo, id, setParams])

  useEffect(() => {
    Promise.all([
      supabase.from('restaurantes').select('*, zonas (nombre)').eq('id', id).maybeSingle(),
      supabase.from('platos_ranking').select('*').eq('restaurante_id', id),
    ]).then(([r, p]) => {
      setRestaurante(r.data)
      setPlatos((p.data ?? []).toSorted(compararRanking))
    })
  }, [id])

  // Calificación general del local: promedio de sus platos ponderado por reseñas
  const resumen = useMemo(() => {
    if (!platos?.length) return null
    let suma = 0
    let total = 0
    for (const p of platos) {
      if (p.promedio == null) continue
      suma += Number(p.promedio) * p.n_resenas
      total += p.n_resenas
    }
    return total ? { promedio: suma / total, resenas: total } : null
  }, [platos])

  if (restaurante === undefined) {
    return (
      <main className="mx-auto max-w-5xl px-4 pt-6" aria-busy="true">
        <Esqueleto className="h-40 w-full rounded-3xl" />
        <div className="mt-6 max-w-2xl">
          <ListaEsqueleto filas={3} />
        </div>
      </main>
    )
  }
  if (restaurante === null) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Isotipo className="mx-auto size-16" />
        <h1 className="mt-4 text-2xl font-bold">No encontramos este restaurante</h1>
        <Link to="/" className="boton mt-6">
          Volver al inicio
        </Link>
      </main>
    )
  }

  const abierto = abiertoAhora(restaurante.hora_apertura, restaurante.hora_cierre)

  return (
    <main className="mx-auto max-w-5xl px-4 pt-4 pb-16 sm:pt-6">
      <button type="button" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))} className="mb-3 text-sm font-semibold text-gris transition-colors hover:text-vino">
        ← Volver
      </button>
      {escaneado ? (
        <div className="animar-aparecer mb-5 flex items-center gap-3 rounded-2xl bg-vinedo-suave px-4 py-3 text-vinedo">
          <Isotipo className="size-8 shrink-0 animar-estampar" />
          <p className="text-sm font-semibold">
            Estás en {restaurante.nombre}. Elige el plato que comiste para dejar una reseña verificada.
          </p>
        </div>
      ) : null}

      <header className="relative overflow-hidden rounded-3xl bg-vino text-white">
        <div className="fondo-patron absolute inset-y-0 right-0 w-1/2 opacity-20 [mask-image:linear-gradient(to_left,black,transparent)]" aria-hidden="true" />
        <div className="relative flex flex-wrap items-end justify-between gap-5 p-6 sm:p-8">
          <div className="min-w-0">
            <p className="animar-aparecer text-sm font-semibold text-aji">{restaurante.tipo}</p>
            <h1 className="animar-aparecer mt-1 text-3xl leading-tight font-extrabold sm:text-4xl" style={{ '--retraso': '60ms' }}>
              {restaurante.nombre}
            </h1>
            <p className="animar-aparecer mt-1.5 text-vino-suave" style={{ '--retraso': '120ms' }}>
              {restaurante.direccion} · {restaurante.zonas?.nombre}
            </p>
            <p className="animar-aparecer mt-3 flex flex-wrap items-center gap-2 text-sm" style={{ '--retraso': '180ms' }}>
              {abierto === null ? null : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 font-semibold">
                  <span className={`size-2 rounded-full ${abierto ? 'punto-abierto bg-[#86bd93]' : 'bg-vino-suave/70'}`} aria-hidden="true" />
                  {abierto ? 'Abierto ahora' : 'Cerrado ahora'}
                </span>
              )}
              <span className="text-vino-suave">{horario(restaurante.hora_apertura, restaurante.hora_cierre)}</span>
              {restaurante.propietario_id ? null : <span className="text-vino-suave">· Perfil sin reclamar</span>}
            </p>
          </div>
          {resumen ? (
            <div className="flex items-center gap-3">
              <Sello promedio={resumen.promedio} resenas={resumen.resenas} tamano="grande" animar retraso={250} />
              <p className="text-sm text-vino-suave">
                <span className="block font-semibold text-white">{resumen.resenas} reseñas</span>
                de sus platos
              </p>
            </div>
          ) : null}
        </div>
      </header>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
        <section className="min-w-0">
          <h2 className="px-2 text-2xl font-extrabold">Menú</h2>
          <p className="px-2 text-sm text-gris">Ordenado por el ranking de Antojo.</p>
          {platos === null ? (
            <ListaEsqueleto filas={3} />
          ) : platos.length === 0 ? (
            <div className="mt-4">
              <Aviso>Este local todavía no publicó platos.</Aviso>
            </div>
          ) : (
            <ol className="mt-3 flex flex-col gap-1">
              {platos.map((plato, i) => (
                <TarjetaPlato key={plato.id} plato={plato} posicion={i + 1} indice={i} />
              ))}
            </ol>
          )}
        </section>

        <aside className="animar-aparecer lg:sticky lg:top-24" style={{ '--retraso': '200ms' }}>
          <div className="overflow-hidden rounded-3xl border border-linea bg-white">
            <Suspense fallback={<Esqueleto className="h-56 w-full rounded-none" />}>
              <MapaLocal lat={restaurante.lat} lng={restaurante.lng} className="h-56 rounded-none" />
            </Suspense>
            <div className="flex flex-col gap-2 p-4">
              <a href={comoLlegarUrl(restaurante.lat, restaurante.lng)} target="_blank" rel="noreferrer" className="boton">
                Cómo llegar
              </a>
              {restaurante.enlace_delivery ? (
                <a href={restaurante.enlace_delivery} target="_blank" rel="noreferrer" className="boton-secundario">
                  Pedir a domicilio
                </a>
              ) : null}
              {restaurante.telefono ? <p className="text-center text-sm text-gris">Teléfono: {restaurante.telefono}</p> : null}
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
