import { Navigate, useLocation } from 'react-router-dom'
import Cargando from '../components/Cargando.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function RequiereSesion({ children }) {
  const { usuario, cargando } = useAuth()
  const { pathname } = useLocation()
  if (cargando) return <Cargando />
  if (!usuario) return <Navigate to={`/ingresar?volver=${pathname}&perfil=restaurante`} replace />
  return children
}
