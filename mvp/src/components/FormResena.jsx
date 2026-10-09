import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { subirFoto } from '../lib/fotos'
import { supabase } from '../lib/supabase'
import Aviso from './Aviso.jsx'
import { SelectorEstrellas } from './Estrellas.jsx'
import { MarcaVerificada } from './ListaResenas.jsx'

export default function FormResena({ plato, codigoQr, resenaExistente, onGuardada }) {
  const { usuario, nombre } = useAuth()
  const [estrellas, setEstrellas] = useState(resenaExistente?.estrellas ?? 0)
  const [comentario, setComentario] = useState(resenaExistente?.comentario ?? '')
  const [foto, setFoto] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  async function enviar(e) {
    e.preventDefault()
    if (!estrellas) {
      setMensaje({ tipo: 'error', texto: 'Elige de 1 a 5 estrellas para publicar tu reseña.' })
      return
    }
    setEnviando(true)
    setMensaje(null)
    try {
      const foto_url = foto ? await subirFoto(foto, usuario.id) : resenaExistente?.foto_url ?? null
      const { error } = await supabase.from('resenas').upsert(
        {
          plato_id: plato.id,
          usuario_id: usuario.id,
          autor_nombre: nombre.slice(0, 60),
          estrellas,
          comentario: comentario.trim(),
          foto_url,
          // La base de datos valida el código y decide si la reseña queda verificada
          codigo_qr: codigoQr,
        },
        { onConflict: 'usuario_id,plato_id' },
      )
      if (error) throw new Error('No se pudo publicar la reseña. Inténtalo de nuevo.')
      setFoto(null)
      onGuardada(resenaExistente ? 'Reseña actualizada.' : 'Reseña publicada. Gracias por ayudar a otros a elegir.')
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">{resenaExistente ? 'Tu reseña' : `Reseña como ${nombre}`}</p>
        {codigoQr ? <MarcaVerificada /> : null}
      </div>
      <SelectorEstrellas valor={estrellas} onChange={setEstrellas} />
      <div>
        <label htmlFor="comentario" className="etiqueta">
          Comentario <span className="font-normal text-gris">(opcional)</span>
        </label>
        <textarea
          id="comentario"
          rows={3}
          maxLength={500}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="¿Qué tal el sabor, la porción y el precio?"
          className="campo resize-y"
        />
      </div>
      <div>
        <label htmlFor="foto-resena" className="etiqueta">
          Foto del plato <span className="font-normal text-gris">(opcional)</span>
        </label>
        <input
          id="foto-resena"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-gris file:mr-3 file:rounded-lg file:border-0 file:bg-vino-suave file:px-3 file:py-2 file:font-semibold file:text-vino"
        />
      </div>
      {!codigoQr ? (
        <p className="text-sm text-gris">
          Si estás en el local, escanea el código QR de la mesa: tu reseña quedará verificada y valdrá el doble.
        </p>
      ) : null}
      <Aviso tipo={mensaje?.tipo}>{mensaje?.texto}</Aviso>
      <button type="submit" className="boton self-start" disabled={enviando}>
        {enviando ? 'Publicando…' : resenaExistente ? 'Actualizar reseña' : 'Publicar reseña'}
      </button>
    </form>
  )
}
