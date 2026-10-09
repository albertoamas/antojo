export default function Cargando({ texto = 'Cargando…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-gris" role="status">
      <img src="/marca/antojo-isotipo.svg" alt="" aria-hidden="true" className="size-10 animate-spin [animation-duration:1.6s]" />
      {texto}
    </div>
  )
}
