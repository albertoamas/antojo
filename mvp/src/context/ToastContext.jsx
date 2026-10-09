import { createContext, use, useCallback, useMemo, useRef, useState } from 'react'

const ToastContext = createContext(() => {})

const estilos = {
  exito: 'bg-tinta text-white',
  error: 'bg-vino text-white',
}

// Confirmaciones breves ("Plato publicado") que aparecen abajo y se van solas
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const espera = useRef(null)

  const mostrar = useCallback((texto, tipo = 'exito') => {
    clearTimeout(espera.current)
    setToast({ texto, tipo, id: Date.now() })
    espera.current = setTimeout(() => setToast(null), 3200)
  }, [])

  const valor = useMemo(() => mostrar, [mostrar])

  return (
    <ToastContext value={valor}>
      {children}
      <div aria-live="polite" className="no-imprimir">
        {toast ? (
          <div
            key={toast.id}
            role="status"
            className={`fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] left-1/2 z-[2000] flex max-w-[calc(100vw-2rem)] items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold shadow-xl [animation:subir-toast_0.3s_ease-out_both] ${estilos[toast.tipo]}`}
          >
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-aji text-vino-oscuro" aria-hidden="true">
              {toast.tipo === 'error' ? '!' : (
                <svg viewBox="0 0 16 16" className="size-3">
                  <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            {toast.texto}
          </div>
        ) : null}
      </div>
    </ToastContext>
  )
}

export function useToast() {
  return use(ToastContext)
}
