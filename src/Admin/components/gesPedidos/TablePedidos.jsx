import { useEffect, useState, useMemo } from "react";
import supabase from "../../../api/supabase";
import { FaBoxOpen, FaTruck, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

const TablePedidos = ({ filtros, busqueda }) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedidos = async () => {
      const { data, error } = await supabase
        .from("pedidos")
        .select(`
          id,
          paciente_id,
          pacientes(usuario(nombre)),
          estado,
          prioridad,
          fecha_pedido,
          fecha_entrega_estimada
        `)
        .order("id", { ascending: false });

      if (!error) setPedidos(data || []);
      setLoading(false);
    };
    fetchPedidos();
  }, []);

  // Filtrado local
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((p) => {
      const nombre = p.pacientes?.usuario?.nombre?.toLowerCase() || "";
      const termino = busqueda.toLowerCase().trim();

      const matchBusqueda = termino === "" || nombre.includes(termino);
      const matchEstado =
        filtros.estado.length === 0 || filtros.estado.includes(p.estado);
      const matchPrioridad =
        filtros.prioridad.length === 0 || filtros.prioridad.includes(p.prioridad);

      const fechaPedido = new Date(p.fecha_pedido);
      const desde = filtros.fechaDesde ? new Date(filtros.fechaDesde) : null;
      const hasta = filtros.fechaHasta ? new Date(filtros.fechaHasta) : null;

      const matchFechas =
        (!desde || fechaPedido >= desde) && (!hasta || fechaPedido <= hasta);

      return matchBusqueda && matchEstado && matchPrioridad && matchFechas;
    });
  }, [pedidos, filtros, busqueda]);

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case "pendiente":
        return <FaClock className="text-yellow-500 inline-block mr-1" />;
      case "en_ruta":
        return <FaTruck className="text-blue-500 inline-block mr-1" />;
      case "entregado":
        return <FaCheckCircle className="text-green-600 inline-block mr-1" />;
      case "fallido":
        return <FaTimesCircle className="text-red-600 inline-block mr-1" />;
      default:
        return <FaBoxOpen className="text-gray-500 inline-block mr-1" />;
    }
  };

  if (loading)
    return <div className="text-gray-500 text-center py-6 animate-pulse">Cargando pedidos...</div>;

  if (pedidosFiltrados.length === 0)
    return <div className="text-gray-500 text-center py-6">No hay pedidos que coincidan con los filtros.</div>;

  return (
    <div className="overflow-hidden border border-gray-200 rounded-xl">
      <div className="overflow-x-auto">
        <div className="max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="bg-blue-600 text-white text-xs uppercase tracking-wide sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3">Paciente</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Prioridad</th>
                <th className="px-6 py-3">Fecha Pedido</th>
                <th className="px-6 py-3">Entrega Estimada</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {pedidosFiltrados.map((p) => (
                <tr key={p.id} className="border-t hover:bg-blue-50 transition duration-150">
                  <td className="px-6 py-3 font-medium text-gray-800 whitespace-nowrap">
                    {p.pacientes?.usuario?.nombre || "—"}
                  </td>
                  <td className="px-6 py-3 font-semibold capitalize whitespace-nowrap">
                    {getEstadoIcon(p.estado)}
                    <span
                      className={
                        p.estado === "pendiente"
                          ? "text-yellow-600"
                          : p.estado === "en_ruta"
                          ? "text-blue-600"
                          : p.estado === "entregado"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {p.estado.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-3">{p.prioridad}</td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    {new Date(p.fecha_pedido).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    {p.fecha_entrega_estimada
                      ? new Date(p.fecha_entrega_estimada).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TablePedidos;