import { useState } from "react";
import {
  FaRoute,
  FaMapMarkedAlt,
  FaTruck,
  FaDownload,
  FaTimes,
  FaRedo,
} from "react-icons/fa";
import toast from "react-hot-toast";
import {
  nearestNeighborRoute,
  twoOpt,
  buildGPX,
  totalDistanceKm,
  estimateETAkmh,
} from "../../../common/geo/tsp";
import SeleccionarPedidosModal from "./SeleccionarPedidosModal";
import RouteMap from "./RouteMap";

export default function GenerarRutaButton() {
  const [loading, setLoading] = useState(false);
  const [resumen, setResumen] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [seleccion, setSeleccion] = useState([]);
  const [depot, setDepot] = useState({
    lat: Number(import.meta.env.VITE_DEPOT_LAT || 4.7110),
    lng: Number(import.meta.env.VITE_DEPOT_LNG || -74.0721),
  });

  // 🔹 Abrir/Cerrar selector
  const abrirSelector = () => setModalOpen(true);
  const cerrarSelector = () => setModalOpen(false);

  // 🔹 Recibir selección y punto de partida desde el modal
  const onConfirmSeleccion = (items, puntoInicio) => {
    setSeleccion(items);
    setResumen(null);
    setModalOpen(false);

    if (puntoInicio) {
      setDepot(puntoInicio);
      toast.success(
        `Seleccionados ${items.length} pedidos. Punto de inicio establecido 🧭`
      );
    } else {
      toast.success(`${items.length} pedidos seleccionados.`);
    }
  };

  // 🔹 Generar ruta óptima
  const generarRutaOptima = async () => {
    if (!seleccion.length) {
      toast("Selecciona pedidos antes de generar la ruta.", { icon: "ℹ️" });
      return;
    }

    setLoading(true);
    setResumen(null);
    try {
      const nn = nearestNeighborRoute(seleccion, depot);
      const best = twoOpt(nn, depot, 250);

      const totalKm = totalDistanceKm(best, depot);
      const { h, m } = estimateETAkmh(totalKm, 25);

      const listado = best.map((p, i) => ({
        orden: i + 1,
        id: p.id,
        direccion: p.addr || p.direccion || "Dirección no disponible",
        lat: p.lat,
        lng: p.lng,
      }));

      setResumen({
        totalPedidos: listado.length,
        totalKm: Number(totalKm.toFixed(2)),
        eta: `${h}h ${m}m`,
        listado,
      });

      toast.success("Ruta generada correctamente ✅");
    } catch (err) {
      console.error(err);
      toast.error("Error al generar la ruta.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Descargar GPX
  const descargarGPX = () => {
    if (!resumen?.listado?.length) return;
    const gpx = buildGPX(
      resumen.listado.map((x) => ({ lat: x.lat, lng: x.lng })),
      depot,
      "Ruta FarmaIA"
    );
    const blob = new Blob([gpx], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ruta_farmaia.gpx";
    a.click();
    URL.revokeObjectURL(url);
  };

  // 🔹 Quitar pedido y recalcular ruta automáticamente
  const quitarPedido = (pedidoId) => {
    if (!resumen) return;
    const nuevaLista = resumen.listado.filter((p) => p.id !== pedidoId);

    if (nuevaLista.length === 0) {
      cancelarRuta();
      toast("No quedan pedidos. Ruta cancelada.", { icon: "🗑️" });
      return;
    }

    const recalculada = nearestNeighborRoute(nuevaLista, depot);
    const best = twoOpt(recalculada, depot, 250);
    const totalKm = totalDistanceKm(best, depot);
    const { h, m } = estimateETAkmh(totalKm, 25);

    const listado = best.map((p, i) => ({
      orden: i + 1,
      id: p.id,
      direccion: p.direccion || p.addr || "Dirección no disponible",
      lat: p.lat,
      lng: p.lng,
    }));

    setResumen({
      totalPedidos: listado.length,
      totalKm: Number(totalKm.toFixed(2)),
      eta: `${h}h ${m}m`,
      listado,
    });

    toast.success("Pedido eliminado de la ruta ✏️");
  };

  // 🔹 Cancelar ruta
  const cancelarRuta = () => {
    setResumen(null);
    setSeleccion([]);
    toast("Ruta cancelada 🗑️");
  };

  // 🔹 Recalcular si cambia el punto de inicio
  const actualizarPuntoInicio = (nuevoDepot) => {
    if (!resumen) {
      setDepot(nuevoDepot);
      toast.success("Punto de inicio actualizado 🧭");
      return;
    }

    setDepot(nuevoDepot);
    const recalculada = nearestNeighborRoute(resumen.listado, nuevoDepot);
    const best = twoOpt(recalculada, nuevoDepot, 250);
    const totalKm = totalDistanceKm(best, nuevoDepot);
    const { h, m } = estimateETAkmh(totalKm, 25);

    const listado = best.map((p, i) => ({
      orden: i + 1,
      id: p.id,
      direccion: p.direccion || p.addr || "Dirección no disponible",
      lat: p.lat,
      lng: p.lng,
    }));

    setResumen({
      totalPedidos: listado.length,
      totalKm: Number(totalKm.toFixed(2)),
      eta: `${h}h ${m}m`,
      listado,
    });

    toast.success("Ruta recalculada con nuevo punto de inicio 🧭");
  };

  // 🔹 Reoptimizar manualmente
  const reoptimizarRuta = () => {
    if (!resumen?.listado?.length) return;
    const recalculada = nearestNeighborRoute(resumen.listado, depot);
    const best = twoOpt(recalculada, depot, 250);
    const totalKm = totalDistanceKm(best, depot);
    const { h, m } = estimateETAkmh(totalKm, 25);

    const listado = best.map((p, i) => ({
      orden: i + 1,
      id: p.id,
      direccion: p.direccion || p.addr || "Dirección no disponible",
      lat: p.lat,
      lng: p.lng,
    }));

    setResumen({
      totalPedidos: listado.length,
      totalKm: Number(totalKm.toFixed(2)),
      eta: `${h}h ${m}m`,
      listado,
    });

    toast.success("Ruta reoptimizada ♻️");
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <FaRoute className="text-blue-600" /> Generar Ruta de Entrega
      </h3>

      {/* Botones principales */}
      <div className="flex flex-wrap gap-3 mb-3">
        <button
          onClick={abrirSelector}
          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2 px-4 rounded-lg shadow-sm transition-all"
        >
          Seleccionar pedidos
        </button>

        <button
          onClick={generarRutaOptima}
          disabled={loading || seleccion.length === 0}
          className="bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {loading ? "Calculando..." : "Generar Ruta"}
        </button>

        {resumen && (
          <>
            <button
              onClick={descargarGPX}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2 px-4 rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              <FaDownload /> Descargar GPX
            </button>

            <button
              onClick={reoptimizarRuta}
              className="bg-yellow-500 text-white hover:bg-yellow-600 font-semibold py-2 px-4 rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              <FaRedo /> Reoptimizar
            </button>

            <button
              onClick={cancelarRuta}
              className="bg-red-500 text-white hover:bg-red-600 font-semibold py-2 px-4 rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              <FaTimes /> Cancelar
            </button>
          </>
        )}
      </div>

      <div className="text-sm text-gray-600">
        Pedidos seleccionados:{" "}
        <span className="font-semibold">{seleccion.length}</span>
      </div>

      {/* Resultado */}
      {resumen && (
        <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <FaMapMarkedAlt className="text-green-600" />
            <p className="font-medium text-green-800">
              Ruta generada correctamente
            </p>
          </div>

          <p className="text-sm text-gray-700">
            Total pedidos: {resumen.totalPedidos}
          </p>
          <p className="text-sm text-gray-700">
            Distancia estimada: {resumen.totalKm} km
          </p>
          <p className="text-sm text-gray-700 mb-2">ETA: {resumen.eta}</p>

          {/* Lista editable */}
          <div className="bg-white p-3 rounded-lg border border-gray-200 overflow-y-auto max-h-64">
            {resumen.listado.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center border-b last:border-none py-1 group"
              >
                <p className="text-xs font-mono text-gray-700">
                  {p.orden}. Pedido #{p.id} — {p.direccion}
                </p>
                <button
                  onClick={() => quitarPedido(p.id)}
                  className="text-gray-400 hover:text-red-600 transition-all"
                  title="Quitar pedido"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>
            ))}
          </div>

          {/* Mapa interactivo */}
          <RouteMap
            depot={depot}
            points={resumen.listado.map(({ lat, lng, id, orden }) => ({
              id,
              orden,
              lat,
              lng,
            }))}
            onDepotChange={actualizarPuntoInicio}
          />
        </div>
      )}

      {/* Modal */}
      <SeleccionarPedidosModal
        open={modalOpen}
        onClose={cerrarSelector}
        onConfirm={onConfirmSeleccion}
      />
    </div>
  );
}
