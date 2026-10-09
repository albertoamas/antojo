// Guarda el código del QR escaneado mientras dure la visita al local (RF-13).
// La base de datos es la que decide si el código es válido.
const clave = (restauranteId) => `antojo-qr-${restauranteId}`

export function guardarCodigoQr(restauranteId, codigo) {
  try {
    sessionStorage.setItem(clave(restauranteId), codigo)
  } catch {
    // Sin almacenamiento disponible la reseña se publica sin verificar
  }
}

export function leerCodigoQr(restauranteId) {
  try {
    return sessionStorage.getItem(clave(restauranteId))
  } catch {
    return null
  }
}

export function urlDelQr(restauranteId, codigo) {
  return `${window.location.origin}/restaurante/${restauranteId}?qr=${codigo}`
}
