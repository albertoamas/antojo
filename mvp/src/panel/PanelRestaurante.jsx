import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import Avatar from '../components/Avatar.jsx'
import Cargando from '../components/Cargando.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase'
import RequiereSesion from './RequiereSesion.jsx'
import TabPlatos from './TabPlatos.jsx'
import TabResenas from './TabResenas.jsx'

// Gráficos, QR y mapa solo se descargan al abrir su pestaña
const TabEstadisticas = lazy(() => import('./TabEstadisticas.jsx'))
const TabQr = lazy(() => import('./TabQr.jsx'))
const TabDatos = lazy(() => import('./TabDatos.jsx'))

const NOMBRE_PLAN = { basico: 'Plan Básico', basico_plus: 'Plan Básico+', pro: 'Plan Pro' }

const PESTANAS = [
  { id: 'platos', texto: 'Platos' },
  { id: 'resenas', texto: 'Reseñas' },
  { id: 'estadisticas', texto: 'Estadísticas' },
  { id: 'qr', texto: 'Código QR' },
  { id: 'datos', texto: 'Datos del local' },
]

function Contenido() {
  const { id } = useParams()
  const { usuario, esAdmin } = useAuth()
  const [params, setParams] = useSearchParams()
  const [restaurante, setRestaurante] = useState(undefined)
  const pestana = PESTANAS.some((p) => p.id === params.get('tab')) ? params.get('tab') : 'platos'

  const cargar = useCallback(async () => {
    const { data } = await supabase.from('restaurantes').select('*').eq('id', id).maybeSingle()
    setRestaurante(data)
  }, [id])

  useEffect(() => {
    cargar()
  }, [cargar])

  if (restaurante === undefined) return <Cargando />
  if (!restaurante || (restaurante.propietario_id !== usuario.id && !esAdmin)) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">No tienes acceso a este restaurante</h1>
        <p className="mt-2 text-gris">Solo la persona que lo registró puede administrarlo.</p>
        <Link to="/panel" className="boton mt-6">
          Ir a mis restaurantes
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-4 pt-6 pb-16">
      <div className="no-imprimir">
        <Link to="/panel" className="text-sm font-semibold text-gris hover:text-vino">
          ← Mis restaurantes
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar nombre={restaurante.nombre} className="size-14 text-lg animar-estampar" />
            <div className="min-w-0">
              <h1 className="truncate text-3xl font-extrabold">{restaurante.nombre}</h1>
              <p className="text-sm text-gris">
                {restaurante.tipo} · <span className="rounded-full bg-aji-suave px-2 py-0.5 font-semibold text-tinta">{NOMBRE_PLAN[restaurante.plan]}</span>
              </p>
            </div>
          </div>
          <Link to={`/restaurante/${restaurante.id}`} className="boton-secundario text-sm">
            Ver como cliente
          </Link>
        </div>

        <nav className="-mx-4 mt-5 flex gap-1 overflow-x-auto border-b border-linea px-4 [scrollbar-width:none]" aria-label="Secciones del panel">
          {PESTANAS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setParams({ tab: p.id }, { replace: true })}
              aria-current={pestana === p.id ? 'page' : undefined}
              className={`relative shrink-0 px-3 py-3 text-sm font-semibold transition-colors after:absolute after:inset-x-2 after:bottom-0 after:h-[3px] after:rounded-full after:bg-vino after:transition-transform after:duration-300 ${
                pestana === p.id ? 'text-vino after:scale-x-100' : 'text-gris after:scale-x-0 hover:text-tinta'
              }`}
            >
              {p.texto}
            </button>
          ))}
        </nav>
      </div>

      <div key={pestana} className="animar-aparecer mt-6">
        <Suspense fallback={<Cargando />}>
          {pestana === 'platos' ? <TabPlatos restaurante={restaurante} /> : null}
          {pestana === 'resenas' ? <TabResenas restaurante={restaurante} /> : null}
          {pestana === 'estadisticas' ? <TabEstadisticas restaurante={restaurante} /> : null}
          {pestana === 'qr' ? <TabQr restaurante={restaurante} /> : null}
          {pestana === 'datos' ? <TabDatos restaurante={restaurante} onGuardado={cargar} /> : null}
        </Suspense>
      </div>
    </main>
  )
}

export default function PanelRestaurante() {
  return (
    <RequiereSesion>
      <Contenido />
    </RequiereSesion>
  )
}
