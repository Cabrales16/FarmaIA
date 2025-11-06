// src/Admin/components/RouteMap.jsx
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import L from "leaflet";
import "leaflet-routing-machine";
import "./RouteMap/RouteMap.css";
import { useEffect, useState } from "react";

// 📍 Iconos personalizados
const iconDepot = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/535/535239.png",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const iconPedido = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

// 🔹 Maneja clics para cambiar punto de inicio
function MapClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

// 🔹 Controla la creación del routing en el mapa
function RoutingMachine({ depot, points }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !depot || !points?.length) return;

    // Crear waypoints (inicio + puntos)
    const waypoints = [
      L.latLng(depot.lat, depot.lng),
      ...points.map((p) => L.latLng(p.lat, p.lng)),
    ];

    // Crear control de rutas reales
    const control = L.Routing.control({
      waypoints,
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      createMarker: () => null, // ya usamos nuestros propios marcadores
      lineOptions: {
        styles: [
          { color: "#2563EB", weight: 5, opacity: 0.9 },
          { color: "white", weight: 1, opacity: 0.8 },
        ],
      },
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
    }).addTo(map);

    return () => {
      map.removeControl(control);
    };
  }, [map, depot, points]);

  return null;
}

// 🔹 Componente principal
export default function RouteMap({ depot, points, onDepotChange }) {
  const [localDepot, setLocalDepot] = useState(depot);

  if (!points?.length) return null;

  const center = [localDepot.lat, localDepot.lng];

  const handleMapClick = (latlng) => {
    const newDepot = { lat: latlng.lat, lng: latlng.lng };
    setLocalDepot(newDepot);
    if (onDepotChange) onDepotChange(newDepot);
  };

  return (
    <div className="mt-4 rounded-xl overflow-hidden border border-gray-200">
      <MapContainer center={center} zoom={13} style={{ height: 360 }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        <MapClickHandler onClick={handleMapClick} />

        {/* 📍 Punto de inicio */}
        <Marker position={[localDepot.lat, localDepot.lng]} icon={iconDepot}>
          <Tooltip direction="top" offset={[0, -15]} permanent>
            📦 Punto de inicio
          </Tooltip>
        </Marker>

        {/* 📍 Puntos de entrega */}
        {points.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={iconPedido}
          >
            <Tooltip direction="top" offset={[0, -15]} permanent>
              #{p.orden} – Pedido {p.id}
            </Tooltip>
          </Marker>
        ))}

        {/* 🚗 Trazado de la ruta real */}
        <RoutingMachine depot={localDepot} points={points} />
      </MapContainer>

      <p className="text-xs text-center text-gray-500 p-2 bg-gray-50">
        Haz clic en el mapa para cambiar el punto de partida y recalcular la ruta.
      </p>
    </div>
  );
}
