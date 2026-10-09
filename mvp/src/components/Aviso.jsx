const estilos = {
  error: 'border-vino/30 bg-vino-suave text-vino-oscuro',
  exito: 'border-vinedo/30 bg-vinedo-suave text-vinedo',
  info: 'border-aji/50 bg-aji-suave text-tinta',
}

export default function Aviso({ tipo = 'info', children }) {
  if (!children) return null
  return (
    <p role={tipo === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-3.5 py-2.5 text-sm ${estilos[tipo]}`}>
      {children}
    </p>
  )
}
