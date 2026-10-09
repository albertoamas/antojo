import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Aviso from '../components/Aviso.jsx'
import { ListaEsqueleto } from '../components/Esqueleto.jsx'
import { InvitacionInstalar } from '../components/InstalarApp.jsx'
import { Isotipo } from '../components/Logo.jsx'
import TarjetaPlato, { TarjetaDestacada } from '../components/TarjetaPlato.jsx'
import { registrarEvento } from '../lib/eventos'
import { abiertoAhora, normalizar } from '../lib/formato'
import { CENTRO_TARIJA, distanciaKm, pedirUbicacion } from '../lib/geo'
import { compararRanking } from '../lib/ranking'
import { supabase } from '../lib/supabase'
import { useContador } from '../lib/useContador'

const ANTOJOS = ['Hamburguesa', 'Salteña', 'Saice', 'Pizza', 'Pollo', 'Algo dulce', 'Saludable']
const SUGERENCIAS = ['hamburguesa', 'salteña', 'saice', 'algo dulce', 'alitas', 'pizza', 'lomito']
const PRECIOS = [
  { valor: '', texto: 'Cualquier precio' },
  { valor: '15', texto: 'Hasta Bs 15' },
  { valor: '25', texto: 'Hasta Bs 25' },
  { valor: '35', texto: 'Hasta Bs 35' },
  { valor: '50', texto: 'Hasta Bs 50' },
]
const DISTANCIAS = [
  { valor: '', texto: 'Cualquier distancia' },
  { valor: '1', texto: 'Hasta 1 km' },
  { valor: '2', texto: 'Hasta 2 km' },
  { valor: '5', texto: 'Hasta 5 km' },
]

function coincide(plato, palabras) {
  const texto = normalizar(`${plato.nombre} ${plato.categoria} ${plato.sinonimos} ${plato.restaurante} ${plato.descripcion}`)
  return palabras.every((p) => texto.includes(p))
}

