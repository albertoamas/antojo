import { lazy, Suspense, useEffect, useState } from 'react'
import Aviso from '../components/Aviso.jsx'
import { CENTRO_TARIJA } from '../lib/geo'
import { supabase } from '../lib/supabase'

const MapaLocal = lazy(() => import('../components/MapaLocal.jsx'))

const TIPOS = [
  'Hamburguesería', 'Pizzería', 'Pollería', 'Comida típica', 'Salteñería', 'Sandwichería', 'Cafetería',
  'Repostería', 'Vegetariano', 'Comida oriental', 'Parrilla', 'Food truck', 'Emprendimiento por redes', 'Otro',
]

const VACIO = {
  nombre: '', tipo: 'Hamburguesería', zona_id: '', direccion: '', hora_apertura: '12:00', hora_cierre: '22:00',
  telefono: '', enlace_delivery: '', lat: CENTRO_TARIJA.lat, lng: CENTRO_TARIJA.lng,
}

export default function FormRestaurante({ inicial, textoBoton, onGuardar }) {
  const [datos, setDatos] = useState(() => ({
    ...VACIO,
    ...inicial,
    hora_apertura: inicial?.hora_apertura?.slice(0, 5) ?? VACIO.hora_apertura,
    hora_cierre: inicial?.hora_cierre?.slice(0, 5) ?? VACIO.hora_cierre,
    telefono: inicial?.telefono ?? '',
    enlace_delivery: inicial?.enlace_delivery ?? '',
  }))
  const [zonas, setZonas] = useState([])
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase
      .from('zonas')
      .select('id, nombre')
      .order('nombre')
      .then(({ data }) => setZonas(data ?? []))
  }, [])

  const cambiar = (campo) => (e) => setDatos((d) => ({ ...d, [campo]: e.target.value }))

  async function enviar(e) {
    e.preventDefault()
    setEnviando(true)
    setError('')
    try {
      await onGuardar({
        nombre: datos.nombre.trim(),
        tipo: datos.tipo,
        zona_id: Number(datos.zona_id),
        direccion: datos.direccion.trim(),
        hora_apertura: datos.hora_apertura || null,
        hora_cierre: datos.hora_cierre || null,
        telefono: datos.telefono.trim() || null,
        enlace_delivery: datos.enlace_delivery.trim() || null,
        lat: datos.lat,
        lng: datos.lng,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      <div>
        <label htmlFor="r-nombre" className="etiqueta">Nombre del local</label>
        <input id="r-nombre" required minLength={2} maxLength={80} value={datos.nombre} onChange={cambiar('nombre')} className="campo" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="r-tipo" className="etiqueta">Tipo de local</label>
          <select id="r-tipo" value={datos.tipo} onChange={cambiar('tipo')} className="campo">
            {TIPOS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="r-zona" className="etiqueta">Zona</label>
          <select id="r-zona" required value={datos.zona_id} onChange={cambiar('zona_id')} className="campo">
            <option value="" disabled>
              Elige la zona
            </option>
            {zonas.map((z) => (
              <option key={z.id} value={z.id}>
                {z.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="r-direccion" className="etiqueta">Dirección</label>
        <input id="r-direccion" required minLength={3} maxLength={160} value={datos.direccion} onChange={cambiar('direccion')} className="campo" placeholder="Calle, número o referencia" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="r-apertura" className="etiqueta">Abre a las</label>
          <input id="r-apertura" type="time" value={datos.hora_apertura} onChange={cambiar('hora_apertura')} className="campo" />
        </div>
        <div>
          <label htmlFor="r-cierre" className="etiqueta">Cierra a las</label>
          <input id="r-cierre" type="time" value={datos.hora_cierre} onChange={cambiar('hora_cierre')} className="campo" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="r-telefono" className="etiqueta">
            Teléfono o WhatsApp <span className="font-normal text-gris">(opcional)</span>
          </label>
          <input id="r-telefono" type="tel" maxLength={30} value={datos.telefono} onChange={cambiar('telefono')} className="campo" />
        </div>
        <div>
          <label htmlFor="r-delivery" className="etiqueta">
            Enlace de PedidosYa o Yango <span className="font-normal text-gris">(opcional)</span>
          </label>
          <input id="r-delivery" type="url" maxLength={300} value={datos.enlace_delivery} onChange={cambiar('enlace_delivery')} className="campo" placeholder="https://…" />
        </div>
      </div>
      <div>
        <p className="etiqueta">Ubicación</p>
        <p className="mb-2 text-sm text-gris">Toca el mapa en el lugar exacto de tu local.</p>
        <Suspense fallback={<div className="h-64 rounded-2xl bg-linea/50" />}>
          <MapaLocal lat={datos.lat} lng={datos.lng} className="h-64" onElegir={(punto) => setDatos((d) => ({ ...d, ...punto }))} />
        </Suspense>
      </div>
      <Aviso tipo="error">{error}</Aviso>
      <button type="submit" className="boton self-start" disabled={enviando}>
        {enviando ? 'Guardando…' : textoBoton}
      </button>
    </form>
  )
}
