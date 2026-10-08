import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle, MapPin, Truck, ClipboardList, Package } from "lucide-react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import toast from "react-hot-toast";
import supabase from "../../../api/supabase";
import { notifyDataChange } from "../../../common/dataEvents";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const ESTADOS = {
  pendiente: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800", paso: 1 },
  en_ruta: { label: "En ruta", color: "bg-blue-100 text-blue-800", paso: 2 },
  entregado: { label: "Entregado", color: "bg-green-100 text-green-800", paso: 3 },
  fallido: { label: "Entrega fallida", color: "bg-red-100 text-red-800", paso: 0 },
};

const ETAPAS = [
  { nombre: "Solicitud recibida", descripcion: "Su pedido ha sido registrado" },
  { nombre: "En preparación", descripcion: "Preparando medicamentos" },
  { nombre: "En camino", descripcion: "Operador en ruta de entrega" },
  { nombre: "Entregado", descripcion: "Pedido entregado exitosamente" },
];

const formatFecha = (iso, conHora = false) =>
  iso
    ? new Date(iso).toLocaleString("es-CO", {
        day: "numeric",
        month: "long",
        year: "numeric",
        ...(conHora ? { hour: "2-digit", minute: "2-digit" } : {}),
      })
    : "Por definir";

const DetallePedido = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("pedidos")
        .select(
          `id, estado, direccion_entrega, latitud, longitud, fecha_pedido,
           fecha_entrega_estimada, fecha_entrega_real,
           pedido_detalle ( cantidad, medicamentos ( nombre ) )`
        )
        .eq("id", Number(id))
        .single();
      if (error) console.error("Error al cargar el pedido:", error);
      setPedido(error ? null : data);
      setLoading(false);
    };
    load();
  }, [id]);

  const confirmarRecepcion = async () => {
    setConfirmando(true);
    const { error } = await supabase
      .from("pedidos")
      .update({ estado: "entregado", fecha_entrega_real: new Date().toISOString() })
      .eq("id", pedido.id);
    setConfirmando(false);
    if (error) return toast.error("No se pudo confirmar la recepción.");
    toast.success("¡Recepción confirmada!");
    notifyDataChange("pedidos");
    setPedido({ ...pedido, estado: "entregado", fecha_entrega_real: new Date().toISOString() });
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500 animate-pulse">Cargando pedido...</div>;
  }

  if (!pedido) {
    return (
      <div className="p-10 text-center text-gray-600">
        <p className="mb-4">No se encontró el pedido solicitado.</p>
        <button
          onClick={() => navigate("/inicio/mis-pedidos")}
          className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium transition"
        >
          Volver a mis pedidos
        </button>
      </div>
    );
  }

  const estado = ESTADOS[pedido.estado] || ESTADOS.pendiente;
  const hayCoords = pedido.latitud != null && pedido.longitud != null;
  const puedeConfirmar = pedido.estado === "en_ruta";

  return (
    <div className="flex">
      <div className="flex-1 bg-gray-50 min-h-screen">
        {/* Encabezado */}
        <div className="border-b border-gray-300 flex items-center justify-between p-6 bg-white shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-800">Pedido #{pedido.id}</h1>
          <p className="text-gray-500">Solicitado el {formatFecha(pedido.fecha_pedido)}</p>
        </div>

        <div className="p-6">
          <div className={`${estado.color} font-semibold rounded-xl px-4 py-3 inline-block mb-6`}>
            {estado.label}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white shadow-sm rounded-xl p-5">
              <h2 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPin size={20} /> Dirección de entrega
              </h2>
              <p className="text-gray-600">{pedido.direccion_entrega || "Sin dirección registrada"}</p>
            </div>

            <div className="bg-white shadow-sm rounded-xl p-5">
              <h2 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Truck size={20} /> {pedido.estado === "entregado" ? "Entregado el" : "Entrega estimada"}
              </h2>
              <p className="text-gray-600">
                {pedido.estado === "entregado" && pedido.fecha_entrega_real
                  ? formatFecha(pedido.fecha_entrega_real, true)
                  : formatFecha(pedido.fecha_entrega_estimada, true)}
              </p>
            </div>
          </div>

          {/* Seguimiento */}
          <div className="bg-white shadow-md rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Estado del pedido</h2>
            {pedido.estado === "fallido" ? (
              <p className="text-red-600">
                La entrega no pudo completarse. Comunícate con la entidad médica para reprogramarla.
              </p>
            ) : (
              <>
                <p className="text-gray-500 mb-6">Seguimiento del proceso de entrega</p>
                <div className="space-y-6">
                  {ETAPAS.map((etapa, i) => {
                    const completado = i <= estado.paso;
                    return (
                      <div key={etapa.nombre} className="flex items-start gap-3">
                        <CheckCircle className={`mt-1 ${completado ? "text-green-500" : "text-gray-400"}`} />
                        <div>
                          <p className="font-semibold text-gray-700">{etapa.nombre}</p>
                          <p className="text-gray-500 text-sm">{etapa.descripcion}</p>
                          <p className={`text-sm font-medium ${completado ? "text-green-600" : "text-gray-400"}`}>
                            {completado ? "✓ Completado" : "Pendiente"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Medicamentos */}
          <div className="bg-white shadow-md rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Package size={20} /> Medicamentos en el pedido
            </h2>
            <ul className="list-disc ml-6 text-gray-600">
              {(pedido.pedido_detalle || []).map((d, i) => (
                <li key={i}>
                  {d.medicamentos?.nombre || "Medicamento"} <span className="text-gray-400">× {d.cantidad}</span>
                </li>
              ))}
            </ul>
          </div>

          {(pedido.estado === "en_ruta" || pedido.estado === "entregado") && (
            <div className="bg-white shadow-md rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <ClipboardList size={20} /> Logística
              </h2>
              <p className="text-gray-600">Entrega gestionada por el equipo de reparto de FarmaIA.</p>
            </div>
          )}

          {/* Mapa */}
          {hayCoords && (
            <div className="bg-white shadow-md rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Ubicación de entrega</h2>
              <div className="h-64 rounded-lg overflow-hidden">
                <MapContainer
                  center={[Number(pedido.latitud), Number(pedido.longitud)]}
                  zoom={15}
                  scrollWheelZoom={false}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap"
                  />
                  <Marker position={[Number(pedido.latitud), Number(pedido.longitud)]} icon={markerIcon} />
                </MapContainer>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => navigate("/inicio/mis-pedidos")}
              className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium transition mb-10"
            >
              Volver al panel
            </button>
            {puedeConfirmar && (
              <button
                onClick={confirmarRecepcion}
                disabled={confirmando}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition mb-10 disabled:opacity-50"
              >
                {confirmando ? "Confirmando..." : "Confirmar recepción"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetallePedido;
