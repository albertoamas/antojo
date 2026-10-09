import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import FormRestaurante from './FormRestaurante.jsx'
import RequiereSesion from './RequiereSesion.jsx'

function Formulario() {
  const navigate = useNavigate()

  async function crear(datos) {
    const { data, error } = await supabase.from('restaurantes').insert(datos).select('id').single()
    if (error) throw new Error('No se pudo registrar el restaurante. Revisa los datos e inténtalo de nuevo.')
    navigate(`/panel/${data.id}?tab=platos`, { replace: true })
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pt-8 pb-16">
      <Link to="/panel" className="text-sm font-semibold text-gris hover:text-vino">
        ← Mis restaurantes
      </Link>
      <h1 className="mt-2 text-3xl font-extrabold">Registra tu restaurante</h1>
      <p className="mt-1 mb-6 text-gris">Es gratis. Después podrás cargar tus platos e imprimir tu código QR.</p>
      <FormRestaurante textoBoton="Registrar restaurante" onGuardar={crear} />
    </main>
  )
}

export default function NuevoRestaurante() {
  return (
    <RequiereSesion>
      <Formulario />
    </RequiereSesion>
  )
}
