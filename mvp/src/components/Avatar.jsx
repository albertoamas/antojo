const TONOS = ['bg-vino-suave text-vino', 'bg-aji-suave text-vino-oscuro', 'bg-vinedo-suave text-vinedo']

// Iniciales con un tono fijo por nombre: la misma persona siempre tiene el mismo color
export default function Avatar({ nombre = '', className = 'size-9 text-sm' }) {
  const partes = nombre.trim().split(/\s+/)
  const iniciales = ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase() || '?'
  let suma = 0
  for (const letra of nombre) suma += letra.charCodeAt(0)
  return (
    <span className={`grid shrink-0 place-items-center rounded-full font-display font-bold ${TONOS[suma % TONOS.length]} ${className}`} aria-hidden="true">
      {iniciales}
    </span>
  )
}
