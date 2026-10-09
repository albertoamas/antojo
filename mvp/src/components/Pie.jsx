import { Link } from 'react-router-dom'
import { BotonInstalar } from './InstalarApp.jsx'
import Logo from './Logo.jsx'

export default function Pie() {
  return (
    <footer className="no-imprimir mt-8 border-t border-linea pb-[env(safe-area-inset-bottom,0px)]">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-8">
        <div className="flex flex-col gap-1.5">
          <Logo className="h-6" />
          <p className="text-sm text-gris">Busca el plato, no el restaurante.</p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-gris">
          <Link to="/" className="hover:text-vino">Buscar platos</Link>
          <Link to="/panel" className="hover:text-vino">Para restaurantes</Link>
          <BotonInstalar />
        </nav>
        <p className="w-full text-xs text-gris">Hecho en Tarija, Bolivia. Ningún restaurante puede pagar para cambiar el ranking.</p>
      </div>
    </footer>
  )
}
