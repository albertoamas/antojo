import { useEffect, useState } from 'react'

const CLAVE = 'antojo-demo'

function leerDemo() {
  try {
    const datos = JSON.parse(sessionStorage.getItem(CLAVE))
    return datos?.inicio ? datos : null
  } catch {
    return null
  }
}

function formato(segundos) {
  const s = Math.max(0, Math.ceil(segundos))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// Cuenta regresiva del minuto de demo que empieza al terminar el pitch (public/pitch/*.html)
export default function CronometroDemo() {
  const [demo, setDemo] = useState(leerDemo)
  const [ahora, setAhora] = useState(() => Date.now())

  useEffect(() => {
    if (!demo) return
    const intervalo = setInterval(() => setAhora(Date.now()), 250)
    return () => clearInterval(intervalo)
  }, [demo])

  if (!demo) return null

  const restante = demo.segundos - (ahora - demo.inicio) / 1000
  const terminado = restante <= 0
  const poco = restante <= 10

  function cerrar() {
    try {
      sessionStorage.removeItem(CLAVE)
    } catch {
      // Sin almacenamiento, solo se oculta
    }
    setDemo(null)
  }

  return (
    <div
      role="timer"
      aria-live="off"
      className={`no-imprimir fixed top-[calc(4.5rem+env(safe-area-inset-top,0px))] right-3 z-[1500] flex items-center gap-2 rounded-full py-1.5 pr-1.5 pl-3.5 text-sm font-bold shadow-lg transition-colors duration-300 ${
        terminado ? 'bg-vino text-white' : poco ? 'bg-aji text-vino-oscuro' : 'bg-tinta text-white'
      }`}
    >
      <span className={`size-2 rounded-full ${terminado ? 'bg-aji' : 'punto-abierto bg-[#86bd93]'}`} aria-hidden="true" />
      <span>
        Demo {demo.persona ? `· ${demo.persona} ` : ''}
        <span className="tabular-nums">{terminado ? 'tiempo cumplido' : formato(restante)}</span>
      </span>
      <button type="button" onClick={cerrar} className="grid size-7 place-items-center rounded-full bg-white/15 hover:bg-white/25" aria-label="Cerrar el cronómetro de la demo">
        <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
