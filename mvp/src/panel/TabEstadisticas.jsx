import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js'
import { useEffect, useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import Cargando from '../components/Cargando.jsx'
import { supabase } from '../lib/supabase'
import { useContador } from '../lib/useContador'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)
ChartJS.defaults.font.family = '"Figtree Variable", system-ui, sans-serif'
ChartJS.defaults.color = '#6e6469'

const RANGOS = [
  { dias: 7, texto: 'Últimos 7 días' },
  { dias: 30, texto: 'Últimos 30 días' },
]

export default function TabEstadisticas({ restaurante }) {
  const [dias, setDias] = useState(30)
  const [datos, setDatos] = useState(null)

  useEffect(() => {
    const desde = new Date(Date.now() - dias * 86_400_000).toISOString()
    Promise.all([
      supabase.from('eventos').select('tipo, plato_id').eq('restaurante_id', restaurante.id).gte('creado_en', desde),
      supabase.from('eventos').select('termino').eq('tipo', 'busqueda').gte('creado_en', desde).limit(1000),
      supabase.from('platos').select('id, nombre').eq('restaurante_id', restaurante.id),
    ]).then(([eventos, busquedas, platos]) => {
      setDatos({ eventos: eventos.data ?? [], busquedas: busquedas.data ?? [], platos: platos.data ?? [] })
    })
  }, [restaurante.id, dias])

  const resumen = useMemo(() => {
    if (!datos) return null
    const porPlato = new Map(datos.platos.map((p) => [p.id, { nombre: p.nombre, vistas: 0, clics: 0 }]))
    let vistas = 0
    let clics = 0
    for (const e of datos.eventos) {
      const fila = porPlato.get(e.plato_id)
      if (e.tipo === 'vista_plato') {
        vistas++
        if (fila) fila.vistas++
      } else if (e.tipo === 'como_llegar') {
        clics++
        if (fila) fila.clics++
      }
    }
    const terminos = new Map()
    for (const b of datos.busquedas) terminos.set(b.termino, (terminos.get(b.termino) ?? 0) + 1)
    return {
      vistas,
      clics,
      platos: [...porPlato.values()].toSorted((a, b) => b.vistas - a.vistas),
      buscados: [...terminos].toSorted((a, b) => b[1] - a[1]).slice(0, 5),
    }
  }, [datos])

  if (!resumen) return <Cargando />

  const conversion = resumen.vistas ? Math.round((resumen.clics / resumen.vistas) * 100) : 0

  return (
    <section className="flex flex-col gap-6">
      <div className="flex gap-2">
        {RANGOS.map((r) => (
          <button key={r.dias} type="button" onClick={() => setDias(r.dias)} className={`chip ${dias === r.dias ? 'chip-activo' : ''}`} aria-pressed={dias === r.dias}>
            {r.texto}
          </button>
        ))}
      </div>

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Indicador titulo="Vistas de tus platos" valor={resumen.vistas} />
        <Indicador titulo="Personas que buscaron cómo llegar" valor={resumen.clics} />
        <Indicador titulo="De cada 100 vistas, van al local" valor={conversion} />
      </dl>

      <div className="rounded-3xl border border-linea bg-white p-5">
        <h2 className="font-bold">Vistas y visitas por plato</h2>
        {resumen.platos.length === 0 ? (
          <p className="mt-2 text-gris">Publica tus platos para empezar a ver estadísticas.</p>
        ) : (
          <div className="mt-3" style={{ height: Math.max(180, resumen.platos.length * 44) }}>
            <Bar
              data={{
                labels: resumen.platos.map((p) => p.nombre),
                datasets: [
                  { label: 'Vistas', data: resumen.platos.map((p) => p.vistas), backgroundColor: '#7A1F3D', borderRadius: 4 },
                  { label: 'Cómo llegar', data: resumen.platos.map((p) => p.clics), backgroundColor: '#F4B43C', borderRadius: 4 },
                ],
              }}
              options={{
                indexAxis: 'y',
                animation: { duration: 900, easing: 'easeOutQuart' },
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } },
                scales: {
                  x: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#e8e3e5' } },
                  y: { grid: { display: false } },
                },
              }}
            />
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-linea bg-white p-5">
        <h2 className="font-bold">Lo más buscado en Antojo</h2>
        <p className="text-sm text-gris">Ideas para tu menú y tus promociones.</p>
        {resumen.buscados.length === 0 ? (
          <p className="mt-2 text-gris">Todavía no hay búsquedas en este período.</p>
        ) : (
          <ol className="mt-3 flex flex-col gap-2">
            {resumen.buscados.map(([termino, veces], i) => (
              <li key={termino} className="animar-aparecer grid grid-cols-[1rem_8rem_1fr_6rem] items-center gap-3 text-sm sm:text-base" style={{ '--retraso': `${i * 70}ms` }}>
                <span className="text-right font-bold text-gris tabular-nums">{i + 1}</span>
                <span className="truncate font-semibold capitalize">{termino}</span>
                <span className="h-2 overflow-hidden rounded-full bg-linea">
                  <span className="block h-full rounded-full bg-aji" style={{ width: `${(veces / resumen.buscados[0][1]) * 100}%` }} />
                </span>
                <span className="text-right text-gris tabular-nums">{veces} búsquedas</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}

function Indicador({ titulo, valor }) {
  const actual = useContador(valor)
  return (
    <div className="rounded-3xl border border-linea bg-white p-5 transition-transform duration-200 hover:-translate-y-0.5">
      <dt className="text-sm text-gris">{titulo}</dt>
      <dd className="mt-1 font-display text-4xl font-extrabold text-vino tabular-nums">{actual}</dd>
    </div>
  )
}
