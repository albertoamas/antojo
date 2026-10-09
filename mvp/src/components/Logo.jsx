// Archivos oficiales del manual de marca (public/marca). No redibujar el logo.
const ARCHIVOS = {
  color: '/marca/antojo-logo-horizontal.svg',
  negativo: '/marca/antojo-logo-horizontal-negativo.svg',
}

export default function Logo({ variante = 'color', className = 'h-7' }) {
  return <img src={ARCHIVOS[variante]} alt="Antojo" className={`w-auto ${className}`} draggable="false" />
}

export function Isotipo({ className = 'size-8', blanco = false }) {
  return (
    <img
      src={blanco ? '/marca/antojo-isotipo-blanco.svg' : '/marca/antojo-isotipo.svg'}
      alt=""
      aria-hidden="true"
      className={className}
      draggable="false"
    />
  )
}
