import { useEffect, useMemo, useState } from "react";
import supabase from "../../../api/supabase";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, useMapEvents, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function MapSelector({ onSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition({ lat, lng });
      onSelect({ lat, lng });
    },
  });

  return position ? (
    <Marker position={[position.lat, position.lng]}>
      <Tooltip direction="top" offset={[0, -15]} permanent>
        📍 Punto de inicio
      </Tooltip>
    </Marker>
  ) : null;
}

export default function SeleccionarPedidosModal({ open, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [puntoInicio, setPuntoInicio] = useState(null);

  useEffect(() => {
    if (!open) return;
    const fetchPedidos = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("pedidos")
          .select(`
            id,
            direccion_entrega,
            latitud,
            longitud,
            estado,
            pacientes ( usuario ( nombre ) )
          `)
          .in("estado", ["pendiente", "en_ruta"])
          .not("latitud", "is", null)
          .not("longitud", "is", null)
          .order("fecha_pedido", { ascending: false })
          .limit(200);
        if (error) throw error;
        setPedidos(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pedidos;
    return pedidos.filter((p) => {
      const nombre = p.pacientes?.usuario?.nombre || "";
      const dir = p.direccion_entrega || "";
      return (
        String(p.id).includes(q) ||
        nombre.toLowerCase().includes(q) ||
        dir.toLowerCase().includes(q)
      );
    });
  }, [query, pedidos]);

  const toggle = (id) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setSelected(s);
  };

  const allVisibleIds = filtered.map((p) => p.id);
  const allSelected = allVisibleIds.every((id) => selected.has(id)) && allVisibleIds.length > 0;

  const toggleAllVisible = () => {
    const s = new Set(selected);
    if (allSelected) {
      allVisibleIds.forEach((id) => s.delete(id));
    } else {
      allVisibleIds.forEach((id) => s.add(id));
    }
    setSelected(s);
  };

  const handleConfirm = () => {
    const chosen = pedidos
      .filter((p) => selected.has(p.id))
      .map((p) => ({
        id: p.id,
        addr: p.direccion_entrega || "Sin dirección",
        lat: Number(p.latitud),
        lng: Number(p.longitud),
        paciente: p.pacientes?.usuario?.nombre || "Desconocido",
      }));
    onConfirm(chosen, puntoInicio);
    setSelected(new Set());
  };

  const handleClose = () => {
    setSelected(new Set());
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Seleccionar pedidos para la ruta</h3>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {/* BUSCADOR */}
        <div className="p-4 flex gap-3 items-center border-b">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Buscar por #pedido, nombre o dirección…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            onClick={toggleAllVisible}
            className="border px-3 py-2 rounded-lg text-sm hover:bg-gray-50"
          >
            {allSelected ? "Deseleccionar visibles" : "Seleccionar visibles"}
          </button>
        </div>

        {/* LISTA DE PEDIDOS */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {loading ? (
            <p className="text-sm text-gray-500 p-4">Cargando pedidos…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-500 p-4">Sin resultados.</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((p) => {
                const checked = selected.has(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => toggle(p.id)}
                    className={`cursor-pointer border rounded-xl p-3 transition-all duration-150 ${
                      checked
                        ? "bg-blue-50 border-blue-400 ring-1 ring-blue-400"
                        : "bg-white hover:bg-gray-50 border-gray-300"
                    }`}
                  >
                    <div>
                      <p className="font-semibold">Pedido #{p.id}</p>
                      <p className="text-sm text-gray-600">
                        {p.pacientes?.usuario?.nombre || "Desconocido"} — {p.direccion_entrega}
                      </p>
                      <p className="text-xs text-gray-500">
                        ({Number(p.latitud).toFixed(5)}, {Number(p.longitud).toFixed(5)}) • {p.estado}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MAPA */}
        <div className="border-t bg-gray-50">
          <div className="p-3 flex items-center gap-2">
            <FaMapMarkerAlt className="text-blue-600" />
            <p className="text-sm font-semibold text-gray-700">
              Selecciona en el mapa el punto de partida para la ruta:
            </p>
          </div>
          <div className="p-2">
            <MapContainer
              center={[4.711, -74.0721]}
              zoom={12}
              style={{ height: 250, borderRadius: "12px" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              <MapSelector onSelect={setPuntoInicio} />
            </MapContainer>
          </div>
          {puntoInicio && (
            <p className="text-xs text-center text-gray-600 pb-3">
              📍 Punto seleccionado: ({puntoInicio.lat.toFixed(5)}, {puntoInicio.lng.toFixed(5)})
            </p>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t flex items-center justify-between bg-white">
          <p className="text-sm text-gray-600">
            Seleccionados: <span className="font-semibold">{selected.size}</span>
          </p>
          <div className="flex gap-2">
            <button onClick={handleClose} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={selected.size === 0 || !puntoInicio}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
            >
              Usar {selected.size} pedidos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}