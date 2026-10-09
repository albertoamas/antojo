import { useEffect, useState } from 'react'

// Registra el service worker (solo en producción: en desarrollo interfiere con la recarga en vivo)
export function registrarServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((e) => console.warn('No se registró el service worker', e))
  })
}

// El navegador avisa una sola vez que la app se puede instalar: se guarda el aviso aquí
let avisoGuardado = null
const oyentes = new Set()
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    avisoGuardado = e
    oyentes.forEach((f) => f())
  })
  window.addEventListener('appinstalled', () => {
    avisoGuardado = null
    oyentes.forEach((f) => f())
  })
}

const esIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
export const yaInstalada = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true

// Estado de instalación: "nativa" (Android y computadora), "ios" (instrucciones manuales) o null
export function useInstalacion() {
  const [, forzar] = useState(0)
  useEffect(() => {
    const f = () => forzar((n) => n + 1)
    oyentes.add(f)
    return () => oyentes.delete(f)
  }, [])

  if (yaInstalada()) return { modo: null }
  if (avisoGuardado) {
    return {
      modo: 'nativa',
      instalar: async () => {
        const aviso = avisoGuardado
        avisoGuardado = null
        await aviso.prompt()
        oyentes.forEach((f) => f())
      },
    }
  }
  if (esIos()) return { modo: 'ios' }
  return { modo: null }
}
