// Plaza Luis de Fuentes y Vargas: punto de partida si el usuario no comparte su ubicación
export const CENTRO_TARIJA = { lat: -21.5355, lng: -64.7296, nombre: 'Plaza principal de Tarija' }

const RADIO_TIERRA_KM = 6371
const rad = (grados) => (grados * Math.PI) / 180

export function distanciaKm(a, b) {
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * RADIO_TIERRA_KM * Math.asin(Math.sqrt(h))
}

export function comoLlegarUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

// RNF-07: se pide permiso; si se rechaza, se usa el centro de la ciudad
export function pedirUbicacion() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Tu navegador no permite compartir la ubicación.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, nombre: 'Tu ubicación' }),
      () => reject(new Error('No pudimos obtener tu ubicación. Usamos la plaza principal como referencia.')),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    )
  })
}
