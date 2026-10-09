import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Aviso from '../components/Aviso.jsx'
import { Esqueleto } from '../components/Esqueleto.jsx'
import FormResena from '../components/FormResena.jsx'
import FotoPlato from '../components/FotoPlato.jsx'
import ListaResenas, { Distribucion } from '../components/ListaResenas.jsx'
import Sello from '../components/Sello.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { registrarEvento } from '../lib/eventos'
import { bs, haceCuanto, precioSinConfirmar } from '../lib/formato'
import { comoLlegarUrl } from '../lib/geo'
import { leerCodigoQr } from '../lib/qr'
import { supabase } from '../lib/supabase'

const CONSULTA_RESENAS = 'id, plato_id, usuario_id, autor_nombre, estrellas, comentario, foto_url, verificada, creado_en, respuestas (id, texto, creado_en)'

export default function Plato() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const mostrarToast = useToast()
  const [plato, setPlato] = useState(undefined)
  const [resenas, setResenas] = useState([])
  const [nuevas, setNuevas] = useState(() => new Set())
  const vistaRegistrada = useRef(null)
  const idsConocidos = useRef(null)

  const cargarResenas = useCallback(async () => {
    const { data } = await supabase
      .from('resenas')
      .select(CONSULTA_RESENAS)
      .eq('plato_id', id)
      .order('verificada', { ascending: false })
      .order('creado_en', { ascending: false })
    const lista = data ?? []
    // Las reseñas que llegan después de la primera carga se resaltan un momento
    if (idsConocidos.current) {
      const recien = lista.filter((r) => !idsConocidos.current.has(r.id)).map((r) => r.id)
      if (recien.length) setNuevas(new Set(recien))
    }
    idsConocidos.current = new Set(lista.map((r) => r.id))
    setResenas(lista)
  }, [id])

  const cargarPlato = useCallback(async () => {
    const { data } = await supabase.from('platos_ranking').select('*').eq('id', id).maybeSingle()
    setPlato(data)
    return data
  }, [id])

  useEffect(() => {
    idsConocidos.current = null
    Promise.all([cargarPlato(), cargarResenas()]).then(([datos]) => {
      if (datos && vistaRegistrada.current !== datos.id) {
        vistaRegistrada.current = datos.id
        registrarEvento({ tipo: 'vista_plato', plato_id: datos.id, restaurante_id: datos.restaurante_id })
      }
    })
  }, [cargarPlato, cargarResenas])

  // En el celular, la barra fija de abajo no debe tapar el pie de página
  useEffect(() => {
    document.body.classList.add('con-barra-inferior')
    return () => document.body.classList.remove('con-barra-inferior')
  }, [])

  // Las reseñas nuevas aparecen al instante (útil en la demo con el QR)
  useEffect(() => {
    const canal = supabase
      .channel(`resenas-plato-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resenas', filter: `plato_id=eq.${id}` }, () => {
        cargarResenas()
        cargarPlato()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(canal)
    }
  }, [id, cargarResenas, cargarPlato])

  if (plato === undefined) return <PlatoEsqueleto />
  if (plato === null) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <img src="/marca/antojo-isotipo.svg" alt="" aria-hidden="true" className="mx-auto size-16" />
        <h1 className="mt-4 text-2xl font-bold">Este plato ya no está disponible</h1>
        <Link to="/" className="boton mt-6">
          Buscar otro plato
        </Link>
      </main>
    )
  }

  const codigoQr = leerCodigoQr(plato.restaurante_id)
  const miResena = usuario ? resenas.find((r) => r.usuario_id === usuario.id) : null
  const llegar = () => registrarEvento({ tipo: 'como_llegar', plato_id: plato.id, restaurante_id: plato.restaurante_id })

  return (
    <main className="mx-auto max-w-5xl pb-8 md:px-4 md:pt-6 md:pb-16">
      <button type="button" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))} className="mb-3 hidden text-sm font-semibold text-gris transition-colors hover:text-vino md:inline-block">
        ← Volver
      </button>

      <div className="relative">
        <div className="overflow-hidden md:rounded-3xl">
          <FotoPlato url={plato.foto_url} nombre={plato.nombre} categoria={plato.categoria} slug={plato.categoria_slug} className="aspect-[16/10] w-full md:aspect-[21/9]" />
        </div>
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
          className="absolute top-3 left-3 grid size-10 place-items-center rounded-full bg-white/90 text-tinta shadow-md backdrop-blur transition-transform active:scale-95 md:hidden"
          aria-label="Volver"
        >
          <svg viewBox="0 0 20 20" className="size-5" aria-hidden="true">
            <path d="M12.5 4.5L7 10l5.5 5.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {plato.foto_url?.includes('themealdb.com') ? (
          <span className="absolute top-3 right-3 rounded-full bg-tinta/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur md:right-auto md:left-3">Foto referencial</span>
        ) : null}
        <div className="absolute right-5 -bottom-12">
          <Sello promedio={plato.promedio} resenas={plato.n_resenas} tamano="enorme" animar retraso={200} />
        </div>
      </div>

      <div className="grid gap-10 px-4 md:grid-cols-[1fr_20rem] md:px-0">
        <div className="min-w-0">
          <p className="animar-aparecer mt-5 pr-32 text-sm font-semibold text-vino">{plato.categoria}</p>
          <h1 className="animar-aparecer mt-1 pr-32 text-3xl leading-tight font-extrabold sm:text-4xl" style={{ '--retraso': '60ms' }}>
            {plato.nombre}
          </h1>
          <p className="animar-aparecer mt-1.5 text-gris" style={{ '--retraso': '120ms' }}>
            en{' '}
            <Link to={`/restaurante/${plato.restaurante_id}`} className="font-semibold text-tinta underline decoration-linea decoration-2 underline-offset-4 transition-colors hover:decoration-vino">
              {plato.restaurante}
            </Link>
            {' · '}
            {plato.zona}
          </p>
          {plato.descripcion ? (
            <p className="animar-aparecer mt-4 max-w-prose text-lg" style={{ '--retraso': '180ms' }}>
              {plato.descripcion}
            </p>
          ) : null}

          <section className="mt-10" aria-labelledby="titulo-resenas">
            <h2 id="titulo-resenas" className="text-2xl font-extrabold">
              Reseñas del plato
            </h2>

            <div className="mt-4 rounded-3xl border border-linea bg-white p-5">
              {usuario ? (
                <FormResena
                  key={miResena?.id ?? 'nueva'}
                  plato={plato}
                  codigoQr={codigoQr}
                  resenaExistente={miResena}
                  onGuardada={(texto) => {
                    mostrarToast(texto)
                    cargarResenas()
                    cargarPlato()
                  }}
                />
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-gris">Ingresa para contar qué tal estuvo este plato.</p>
                  <Link to={`/ingresar?volver=/plato/${plato.id}`} className="boton">
                    Ingresar y reseñar
                  </Link>
                </div>
              )}
            </div>

            {codigoQr && !usuario ? (
              <div className="mt-3">
                <Aviso tipo="exito">Escaneaste el QR de este local: si ingresas ahora, tu reseña quedará verificada.</Aviso>
              </div>
            ) : null}

            <ListaResenas resenas={resenas} nuevas={nuevas} />
          </section>
        </div>

        <aside className="animar-aparecer md:sticky md:top-24 md:mt-16 md:self-start" style={{ '--retraso': '150ms' }}>
          <div className="rounded-3xl border border-linea bg-white p-5">
            <p className="font-display text-3xl font-extrabold text-vinedo tabular-nums">{bs(plato.precio)}</p>
            <p className="text-sm text-gris">
              {precioSinConfirmar(plato.precio_actualizado_en) ? 'Precio sin confirmar' : `Precio actualizado ${haceCuanto(plato.precio_actualizado_en)}`}
            </p>
            <div className="mt-4 hidden flex-col gap-2 md:flex">
              <a href={comoLlegarUrl(plato.lat, plato.lng)} target="_blank" rel="noreferrer" className="boton" onClick={llegar}>
                Cómo llegar
              </a>
              {plato.enlace_delivery ? (
                <a href={plato.enlace_delivery} target="_blank" rel="noreferrer" className="boton-secundario">
                  Pedir a domicilio
                </a>
              ) : null}
              <Link to={`/restaurante/${plato.restaurante_id}`} className="boton-secundario">
                Ver el menú completo
              </Link>
            </div>
            <hr className="my-5 border-linea" />
            <p className="mb-3 text-sm text-gris">
              {plato.n_resenas === 0
                ? 'Todavía no tiene reseñas.'
                : `${plato.n_resenas} ${plato.n_resenas === 1 ? 'reseña' : 'reseñas'}, ${plato.n_verificadas} verificadas en el local`}
            </p>
            <Distribucion resenas={resenas} />
          </div>
        </aside>
      </div>

      {/* Barra fija en el celular: la acción principal siempre a mano */}
      <div className="no-imprimir fixed inset-x-0 bottom-0 z-[900] border-t border-linea bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-display text-xl font-extrabold text-vinedo tabular-nums">{bs(plato.precio)}</p>
            <p className="truncate text-xs text-gris">{plato.restaurante}</p>
          </div>
          {plato.enlace_delivery ? (
            <a href={plato.enlace_delivery} target="_blank" rel="noreferrer" className="boton-secundario px-3">
              Pedir
            </a>
          ) : null}
          <a href={comoLlegarUrl(plato.lat, plato.lng)} target="_blank" rel="noreferrer" className="boton" onClick={llegar}>
            Cómo llegar
          </a>
        </div>
      </div>
    </main>
  )
}

function PlatoEsqueleto() {
  return (
    <main className="mx-auto max-w-5xl md:px-4 md:pt-12" aria-busy="true" aria-label="Cargando plato">
      <Esqueleto className="aspect-[16/10] w-full rounded-none md:aspect-[21/9] md:rounded-3xl" />
      <div className="flex flex-col gap-3 px-4 pt-6 md:px-0">
        <Esqueleto className="h-4 w-24" />
        <Esqueleto className="h-8 w-2/3" />
        <Esqueleto className="h-4 w-1/3" />
      </div>
    </main>
  )
}
