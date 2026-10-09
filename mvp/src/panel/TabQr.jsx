import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import Aviso from '../components/Aviso.jsx'
import Cargando from '../components/Cargando.jsx'
import Logo from '../components/Logo.jsx'
import { urlDelQr } from '../lib/qr'
import { supabase } from '../lib/supabase'

export default function TabQr({ restaurante }) {
  const [imagen, setImagen] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase
      .from('restaurante_qr')
      .select('codigo')
      .eq('restaurante_id', restaurante.id)
      .maybeSingle()
      .then(async ({ data }) => {
        if (!data) {
          setError('No encontramos el código de este local. Recarga la página.')
          return
        }
        const url = urlDelQr(restaurante.id, data.codigo)
        setImagen(await QRCode.toDataURL(url, { width: 640, margin: 1, color: { dark: '#5C1730', light: '#FFFFFF' } }))
      })
  }, [restaurante.id])

  if (error) return <Aviso tipo="error">{error}</Aviso>
  if (!imagen) return <Cargando />

  return (
    <section className="grid items-start gap-10 md:grid-cols-[minmax(0,22rem)_1fr]">
      {/* Tarjeta para imprimir y poner en las mesas (diseño del manual de marca) */}
      <div className="animar-aparecer mx-auto w-full max-w-[22rem] overflow-hidden rounded-3xl border-[3px] border-vino bg-white text-center shadow-[0_18px_40px_-24px_rgba(35,26,32,0.45)] print:shadow-none">
        <div className="bg-vino py-4">
          <Logo variante="negativo" className="mx-auto h-9" />
        </div>
        <div className="flex flex-col items-center gap-3 px-6 pt-5 pb-6">
          <p className="font-display text-[1.7rem] leading-tight font-extrabold">¿Qué tal tu plato?</p>
          <p className="text-sm text-gris">Escanea, califícalo y ayuda a otros a elegir.</p>
          <div className="rounded-2xl border-2 border-dashed border-aji p-2.5">
            <img src={imagen} alt={`Código QR de ${restaurante.nombre}`} className="animar-estampar w-48" style={{ '--retraso': '150ms' }} />
          </div>
          <p className="font-display text-lg font-bold text-vino">{restaurante.nombre}</p>
          <ol className="flex list-decimal flex-col gap-0.5 pl-5 text-left text-sm">
            <li>Abre la cámara del celular</li>
            <li>Elige el plato que comiste</li>
            <li>Tu reseña queda verificada</li>
          </ol>
        </div>
      </div>

      <div className="no-imprimir flex flex-col gap-4">
        <h2 className="text-xl font-bold">Tu código QR para las mesas</h2>
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-gris">
          <li>Imprime la tarjeta y ponla en cada mesa o en la caja.</li>
          <li>Tus clientes la escanean con la cámara del celular, sin instalar nada.</li>
          <li>Sus reseñas quedan marcadas como verificadas en el local y valen el doble en el ranking.</li>
        </ol>
        <p className="text-sm text-gris">El código es único de tu local. No lo publiques en redes: está pensado para quien de verdad comió en tu restaurante.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="boton" onClick={() => window.print()}>
            Imprimir tarjeta
          </button>
          <a href={imagen} download={`qr-${restaurante.nombre.toLowerCase().replaceAll(' ', '-')}.png`} className="boton-secundario">
            Descargar imagen
          </a>
        </div>
      </div>
    </section>
  )
}
