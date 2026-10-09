import { useEffect, useState } from 'react'
import { haceCuanto } from '../lib/formato'
import Avatar from './Avatar.jsx'
import { Estrellas } from './Estrellas.jsx'

export function MarcaVerificada() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-vinedo-suave px-2 py-0.5 text-xs font-semibold text-vinedo">
      <svg viewBox="0 0 16 16" className="size-3" aria-hidden="true">
        <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Verificada en el local
    </span>
  )
}

export function Resena({ resena, nueva = false, children }) {
  const respuesta = resena.respuestas?.[0] ?? resena.respuestas
  return (
    <article className={`-mx-3 flex gap-3 rounded-2xl px-3 py-4 ${nueva ? 'animar-resaltar' : ''}`}>
      <Avatar nombre={resena.autor_nombre} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold">{resena.autor_nombre}</span>
          <span className="text-sm text-gris">{haceCuanto(resena.creado_en)}</span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <Estrellas valor={resena.estrellas} />
          {resena.verificada ? <MarcaVerificada /> : null}
        </div>
        {resena.comentario ? <p className="mt-2 max-w-prose">{resena.comentario}</p> : null}
        {resena.foto_url ? (
          <img src={resena.foto_url} alt={`Foto de ${resena.autor_nombre}`} loading="lazy" className="mt-3 h-44 rounded-xl object-cover" />
        ) : null}
        {respuesta?.texto ? (
          <div className="mt-3 rounded-xl bg-vino-suave/70 px-3.5 py-2.5 text-sm">
            <p className="flex items-center gap-1.5 font-semibold text-vino">
              <img src="/marca/antojo-isotipo-vino.svg" alt="" aria-hidden="true" className="size-4" />
              Respuesta del restaurante
            </p>
            <p className="mt-1">{respuesta.texto}</p>
          </div>
        ) : null}
        {children}
      </div>
    </article>
  )
}

export default function ListaResenas({ resenas, nuevas }) {
  if (resenas.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-linea p-6 text-center text-gris">
        <img src="/marca/antojo-isotipo.svg" alt="" aria-hidden="true" className="mx-auto size-10 opacity-70" />
        <p className="mt-2">Sé la primera persona en reseñar este plato.</p>
      </div>
    )
  }
  return (
    <div className="mt-2 divide-y divide-linea">
      {resenas.map((r) => (
        <Resena key={r.id} resena={r} nueva={nuevas?.has(r.id)} />
      ))}
    </div>
  )
}

// Cuántas reseñas tiene cada cantidad de estrellas
export function Distribucion({ resenas }) {
  const conteo = [0, 0, 0, 0, 0]
  for (const r of resenas) conteo[r.estrellas - 1]++
  const maximo = Math.max(1, ...conteo)
  // Las barras crecen desde cero al mostrarse
  const [listo, setListo] = useState(false)
  useEffect(() => {
    const cuadro = requestAnimationFrame(() => setListo(true))
    return () => cancelAnimationFrame(cuadro)
  }, [])
  return (
    <div className="flex flex-col gap-1.5" aria-label="Distribución de calificaciones">
      {[5, 4, 3, 2, 1].map((n, i) => (
        <div key={n} className="grid grid-cols-[1.25rem_1fr_2rem] items-center gap-2 text-sm" title={`${conteo[n - 1]} reseñas de ${n} estrellas`}>
          <span className="text-right font-semibold text-gris tabular-nums">{n}</span>
          <span className="h-2 overflow-hidden rounded-full bg-linea">
            <span
              className="block h-full origin-left rounded-full bg-aji transition-transform duration-700 ease-out"
              style={{ transform: `scaleX(${listo ? conteo[n - 1] / maximo : 0})`, transitionDelay: `${i * 70}ms` }}
            />
          </span>
          <span className="text-gris tabular-nums">{conteo[n - 1]}</span>
        </div>
      ))}
    </div>
  )
}
