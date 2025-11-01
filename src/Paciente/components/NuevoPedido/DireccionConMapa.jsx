import { useState, useEffect, Suspense } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { FaMapMarkerAlt } from "react-icons/fa";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Ícono del marcador
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Componente que permite seleccionar una ubicación
function MapaSelector({ onSelectUbicacion }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      const nuevaPos = e.latlng;
      setPosition(nuevaPos);
      onSelectUbicacion(nuevaPos);
    },
  });

  return position ? <Marker position={position} icon={markerIcon} /> : null;
}

export default function DireccionConMapa({
  direccion,
  setDireccion,
  setLatitud,
  setLongitud,
}) {
  const [showMap, setShowMap] = useState(false);
  const [pos, setPos] = useState({ lat: 4.710989, lng: -74.07209 }); // Bogotá
  const [loadingUbicacion, setLoadingUbicacion] = useState(true);

  // 🚀 Detectar ubicación actual automáticamente
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (ubicacion) => {
          setPos({
            lat: ubicacion.coords.latitude,
            lng: ubicacion.coords.longitude,
          });
          setLoadingUbicacion(false);
        },
        () => setLoadingUbicacion(false)
      );
    } else setLoadingUbicacion(false);
  }, []);

  const handleUbicacionSeleccionada = (ubicacion) => {
    setDireccion(`Lat: ${ubicacion.lat.toFixed(6)}, Lng: ${ubicacion.lng.toFixed(6)}`);
    setLatitud(ubicacion.lat);
    setLongitud(ubicacion.lng);
  };

  return (
    <div>
      <label className="block text-gray-700 font-semibold mb-2">
        Dirección de entrega
      </label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          placeholder="Ingrese o seleccione su dirección"
          className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="button"
          onClick={() => setShowMap(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg"
          title="Seleccionar ubicación en el mapa"
        >
          <FaMapMarkerAlt />
        </button>
      </div>

      {showMap && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 w-[90%] md:w-[60%] h-[70%] shadow-lg relative">
            <h2 className="text-lg font-semibold mb-2 text-center">
              Seleccionar ubicación
            </h2>

            {loadingUbicacion ? (
              <div className="flex justify-center items-center h-[85%] text-gray-500">
                Detectando ubicación...
              </div>
            ) : (
              <Suspense fallback={<p className="text-center">Cargando mapa...</p>}>
                <MapContainer
                  center={pos}
                  zoom={13}
                  style={{ width: "100%", height: "85%" }}
                  className="rounded-lg overflow-hidden"
                >
                  <TileLayer
                    url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a> / OpenStreetMap'
                  />
                  <MapaSelector onSelectUbicacion={handleUbicacionSeleccionada} />
                  <Marker position={pos} icon={markerIcon} />
                </MapContainer>
              </Suspense>
            )}

            <div className="flex justify-end gap-3 mt-3">
              <button
                onClick={() => setShowMap(false)}
                className="border border-gray-400 px-4 py-1 rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowMap(false)}
                className="bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-600"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}