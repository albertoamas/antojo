// Orden del ranking (RN-04). Los platos sin reseñas van después de los calificados:
// así un plato barato pero sin opiniones no aparece arriba de uno probado.
export function compararRanking(a, b) {
  const conA = a.n_resenas > 0 ? 1 : 0
  const conB = b.n_resenas > 0 ? 1 : 0
  if (conA !== conB) return conB - conA
  return Number(b.puntaje) - Number(a.puntaje)
}
