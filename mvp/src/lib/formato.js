const formatoBs = new Intl.NumberFormat('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })

export function bs(precio) {
  return `Bs ${formatoBs.format(Number(precio))}`
}

export function km(distancia) {
  if (distancia == null) return ''
  return distancia < 1 ? `${Math.round(distancia * 1000)} m` : `${distancia.toFixed(1).replace('.', ',')} km`
}

export function calificacion(valor) {
  return Number(valor).toFixed(1).replace('.', ',')
}

const relativo = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

export function haceCuanto(fecha) {
  const dias = Math.round((new Date(fecha) - Date.now()) / 86_400_000)
  if (dias > -1) return 'hoy'
  if (dias > -30) return relativo.format(dias, 'day')
  return relativo.format(Math.round(dias / 30), 'month')
}

// RN-05: un precio que no cambia en 60 días se muestra como "sin confirmar"
export function precioSinConfirmar(fecha) {
  return Date.now() - new Date(fecha) > 60 * 86_400_000
}

function minutos(hora) {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

// Soporta horarios que pasan la medianoche (por ejemplo 18:00 a 02:00)
export function abiertoAhora(apertura, cierre, ahora = new Date()) {
  if (!apertura || !cierre) return null
  const actual = ahora.getHours() * 60 + ahora.getMinutes()
  const a = minutos(apertura)
  const c = minutos(cierre)
  return a <= c ? actual >= a && actual < c : actual >= a || actual < c
}

export function horario(apertura, cierre) {
  if (!apertura || !cierre) return 'Horario no informado'
  return `${apertura.slice(0, 5)} a ${cierre.slice(0, 5)}`
}

// Quita tildes y mayúsculas para comparar textos de búsqueda
export function normalizar(texto) {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}
