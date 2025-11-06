import { useState } from "react";
import { FaRoute, FaMapMarkedAlt, FaTruck } from "react-icons/fa";
import supabase from "../../../api/supabase";
import toast from "react-hot-toast";

export default function GenerarRutaButton() {
  const [loadingRuta, setLoadingRuta] = useState(false);
  const [resultadoRuta, setResultadoRuta] = useState(null);

  const generarRuta = async () => {
    setLoadingRuta(true);
    setResultadoRuta(null);

    try {
      // Obtener pedidos pendientes
      const { data: pedidos, error } = await supabase
        .from("pedidos")
        .select("id, direccion_entrega, estado")
        .neq("estado", "entregado");

      if (error) throw error;

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const pacientesConDireccion = pedidos.filter((p) => p.direccion_entrega);
      const resumen = pacientesConDireccion
        .map(
          (p, i) =>
            `${i + 1}️⃣ Pedido #${p.id} - ${p.direccion_entrega || "Sin dirección"}`
        )
        .join("\n");

      setResultadoRuta({
        success: true,
        totalPedidos: pedidos.length,
        pacientesConDireccion: pacientesConDireccion.length,
        resumen,
      });

      toast.success("Ruta generada correctamente ✅");
    } catch (err) {
      console.error(err);
      toast.error("Error al generar la ruta ❌");
    } finally {
      setLoadingRuta(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 mt-4">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <FaRoute className="text-blue-600" /> Generar Ruta de Entrega
      </h3>

      <button
        onClick={generarRuta}
        disabled={loadingRuta}
        className="bg-blue-600 text-white hover:bg-blue-700 font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
      >
        {loadingRuta ? "Generando..." : "Generar Ruta"}
      </button>

      {resultadoRuta && (
        <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <FaMapMarkedAlt className="text-green-600" />
            <p className="font-medium text-green-800">Ruta generada correctamente</p>
          </div>
          <p className="text-sm text-gray-700">
            Total de pedidos: {resultadoRuta.totalPedidos}
          </p>
          <p className="text-sm text-gray-700 mb-2">
            Con dirección válida: {resultadoRuta.pacientesConDireccion}
          </p>
          <div className="bg-white p-3 rounded-lg border border-gray-200 overflow-y-auto max-h-48">
            <pre className="text-xs font-mono text-gray-600 whitespace-pre-wrap">
              {resultadoRuta.resumen}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
