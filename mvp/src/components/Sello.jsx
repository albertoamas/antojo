import { calificacion } from '../lib/formato'

const tamanos = {
  chico: 'size-12 text-base',
  grande: 'size-20 text-2xl',
  enorme: 'size-28 text-4xl',
}

// El sello amarillo es la firma visual de Antojo: la calificación del plato.
// Con "animar" entra estampándose (una sola vez, al aparecer).
export default function Sello({ promedio, resenas = 0, tamano = 'chico', animar = false, retraso = 0 }) {
  const sinResenas = !resenas || promedio == null
  return (
    <div
      className={`relative grid shrink-0 place-items-center rounded-full bg-aji font-display font-extrabold text-vino-oscuro shadow-[0_2px_0_#c98d1d] ${tamanos[tamano]} ${animar ? 'animar-estampar' : ''}`}
      style={animar ? { '--retraso': `${retraso}ms` } : undefined}
      role="img"
      aria-label={sinResenas ? 'Plato sin reseñas todavía' : `Calificación ${calificacion(promedio)} de 5`}
    >
      <span className="absolute inset-[9%] rounded-full border-2 border-dashed border-vino/45" aria-hidden="true" />
      <span className={sinResenas ? 'text-[0.42em] leading-tight font-bold' : 'tabular-nums'}>
        {sinResenas ? 'Nuevo' : calificacion(promedio)}
      </span>
    </div>
  )
}
