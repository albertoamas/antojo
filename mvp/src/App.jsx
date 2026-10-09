import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Encabezado from './components/Encabezado.jsx'
import Cargando from './components/Cargando.jsx'
import CronometroDemo from './components/CronometroDemo.jsx'
import Pie from './components/Pie.jsx'
import Inicio from './pages/Inicio.jsx'
import Plato from './pages/Plato.jsx'
import Restaurante from './pages/Restaurante.jsx'
import Ingresar from './pages/Ingresar.jsx'
import NoEncontrado from './pages/NoEncontrado.jsx'
import Pitch, { AbrirPitch } from './pages/Pitch.jsx'

// El panel del restaurante carga mapas, gráficos y QR: solo se descarga si se usa
const Panel = lazy(() => import('./panel/Panel.jsx'))
const PanelRestaurante = lazy(() => import('./panel/PanelRestaurante.jsx'))
const NuevoRestaurante = lazy(() => import('./panel/NuevoRestaurante.jsx'))

export default function App() {
  const { pathname } = useLocation()

  // Cada página nueva empieza arriba
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[3000] focus:rounded-lg focus:bg-white focus:px-3 focus:py-2">
        Saltar al contenido
      </a>
      <Encabezado />
      <CronometroDemo />
      <div id="contenido" key={pathname} className="animar-pagina flex-1">
        <Suspense fallback={<Cargando />}>
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/plato/:id" element={<Plato />} />
            <Route path="/restaurante/:id" element={<Restaurante />} />
            <Route path="/ingresar" element={<Ingresar />} />
            <Route path="/panel" element={<Panel />} />
            <Route path="/panel/nuevo" element={<NuevoRestaurante />} />
            <Route path="/panel/:id" element={<PanelRestaurante />} />
            <Route path="/pitch" element={<Pitch />} />
            <Route path="/pitch/:persona" element={<AbrirPitch />} />
            <Route path="*" element={<NoEncontrado />} />
          </Routes>
        </Suspense>
      </div>
      <Pie />
    </div>
  )
}
