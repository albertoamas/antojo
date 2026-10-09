import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase'
import Avatar from './Avatar.jsx'
import Logo from './Logo.jsx'

const enlace = ({ isActive }) =>
  `relative rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-colors after:absolute after:inset-x-2.5 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-vino after:transition-transform after:duration-200 ${
    isActive ? 'text-vino after:scale-x-100' : 'text-gris after:scale-x-0 hover:text-tinta'
  }`

export default function Encabezado() {
  const { usuario, nombre, esRestaurante } = useAuth()
  const navigate = useNavigate()
  const [conSombra, setConSombra] = useState(false)

  // Sombra suave solo cuando la página ya se desplazó
  useEffect(() => {
    const alDesplazar = () => setConSombra(window.scrollY > 4)
    alDesplazar()
    window.addEventListener('scroll', alDesplazar, { passive: true })
    return () => window.removeEventListener('scroll', alDesplazar)
  }, [])

  async function salir() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <header
      className={`no-imprimir sticky top-[env(safe-area-inset-top,0px)] z-[1000] border-b bg-fondo/85 backdrop-blur-md transition-[border-color,box-shadow] duration-300 ${
        conSombra ? 'border-linea shadow-[0_6px_20px_-14px_rgba(35,26,32,0.35)]' : 'border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
        <Link to="/" aria-label="Antojo, ir al inicio" className="group transition-transform duration-200 hover:-rotate-2">
          <Logo className="h-7 sm:h-8" />
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/panel" className={enlace}>
            <span className="hidden sm:inline">{esRestaurante ? 'Mi restaurante' : 'Para restaurantes'}</span>
            <span className="sm:hidden">{esRestaurante ? 'Mi local' : 'Restaurantes'}</span>
          </NavLink>
          {usuario ? (
            <div className="ml-1 flex items-center gap-2">
              <Avatar nombre={nombre} className="size-8 text-xs" />
              <button type="button" onClick={salir} className="rounded-lg px-2 py-1.5 text-sm font-semibold text-gris transition-colors hover:text-tinta">
                Salir
              </button>
            </div>
          ) : (
            <Link to="/ingresar" className="boton ml-1 px-3.5 py-2 text-sm">
              Ingresar
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
