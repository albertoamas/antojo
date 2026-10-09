// Si el plato no tiene foto, se muestra una portada con el patrón de sellos y la categoría
const fondos = {
  hamburguesas: 'bg-aji-suave text-vino',
  pizza: 'bg-vino-suave text-vino',
  pollo: 'bg-aji-suave text-vino-oscuro',
  tipica: 'bg-vinedo-suave text-vinedo',
  saltenas: 'bg-aji-suave text-vino',
  sandwiches: 'bg-vino-suave text-vino-oscuro',
  dulces: 'bg-vino-suave text-vino',
  saludable: 'bg-vinedo-suave text-vinedo',
  oriental: 'bg-vinedo-suave text-vino-oscuro',
  parrilla: 'bg-vino-suave text-vino-oscuro',
}

export default function FotoPlato({ url, nombre, categoria, slug, className = '' }) {
  if (url) {
    return <img src={url} alt={nombre} loading="lazy" decoding="async" className={`object-cover ${className}`} />
  }
  return (
    <div
      className={`relative flex items-end overflow-hidden p-2.5 ${fondos[slug] ?? 'bg-vino-suave text-vino'} ${className}`}
      role="img"
      aria-label={`${nombre}, sin foto todavía`}
    >
      <img
        src="/marca/antojo-isotipo.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -top-[18%] -right-[18%] w-[70%] opacity-25"
      />
      <span className="relative font-display text-sm leading-none font-bold">{categoria}</span>
    </div>
  )
}
