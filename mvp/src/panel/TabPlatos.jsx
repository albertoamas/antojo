import { useCallback, useEffect, useMemo, useState } from 'react'
import Aviso from '../components/Aviso.jsx'
import Cargando from '../components/Cargando.jsx'
import FotoPlato from '../components/FotoPlato.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { subirFoto } from '../lib/fotos'
import { bs } from '../lib/formato'
import { supabase } from '../lib/supabase'

// RN-08: límite de platos por plan
const LIMITE = { basico: 10, basico_plus: 30, pro: Infinity }

export default function TabPlatos({ restaurante }) {
  const [platos, setPlatos] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [editando, setEditando] = useState(null) // null = cerrado, {} = nuevo, plato = edición
  const mostrarToast = useToast()

  const cargar = useCallback(async () => {
    const { data } = await supabase
      .from('platos')
      .select('*, categorias (nombre, slug)')
      .eq('restaurante_id', restaurante.id)
      .order('creado_en')
    setPlatos(data ?? [])
  }, [restaurante.id])

  useEffect(() => {
    cargar()
    supabase
      .from('categorias')
      .select('id, nombre')
      .order('nombre')
      .then(({ data }) => setCategorias(data ?? []))
  }, [cargar])

  if (platos === null) return <Cargando />

  const limite = LIMITE[restaurante.plan]
  const alLimite = platos.length >= limite

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-gris">
          {platos.length} {platos.length === 1 ? 'plato publicado' : 'platos publicados'}
          {Number.isFinite(limite) ? ` de ${limite} en tu plan` : ''}
        </p>
        {editando ? null : (
          <button type="button" className="boton" onClick={() => setEditando({})} disabled={alLimite}>
            Agregar plato
          </button>
        )}
      </div>
      {alLimite && !editando ? (
        <div className="mt-3">
          <Aviso>Llegaste al límite de tu plan. Con el plan Básico+ puedes publicar hasta 30 platos.</Aviso>
        </div>
      ) : null}

      {editando ? (
        <FormPlato
          key={editando.id ?? 'nuevo'}
          plato={editando}
          restauranteId={restaurante.id}
          categorias={categorias}
          onCancelar={() => setEditando(null)}
          onGuardado={(texto) => {
            setEditando(null)
            mostrarToast(texto)
            cargar()
          }}
        />
      ) : null}

      {platos.length === 0 && !editando ? (
        <p className="mt-6 rounded-2xl border border-dashed border-linea bg-white p-6 text-gris">
          Todavía no publicaste platos. Empieza por tu plato estrella: es el que más te conviene que la gente encuentre.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-linea rounded-2xl border border-linea bg-white">
          {platos.map((p, i) => (
            <FilaPlato
              key={p.id}
              plato={p}
              indice={i}
              onEditar={() => setEditando(p)}
              onEliminado={() => {
                mostrarToast(`Eliminaste "${p.nombre}".`)
                cargar()
              }}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

function FilaPlato({ plato, indice, onEditar, onEliminado }) {
  const [confirmar, setConfirmar] = useState(false)
  const [error, setError] = useState('')

  async function eliminar() {
    const { error: e } = await supabase.from('platos').delete().eq('id', plato.id)
    if (e) setError('No se pudo eliminar el plato.')
    else onEliminado()
  }

  return (
    <li className="animar-aparecer flex flex-wrap items-center gap-3 p-3 transition-colors hover:bg-fondo" style={{ '--retraso': `${Math.min(indice * 40, 400)}ms` }}>
      <FotoPlato url={plato.foto_url} nombre={plato.nombre} categoria={plato.categorias?.nombre} slug={plato.categorias?.slug} className="size-14 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{plato.nombre}</p>
        <p className="text-sm text-gris">
          {plato.categorias?.nombre} · <span className="font-semibold text-vinedo">{bs(plato.precio)}</span>
          {plato.disponible ? '' : ' · No disponible'}
        </p>
        {error ? <p className="text-sm text-vino">{error}</p> : null}
      </div>
      {confirmar ? (
        <div className="flex items-center gap-2">
          <span className="text-sm">¿Eliminar este plato y sus reseñas?</span>
          <button type="button" className="rounded-lg bg-vino px-3 py-1.5 text-sm font-semibold text-white" onClick={eliminar}>
            Eliminar
          </button>
          <button type="button" className="rounded-lg px-3 py-1.5 text-sm font-semibold text-gris" onClick={() => setConfirmar(false)}>
            Cancelar
          </button>
        </div>
      ) : (
        <div className="flex gap-1">
          <button type="button" className="rounded-lg px-3 py-1.5 text-sm font-semibold text-vino hover:bg-vino-suave" onClick={onEditar}>
            Editar
          </button>
          <button type="button" className="rounded-lg px-3 py-1.5 text-sm font-semibold text-gris hover:bg-linea/60" onClick={() => setConfirmar(true)}>
            Eliminar
          </button>
        </div>
      )}
    </li>
  )
}

function FormPlato({ plato, restauranteId, categorias, onCancelar, onGuardado }) {
  const { usuario } = useAuth()
  const esNuevo = !plato.id
  const [nombre, setNombre] = useState(plato.nombre ?? '')
  const [categoriaId, setCategoriaId] = useState(plato.categoria_id ? String(plato.categoria_id) : '')
  const [precio, setPrecio] = useState(plato.precio ?? '')
  const [descripcion, setDescripcion] = useState(plato.descripcion ?? '')
  const [disponible, setDisponible] = useState(plato.disponible ?? true)
  const [foto, setFoto] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  // Vista previa de la foto elegida antes de subirla
  const vistaPrevia = useMemo(() => (foto ? URL.createObjectURL(foto) : null), [foto])
  useEffect(() => () => vistaPrevia && URL.revokeObjectURL(vistaPrevia), [vistaPrevia])

  async function guardar(e) {
    e.preventDefault()
    setEnviando(true)
    setError('')
    try {
      const foto_url = foto ? await subirFoto(foto, usuario.id) : plato.foto_url ?? null
      const datos = {
        nombre: nombre.trim(),
        categoria_id: Number(categoriaId),
        precio: Number(precio),
        descripcion: descripcion.trim(),
        disponible,
        foto_url,
      }
      const { error: err } = esNuevo
        ? await supabase.from('platos').insert({ ...datos, restaurante_id: restauranteId })
        : await supabase.from('platos').update(datos).eq('id', plato.id)
      if (err) throw new Error('No se pudo guardar el plato. Revisa los datos e inténtalo de nuevo.')
      onGuardado(esNuevo ? `Publicaste "${datos.nombre}". Ya aparece en las búsquedas.` : `Guardaste los cambios de "${datos.nombre}".`)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={guardar} className="animar-aparecer mt-4 flex flex-col gap-4 rounded-3xl border-2 border-vino/25 bg-white p-5 shadow-[0_18px_40px_-28px_rgba(35,26,32,0.5)]">
      <h2 className="text-lg font-bold">{esNuevo ? 'Nuevo plato' : `Editar "${plato.nombre}"`}</h2>
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <div>
          <label htmlFor="p-nombre" className="etiqueta">Nombre del plato</label>
          <input id="p-nombre" required minLength={2} maxLength={80} value={nombre} onChange={(e) => setNombre(e.target.value)} className="campo" placeholder="Ej.: Smash doble con cheddar" />
        </div>
        <div>
          <label htmlFor="p-precio" className="etiqueta">Precio (Bs)</label>
          <input id="p-precio" type="number" required min="0.5" step="0.5" inputMode="decimal" value={precio} onChange={(e) => setPrecio(e.target.value)} className="campo tabular-nums" />
        </div>
      </div>
      <div>
        <label htmlFor="p-categoria" className="etiqueta">Categoría</label>
        <select id="p-categoria" required value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className="campo">
          <option value="" disabled>
            Elige una categoría
          </option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="p-descripcion" className="etiqueta">
          Descripción <span className="font-normal text-gris">(opcional)</span>
        </label>
        <textarea id="p-descripcion" rows={2} maxLength={300} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="campo" placeholder="Ingredientes, tamaño de la porción…" />
      </div>
      <div>
        <label htmlFor="p-foto" className="etiqueta">Foto</label>
        <div className="flex items-center gap-4">
          {vistaPrevia || plato.foto_url ? (
            <img src={vistaPrevia ?? plato.foto_url} alt="Vista previa de la foto del plato" className="animar-estampar size-20 shrink-0 rounded-xl object-cover" />
          ) : (
            <span className="grid size-20 shrink-0 place-items-center rounded-xl border-2 border-dashed border-linea text-xs text-gris">Sin foto</span>
          )}
        <input
          id="p-foto"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-gris file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-vino-suave file:px-3 file:py-2 file:font-semibold file:text-vino"
        />
        </div>
        <p className="mt-2 text-sm text-gris">Una foto real de tu plato hace que más personas lo elijan.</p>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" checked={disponible} onChange={(e) => setDisponible(e.target.checked)} className="size-4 accent-vino" />
        Disponible hoy (si lo desmarcas, no aparece en las búsquedas)
      </label>
      <Aviso tipo="error">{error}</Aviso>
      <div className="flex gap-2">
        <button type="submit" className="boton" disabled={enviando}>
          {enviando ? 'Guardando…' : esNuevo ? 'Publicar plato' : 'Guardar cambios'}
        </button>
        <button type="button" className="boton-secundario" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