export default function Inicio() {
  const [params, setParams] = useSearchParams()
  const [platos, setPlatos] = useState(null)
  const [error, setError] = useState('')
  const [ubicacion, setUbicacion] = useState(CENTRO_TARIJA)
  const [avisoUbicacion, setAvisoUbicacion] = useState('')
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false)
  const [sugerencia, setSugerencia] = useState(0)

  const texto = params.get('q') ?? ''
  const precioMax = params.get('precio') ?? ''
  const distanciaMax = params.get('km') ?? ''
  const soloAbiertos = params.get('abierto') === '1'
  const busqueda = useDeferredValue(texto)
  const filtrosActivos = [precioMax, distanciaMax, soloAbiertos].filter(Boolean).length

  function cambiar(clave, valor) {
    setParams(
      (actual) => {
        const nuevo = new URLSearchParams(actual)
        if (valor) nuevo.set(clave, valor)
        else nuevo.delete(clave)
        return nuevo
      },
      { replace: true },
    )
  }

  function limpiarFiltros() {
    setParams(texto ? { q: texto } : {}, { replace: true })
  }

  useEffect(() => {
    supabase
      .from('platos_ranking')
      .select('*')
      .then(({ data, error: e }) => {
        if (e) setError('No pudimos cargar los platos. Revisa tu conexión y vuelve a intentarlo.')
        else setPlatos(data)
      })
  }, [])

  // El ejemplo del buscador cambia mientras está vacío
  useEffect(() => {
    if (texto) return
    const intervalo = setInterval(() => setSugerencia((s) => (s + 1) % SUGERENCIAS.length), 2400)
    return () => clearInterval(intervalo)
  }, [texto])

  // Registra la búsqueda cuando la persona deja de escribir (estadística "lo más buscado")
  useEffect(() => {
    const termino = normalizar(busqueda)
    if (termino.length < 3) return
    const espera = setTimeout(() => registrarEvento({ tipo: 'busqueda', termino: termino.slice(0, 80) }), 1200)
    return () => clearTimeout(espera)
  }, [busqueda])

  const resultados = useMemo(() => {
    if (!platos) return []
    const palabras = normalizar(busqueda).split(/\s+/).filter(Boolean)
    const lista = []
    for (const plato of platos) {
      if (palabras.length && !coincide(plato, palabras)) continue
      if (precioMax && Number(plato.precio) > Number(precioMax)) continue
      if (soloAbiertos && abiertoAhora(plato.hora_apertura, plato.hora_cierre) === false) continue
      const distancia = distanciaKm(ubicacion, plato)
      if (distanciaMax && distancia > Number(distanciaMax)) continue
      lista.push({ plato, distancia })
    }
    return lista.toSorted((a, b) => compararRanking(a.plato, b.plato))
  }, [platos, busqueda, precioMax, distanciaMax, soloAbiertos, ubicacion])

  const totales = useMemo(() => {
    if (!platos) return { platos: 0, locales: 0, resenas: 0 }
    const locales = new Set()
    let resenas = 0
    for (const p of platos) {
      locales.add(p.restaurante_id)
      resenas += p.n_resenas
    }
    return { platos: platos.length, locales: locales.size, resenas }
  }, [platos])

  async function usarMiUbicacion() {
    setBuscandoUbicacion(true)
    try {
      setUbicacion(await pedirUbicacion())
      setAvisoUbicacion('')
    } catch (e) {
      setUbicacion(CENTRO_TARIJA)
      setAvisoUbicacion(e.message)
    } finally {
      setBuscandoUbicacion(false)
    }
  }

  const [primero, ...resto] = resultados
  // Clave de la lista: al cambiar la búsqueda, los resultados vuelven a entrar en cascada
  const claveLista = `${busqueda}|${precioMax}|${distanciaMax}|${soloAbiertos}`

  return (
    <main className="mx-auto max-w-5xl px-4 pt-8 pb-16 sm:pt-12">
      <section className="grid items-center gap-8 md:grid-cols-[1fr_17rem]">
        <div className="min-w-0">
          <h1 className="animar-aparecer text-[2.6rem] leading-[1.02] font-extrabold tracking-tight sm:text-6xl">¿Qué se te antoja hoy?</h1>
          <p className="animar-aparecer mt-3 max-w-md text-lg text-gris" style={{ '--retraso': '80ms' }}>
            Los mejores platos de Tarija, comparados por sabor y precio.
          </p>

          <form className="animar-aparecer mt-6" style={{ '--retraso': '160ms' }} role="search" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="busqueda" className="sr-only">
              Busca un plato
            </label>
            <div className="group relative">
              <svg className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-vino transition-transform duration-200 group-focus-within:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
              <input
                id="busqueda"
                type="search"
                value={texto}
                onChange={(e) => cambiar('q', e.target.value)}
                placeholder={`Prueba con "${SUGERENCIAS[sugerencia]}"`}
                autoComplete="off"
                className="w-full rounded-2xl border-2 border-vino bg-white py-4 pr-4 pl-12 text-lg font-medium shadow-[0_4px_0_var(--color-vino-suave)] transition-shadow placeholder:font-normal placeholder:text-gris/70 focus:shadow-[0_4px_0_var(--color-aji)] focus:outline-none"
              />
            </div>
          </form>

          <Contadores totales={totales} cargado={platos !== null} />
          <div className="md:hidden">
            <InvitacionInstalar />
          </div>
        </div>

        <div className="relative hidden aspect-square md:block" aria-hidden="true">
          <div className="fondo-patron absolute inset-0 rounded-[2rem] opacity-90" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="animar-flotar">
              <Isotipo className="size-40 drop-shadow-[0_10px_0_rgba(122,31,61,0.25)]" />
            </div>
          </div>
        </div>
      </section>

      <div className="-mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {ANTOJOS.map((antojo, i) => {
          const activo = normalizar(texto) === normalizar(antojo)
          return (
            <button
              key={antojo}
              type="button"
              onClick={() => cambiar('q', activo ? '' : antojo)}
              className={`chip animar-aparecer ${activo ? 'chip-activo' : ''}`}
              style={{ '--retraso': `${220 + i * 35}ms` }}
              aria-pressed={activo}
            >
              {antojo}
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="filtro-precio">
          Precio máximo
        </label>
        <select id="filtro-precio" value={precioMax} onChange={(e) => cambiar('precio', e.target.value)} className={`chip cursor-pointer ${precioMax ? 'chip-activo' : ''}`}>
          {PRECIOS.map((p) => (
            <option key={p.valor} value={p.valor}>
              {p.texto}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="filtro-distancia">
          Distancia máxima
        </label>
        <select id="filtro-distancia" value={distanciaMax} onChange={(e) => cambiar('km', e.target.value)} className={`chip cursor-pointer ${distanciaMax ? 'chip-activo' : ''}`}>
          {DISTANCIAS.map((d) => (
            <option key={d.valor} value={d.valor}>
              {d.texto}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => cambiar('abierto', soloAbiertos ? '' : '1')} className={`chip ${soloAbiertos ? 'chip-activo' : ''}`} aria-pressed={soloAbiertos}>
          <span className={`size-2 rounded-full ${soloAbiertos ? 'bg-white' : 'punto-abierto bg-vinedo'}`} aria-hidden="true" />
          Abierto ahora
        </button>
        {filtrosActivos ? (
          <button type="button" onClick={limpiarFiltros} className="px-2 text-sm font-semibold text-vino hover:underline">
            Quitar filtros ({filtrosActivos})
          </button>
        ) : null}
      </div>

      <p className="mt-3 flex flex-wrap items-center gap-x-1.5 text-sm text-gris">
        <svg viewBox="0 0 24 24" className="size-4 text-vino" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
          <circle cx="12" cy="9.5" r="2.5" />
        </svg>
        Distancias desde <span className="font-semibold text-tinta">{ubicacion.nombre}</span>
        {ubicacion === CENTRO_TARIJA ? (
          <button type="button" onClick={usarMiUbicacion} disabled={buscandoUbicacion} className="font-semibold text-vino underline-offset-2 hover:underline disabled:opacity-60">
            {buscandoUbicacion ? '· Buscando…' : '· Usar mi ubicación'}
          </button>
        ) : null}
      </p>
      {avisoUbicacion ? (
        <div className="mt-2">
          <Aviso>{avisoUbicacion}</Aviso>
        </div>
      ) : null}

      <section className="mt-8" aria-live="polite">
        {error ? (
          <Aviso tipo="error">{error}</Aviso>
        ) : platos === null ? (
          <div className="max-w-2xl">
            <ListaEsqueleto />
          </div>
        ) : resultados.length === 0 ? (
          <SinResultados texto={texto} hayFiltros={filtrosActivos > 0} onElegir={(a) => cambiar('q', a)} onLimpiar={limpiarFiltros} />
        ) : (
          <div key={claveLista} className="grid items-start gap-6 lg:grid-cols-[22rem_1fr]">
            <div className="lg:sticky lg:top-24">
              <div className="mb-3 flex items-baseline justify-between gap-3 px-1">
                <h2 className="text-lg font-bold">
                  {busqueda ? `${resultados.length} ${resultados.length === 1 ? 'plato' : 'platos'} para "${busqueda}"` : 'Lo mejor de Tarija'}
                </h2>
                <ComoOrdenamos />
              </div>
              <TarjetaDestacada plato={primero.plato} distancia={primero.distancia} />
            </div>
            {resto.length ? (
              <ol className="flex flex-col gap-1 lg:pt-9">
                {resto.map(({ plato, distancia }, i) => (
                  <TarjetaPlato key={plato.id} plato={plato} posicion={i + 2} distancia={distancia} indice={i} />
                ))}
              </ol>
            ) : null}
          </div>
        )}
      </section>
    </main>
  )
}

function Contador({ valor, texto }) {
  const actual = useContador(valor)
  return (
    <span>
      <strong className="font-display text-lg text-tinta tabular-nums">{actual}</strong> {texto}
    </span>
  )
}

function Contadores({ totales, cargado }) {
  if (!cargado) return <p className="mt-5 h-7" aria-hidden="true" />
  return (
    <p className="animar-aparecer mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gris">
      <Contador valor={totales.platos} texto="platos" />
      <Contador valor={totales.locales} texto="locales" />
      <Contador valor={totales.resenas} texto="reseñas en Tarija" />
    </p>
  )
}

function SinResultados({ texto, hayFiltros, onElegir, onLimpiar }) {
  return (
    <div className="animar-aparecer mx-auto max-w-xl rounded-3xl border border-dashed border-linea bg-white px-5 py-10 text-center">
      <img src="/marca/antojo-isotipo.svg" alt="" aria-hidden="true" className="mx-auto size-16 opacity-80" />
      <p className="mt-4 font-display text-xl font-bold">{texto ? `No encontramos platos para "${texto}"` : 'No hay platos con estos filtros'}</p>
      <p className="mt-1 text-sm text-gris">Prueba con otro antojo{hayFiltros ? ' o quita algún filtro' : ''}.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {hayFiltros ? (
          <button type="button" className="boton px-3 py-1.5 text-sm" onClick={onLimpiar}>
            Quitar filtros
          </button>
        ) : null}
        {ANTOJOS.slice(0, 4).map((a) => (
          <button key={a} type="button" className="chip" onClick={() => onElegir(a)}>
            {a}
          </button>
        ))}
      </div>
    </div>
  )
}

function ComoOrdenamos() {
  return (
    <details className="group relative text-sm">
      <summary className="cursor-pointer list-none font-semibold text-vino [&::-webkit-details-marker]:hidden">¿Cómo ordenamos?</summary>
      <div className="animar-aparecer absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-linea bg-white p-4 text-left text-gris shadow-xl">
        <p>
          El orden combina la <strong className="text-tinta">calificación del plato (70 %)</strong> y su{' '}
          <strong className="text-tinta">precio frente a platos parecidos (30 %)</strong>.
        </p>
        <p className="mt-2">
          Las reseñas hechas en el local con el código QR valen el doble. Un plato con pocas reseñas no sube al primer lugar por una sola nota alta.
          Ningún restaurante puede pagar para cambiar este orden.
        </p>
      </div>
    </details>
  )
}
