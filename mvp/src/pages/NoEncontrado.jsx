import { Link } from 'react-router-dom'
import { Isotipo } from '../components/Logo.jsx'

export default function NoEncontrado() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center">
      <div className="animar-flotar inline-block">
        <Isotipo className="size-24" />
      </div>
      <h1 className="mt-6 text-4xl font-extrabold">Esta página se la comieron</h1>
      <p className="mt-2 text-gris">Puede que el enlace esté incompleto o que el plato ya no exista.</p>
      <Link to="/" className="boton mt-6">
        Buscar un plato
      </Link>
    </main>
  )
}
