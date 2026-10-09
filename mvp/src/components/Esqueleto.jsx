// Siluetas de carga con brillo: muestran la forma de lo que viene en lugar de un spinner
export function Esqueleto({ className = '' }) {
  return <span className={`esqueleto block rounded-lg ${className}`} aria-hidden="true" />
}

export function ListaEsqueleto({ filas = 5 }) {
  return (
    <ol className="flex flex-col gap-1" aria-label="Cargando platos" aria-busy="true">
      {Array.from({ length: filas }, (_, i) => (
        <li key={i} className="flex items-center gap-3 p-2" style={{ opacity: 1 - i * 0.15 }}>
          <span className="w-5" />
          <Esqueleto className="size-20 shrink-0 rounded-xl" />
          <div className="flex flex-1 flex-col gap-2">
            <Esqueleto className="h-4 w-3/5" />
            <Esqueleto className="h-3 w-2/5" />
            <Esqueleto className="h-3 w-1/4" />
          </div>
          <Esqueleto className="size-12 shrink-0 rounded-full" />
        </li>
      ))}
    </ol>
  )
}
