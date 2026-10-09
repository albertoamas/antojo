import { Link } from 'react-router-dom'
import { bs, km } from '../lib/formato'
import FotoPlato from './FotoPlato.jsx'
import Sello from './Sello.jsx'

const retrasoDe = (indice) => `${Math.min(indice * 45, 450)}ms`

export default function TarjetaPlato({ plato, posicion, distancia, indice = 0 }) {
  return (
    <li className="animar-aparecer" style={{ '--retraso': retrasoDe(indice) }}>
      <Link
        to={`/plato/${plato.id}`}
        className="group flex items-center gap-3 rounded-2xl border border-transparent p-2 transition-[background-color,border-color,transform] duration-200 hover:border-linea hover:bg-white active:scale-[0.99]"
      >
        <span className="w-5 shrink-0 text-right font-display text-sm font-bold text-gris tabular-nums">{posicion}</span>
        <div className="size-20 shrink-0 overflow-hidden rounded-xl">
          <FotoPlato
            url={plato.foto_url}
            nombre={plato.nombre}
            categoria={plato.categoria}
            slug={plato.categoria_slug}
            className="size-full transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base leading-tight font-bold transition-colors group-hover:text-vino">{plato.nombre}</h3>
          <p className="truncate text-sm text-gris">
            {plato.restaurante}
            {distancia != null ? ` · ${km(distancia)}` : ''}
          </p>
          <p className="mt-1 text-sm">
            <span className="font-bold text-vinedo tabular-nums">{bs(plato.precio)}</span>
            <span className="text-gris">
              {' · '}
              {plato.n_resenas === 1 ? '1 reseña' : `${plato.n_resenas} reseñas`}
            </span>
          </p>
        </div>
        <div className="transition-transform duration-200 group-hover:-rotate-6">
          <Sello promedio={plato.promedio} resenas={plato.n_resenas} />
        </div>
      </Link>
    </li>
  )
}

// El primer lugar del ranking, con más presencia
export function TarjetaDestacada({ plato, distancia }) {
  return (
    <Link
      to={`/plato/${plato.id}`}
      className="group animar-aparecer relative block overflow-hidden rounded-3xl border border-linea bg-white transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(35,26,32,0.45)]"
    >
      <div className="relative h-44 overflow-hidden sm:h-52">
        <FotoPlato
          url={plato.foto_url}
          nombre={plato.nombre}
          categoria={plato.categoria}
          slug={plato.categoria_slug}
          className="size-full transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-3 left-3 rounded-full bg-vino px-3 py-1 text-xs font-semibold text-white">Primero en el ranking</span>
      </div>
      <div className="absolute top-32 right-4 sm:top-40">
        <Sello promedio={plato.promedio} resenas={plato.n_resenas} tamano="grande" animar retraso={250} />
      </div>
      <div className="p-4 pr-28">
        <h3 className="text-xl leading-tight font-extrabold transition-colors group-hover:text-vino">{plato.nombre}</h3>
        <p className="mt-1 text-sm text-gris">
          {plato.restaurante} · {plato.zona}
          {distancia != null ? ` · ${km(distancia)}` : ''}
        </p>
        <p className="mt-2 text-sm">
          <span className="font-display text-lg font-bold text-vinedo tabular-nums">{bs(plato.precio)}</span>
          <span className="text-gris">
            {' · '}
            {plato.n_resenas} reseñas, {plato.n_verificadas} verificadas en el local
          </span>
        </p>
      </div>
    </Link>
  )
}
