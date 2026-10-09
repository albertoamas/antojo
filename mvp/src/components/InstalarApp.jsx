import { useState } from 'react'
import { useInstalacion } from '../lib/pwa'

const CLAVE = 'antojo-invitacion-instalar-cerrada'

function leerCerrada() {
  try {
    return localStorage.getItem(CLAVE) === '1'
  } catch {
    return false
  }
}

function IconoCompartirIos() {
  return (
    <svg viewBox="0 0 24 24" className="inline size-4 -translate-y-px text-vino" fill="none" stroke="currentColor" strokeWidth="2" aria-label="Compartir">
      <path d="M12 3v12M8 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 11v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8" strokeLinecap="round" />
    </svg>
  )
}

// Tarjeta que invita a instalar Antojo en el celular. Se puede cerrar y no vuelve a aparecer.
export function InvitacionInstalar() {
  const { modo, instalar } = useInstalacion()
  const [cerrada, setCerrada] = useState(leerCerrada)
  const [verPasos, setVerPasos] = useState(false)

  if (!modo || cerrada) return null

  function cerrar() {
    setCerrada(true)
    try {
      localStorage.setItem(CLAVE, '1')
    } catch {
      // Sin almacenamiento, solo se oculta en esta visita
    }
  }

  return (
    <aside className="animar-aparecer mt-6 flex items-start gap-3 rounded-2xl border border-vino/20 bg-vino-suave/60 p-3.5 sm:items-center" style={{ '--retraso': '600ms' }}>
      <img src="/iconos/icono-192.png" alt="" aria-hidden="true" className="size-11 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold">Lleva Antojo en tu celular</p>
        {modo === 'ios' && verPasos ? (
          <p className="mt-0.5 text-gris">
            Toca <IconoCompartirIos /> <strong className="text-tinta">Compartir</strong> en Safari y luego{' '}
            <strong className="text-tinta">Agregar a inicio</strong>.
          </p>
        ) : (
          <p className="mt-0.5 text-gris">Ábrelo como una app, sin pasar por la tienda.</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {modo === 'nativa' ? (
          <button type="button" className="boton px-3 py-1.5 text-sm" onClick={instalar}>
            Instalar
          </button>
        ) : verPasos ? null : (
          <button type="button" className="boton px-3 py-1.5 text-sm" onClick={() => setVerPasos(true)}>
            Cómo instalar
          </button>
        )}
        <button type="button" onClick={cerrar} className="grid size-8 place-items-center rounded-lg text-gris hover:bg-white" aria-label="Cerrar invitación">
          <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </aside>
  )
}

// Enlace discreto para el pie de página
export function BotonInstalar() {
  const { modo, instalar } = useInstalacion()
  const [verPasos, setVerPasos] = useState(false)
  if (!modo) return null
  if (modo === 'nativa') {
    return (
      <button type="button" onClick={instalar} className="text-left font-semibold text-vino hover:underline">
        Instalar la app
      </button>
    )
  }
  return verPasos ? (
    <span className="text-gris">
      En Safari: <IconoCompartirIos /> Compartir → Agregar a inicio
    </span>
  ) : (
    <button type="button" onClick={() => setVerPasos(true)} className="text-left font-semibold text-vino hover:underline">
      Instalar la app
    </button>
  )
}
