import 'leaflet/dist/leaflet.css'
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from 'react-leaflet'

const ATRIBUCION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
const MARCADOR = { color: '#7A1F3D', fillColor: '#F4B43C', fillOpacity: 1, weight: 3 }

function AlHacerClic({ onElegir }) {
  useMapEvents({ click: (e) => onElegir({ lat: e.latlng.lat, lng: e.latlng.lng }) })
  return null
}

// Muestra la ubicación del local. Con onElegir, permite marcarla tocando el mapa.
export default function MapaLocal({ lat, lng, onElegir, className = 'h-56' }) {
  return (
    <MapContainer center={[lat, lng]} zoom={16} scrollWheelZoom={false} className={`z-0 w-full rounded-2xl ${className}`}>
      <TileLayer attribution={ATRIBUCION} url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <CircleMarker center={[lat, lng]} radius={10} pathOptions={MARCADOR} />
      {onElegir ? <AlHacerClic onElegir={onElegir} /> : null}
    </MapContainer>
  )
}
