import { useCallback, useEffect, useState } from 'react'
import Aviso from '../components/Aviso.jsx'
import Cargando from '../components/Cargando.jsx'
import { Resena } from '../components/ListaResenas.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { supabase } from '../lib/supabase'

export default function TabResenas({ restaurante }) {
  const [resenas, setResenas] = useState(null)
  const [filtro, setFiltro] = useState('todas')

  const cargar = useCallback(async () => {
    const { data } = await supabase
      .from('resenas')
      .select('id, autor_nombre, estrellas, comentario, foto_url, verificada, creado_en, platos!inner (nombre, restaurante_id), respuestas (id, texto, creado_en)')
      .eq('platos.restaurante_id', restaurante.id)
      .order('creado_en', { ascending: false })
    setResenas(data ?? [])
  }, [restaurante.id])

  useEffect(() => {
    cargar()
  }, [cargar])

  if (resenas === null) return <Cargando />

  const sinResponder = resenas.filter((r) => !(r.respuestas?.texto ?? r.respuestas?.[0]?.texto))
  const visibles = filtro === 'sin-responder' ? sinResponder : resenas

  return (
    <section>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={`chip ${filtro === 'todas' ? 'chip-activo' : ''}`} onClick={() => setFiltro('todas')} aria-pressed={filtro === 'todas'}>
          Todas ({resenas.length})
        </button>
        <button type="button" className={`chip ${filtro === 'sin-responder' ? 'chip-activo' : ''}`} onClick={() => setFiltro('sin-responder')} aria-pressed={filtro === 'sin-responder'}>
          Sin responder ({sinResponder.length})
        </button>
      </div>
      <p className="mt-3 text-sm text-gris">
        Responder muestra a tus clientes que te importa su opinión. Las reseñas no se pueden borrar ni editar: así todos confían en las calificaciones.
      </p>

      {visibles.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-linea bg-white p-6 text-gris">
          {resenas.length === 0 ? 'Todavía no tienes reseñas. Pon tu código QR en las mesas para que tus clientes califiquen tus platos.' : 'Respondiste todas tus reseñas.'}
        </p>
      ) : (
        <div className="mt-4 divide-y divide-linea rounded-3xl border border-linea bg-white px-5">
          {visibles.map((r) => (
            <Resena key={r.id} resena={r}>
              <p className="mt-1 text-sm text-gris">Plato: {r.platos.nombre}</p>
              <Responder resena={r} onGuardado={cargar} />
            </Resena>
          ))}
        </div>
      )}
    </section>
  )
}

function Responder({ resena, onGuardado }) {
  const mostrarToast = useToast()
  const existente = resena.respuestas?.texto ? resena.respuestas : resena.respuestas?.[0]
  const [abierto, setAbierto] = useState(false)
  const [texto, setTexto] = useState(existente?.texto ?? '')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  async function guardar(e) {
    e.preventDefault()
    setEnviando(true)
    setError('')
    const { error: err } = existente
      ? await supabase.from('respuestas').update({ texto: texto.trim() }).eq('id', existente.id)
      : await supabase.from('respuestas').insert({ resena_id: resena.id, texto: texto.trim() })
    setEnviando(false)
    if (err) {
      setError('No se pudo guardar la respuesta. Inténtalo de nuevo.')
      return
    }
    setAbierto(false)
    mostrarToast(existente ? 'Respuesta actualizada.' : `Respondiste a ${resena.autor_nombre}.`)
    onGuardado()
  }

  if (!abierto) {
    return (
      <button type="button" className="mt-2 text-sm font-semibold text-vino hover:underline" onClick={() => setAbierto(true)}>
        {existente ? 'Editar respuesta' : 'Responder'}
      </button>
    )
  }

  return (
    <form onSubmit={guardar} className="animar-aparecer mt-3 flex flex-col gap-2">
      <label htmlFor={`respuesta-${resena.id}`} className="sr-only">
        Tu respuesta
      </label>
      <textarea
        id={`respuesta-${resena.id}`}
        rows={2}
        required
        maxLength={500}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        className="campo"
        placeholder={`Responde a ${resena.autor_nombre}`}
      />
      <Aviso tipo="error">{error}</Aviso>
      <div className="flex gap-2">
        <button type="submit" className="boton" disabled={enviando}>
          {enviando ? 'Publicando…' : 'Publicar respuesta'}
        </button>
        <button type="button" className="boton-secundario" onClick={() => setAbierto(false)}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
