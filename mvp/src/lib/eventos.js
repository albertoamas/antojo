import { supabase } from './supabase'

// Registra vistas, clics y búsquedas para las estadísticas del restaurante (RF-21).
// No se usa .select(): los visitantes pueden insertar eventos, pero no leerlos.
export function registrarEvento(evento) {
  supabase
    .from('eventos')
    .insert(evento)
    .then(({ error }) => {
      if (error) console.warn('No se registró el evento', error.message)
    })
}
