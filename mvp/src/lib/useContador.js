import { useEffect, useState } from 'react'

const sinMovimiento = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Cuenta desde 0 hasta el valor en ~0,8 s para que las cifras "lleguen" al mostrarse
export function useContador(valor, duracion = 800) {
  const [actual, setActual] = useState(0)

  useEffect(() => {
    if (sinMovimiento()) {
      setActual(valor)
      return
    }
    let cuadro
    const inicio = performance.now()
    const paso = (ahora) => {
      const t = Math.min(1, (ahora - inicio) / duracion)
      setActual(Math.round(valor * (1 - (1 - t) ** 3)))
      if (t < 1) cuadro = requestAnimationFrame(paso)
    }
    cuadro = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(cuadro)
  }, [valor, duracion])

  return actual
}
