import { useToast } from '../context/ToastContext.jsx'
import { supabase } from '../lib/supabase'
import FormRestaurante from './FormRestaurante.jsx'

export default function TabDatos({ restaurante, onGuardado }) {
  const mostrarToast = useToast()

  async function guardar(datos) {
    const { error } = await supabase.from('restaurantes').update(datos).eq('id', restaurante.id)
    if (error) throw new Error('No se pudieron guardar los cambios. Inténtalo de nuevo.')
    mostrarToast('Guardaste los datos del local.')
    onGuardado()
  }

  return (
    <section className="max-w-2xl">
      <FormRestaurante inicial={restaurante} textoBoton="Guardar cambios" onGuardar={guardar} />
    </section>
  )
}
