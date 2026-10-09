import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import Cargando from '../components/Cargando.jsx'
import { Isotipo } from '../components/Logo.jsx'

// Las presentaciones son páginas propias en public/pitch/ (pantalla completa, sin el encabezado de la app)
const PRESENTACIONES = [
  {
    id: 'alberto',
    nombre: 'Alberto',
    publico: 'Para restaurantes',
    texto: 'Le habla al dueño de un restaurante. La demo empieza en el panel de Burger Lab.',
  },
  {
    id: 'cecilia',
    nombre: 'Cecilia',
    publico: 'Para comensales',
    texto: 'Le habla a quien sale a comer. La demo empieza en el buscador.',
  },
]

export default function Pitch() {
  return (
    <main className="mx-auto max-w-3xl px-4 pt-10 pb-16">
      <h1 className="animar-aparecer text-4xl font-extrabold">Presentación</h1>
      <p className="animar-aparecer mt-2 text-gris" style={{ '--retraso': '60ms' }}>
        1 minuto de pitch y 1 minuto de demo por persona. Al terminar las diapositivas, la flecha → abre la app y empieza el
        cronómetro de la demo.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {PRESENTACIONES.map((p, i) => (
          <li key={p.id} className="animar-aparecer" style={{ '--retraso': `${120 + i * 80}ms` }}>
            <a
              href={`/pitch/${p.id}.html`}
              className="group flex h-full flex-col gap-3 rounded-3xl bg-vino p-6 text-white transition-transform duration-200 hover:-translate-y-1"
            >
              <Isotipo className="size-12 transition-transform duration-300 group-hover:-rotate-12" />
              <span className="text-sm font-semibold text-aji">{p.publico}</span>
              <span className="font-display text-3xl font-extrabold">{p.nombre}</span>
              <span className="text-vino-suave">{p.texto}</span>
              <span className="mt-auto pt-2 font-semibold">Empezar presentación →</span>
            </a>
          </li>
        ))}
      </ul>
      <ul className="mt-8 flex flex-col gap-1.5 text-sm text-gris">
        <li><strong className="text-tinta">→ o espacio:</strong> avanzar (la primera pulsación arranca el cronómetro)</li>
        <li><strong className="text-tinta">←:</strong> retroceder · <strong className="text-tinta">N:</strong> notas con el guion · <strong className="text-tinta">F:</strong> pantalla completa</li>
      </ul>
      <Link to="/" className="mt-8 inline-block text-sm font-semibold text-vino hover:underline">
        Ir a la app sin presentación
      </Link>
    </main>
  )
}

// /pitch/alberto y /pitch/cecilia abren la presentación correspondiente
export function AbrirPitch() {
  const { persona } = useParams()
  const valida = PRESENTACIONES.some((p) => p.id === persona)
  useEffect(() => {
    window.location.replace(valida ? `/pitch/${persona}.html` : '/pitch')
  }, [persona, valida])
  return <Cargando texto="Abriendo la presentación…" />
}
