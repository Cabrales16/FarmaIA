import { useState, useEffect } from "react";
import supabase from "../../api/supabase";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaRoute,
} from "react-icons/fa";  
import UseAuth from "../../context/UseAuth";
import Paginacion from "../components/Historial/Paginacion";
import FiltroEstados from "../components/Historial/FiltroEstados";

const Historial = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pacienteId, setPacienteId] = useState(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(11);

  // Filtro por estado
  const [filtroEstado, setFiltroEstado] = useState("");

  const { userId } = UseAuth();

  // Cargar paciente
  useEffect(() => {
    if (!userId) return;

    const loadPaciente = async () => {
      try {
        const { data: usuarioData, error: usuarioError } = await supabase
          .from("usuario")
          .select("id")
          .eq("auth_id", userId)
          .single();
        if (usuarioError) throw usuarioError;
        if (!usuarioData) throw new Error("Usuario no encontrado.");

        const { data: pacienteData, error: pacienteError } = await supabase
          .from("pacientes")
          .select("id")
          .eq("usuario_id", usuarioData.id)
          .single();
        if (pacienteError) throw pacienteError;
        if (!pacienteData) throw new Error("Paciente no encontrado.");

        setPacienteId(pacienteData.id);
      } catch (err) {
        console.error("Error al obtener paciente:", err.message);
        setError("No se pudo obtener tu información de paciente.");
      }
    };

    loadPaciente();
  }, [userId]);

  // Cargar pedidos
  useEffect(() => {
    if (!pacienteId) return;

    const loadPedidos = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("pedidos")
          .select(`
            id,
            estado,
            prioridad,
            direccion_entrega,
            fecha_pedido,
            fecha_entrega_estimada,
            fecha_entrega_real
          `)
          .eq("paciente_id", pacienteId)
          .order("fecha_pedido", { ascending: false });
        if (error) throw error;
        setPedidos(data || []);
      } catch (err) {
        console.error("Error al cargar pedidos:", err.message);
        setError("No se pudieron cargar tus pedidos.");
      } finally {
        setLoading(false);
      }
    };

    loadPedidos();
  }, [pacienteId]);

  // Colores e íconos de estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-700";
      case "en_ruta":
        return "bg-blue-100 text-blue-700";
      case "entregado":
        return "bg-green-100 text-green-700";
      case "fallido":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case "entregado":
        return <FaCheckCircle />;
      case "fallido":
        return <FaTimesCircle />;
      case "en_ruta":
        return <FaRoute />;
      default:
        return <FaClock />;
    }
  };

  // Aplicar filtro y paginación
  const pedidosFiltrados = filtroEstado
    ? pedidos.filter((pedido) => pedido.estado === filtroEstado)
    : pedidos;

  const totalPages = Math.ceil(pedidosFiltrados.length / itemsPerPage);
  const currentPedidos = pedidosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex">
      <div className="bg-gray-50 min-h-screen flex-1">
        {/* Encabezado */}
        <div className="border-b border-gray-300 flex items-center justify-between p-6 bg-white shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-800">Historial de pedidos</h1>
        </div>

        <div className="p-6">
          {loading && <p className="text-center text-gray-600 py-6">Cargando tus pedidos...</p>}
          {error && <div className="text-center text-red-600 bg-red-50 py-3 rounded-lg mb-4">{error}</div>}

          {!loading && !error && (
            <div className="bg-white p-6 rounded-2xl shadow-md">
              {pedidos.length > 0 ? (
                <>
                  {/* Filtro */}
                  <FiltroEstados filtro={filtroEstado} setFiltro={setFiltroEstado} />

                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-blue-500 text-white">
                        <tr>
                          <th className="py-3 px-4 text-left font-semibold">#</th>
                          <th className="py-3 px-4 text-left font-semibold">Estado</th>
                          <th className="py-3 px-4 text-left font-semibold">Dirección</th>
                          <th className="py-3 px-4 text-left font-semibold">Fecha del Pedido</th>
                          <th className="py-3 px-4 text-left font-semibold">Entrega Estimada</th>
                          <th className="py-3 px-4 text-left font-semibold">Entrega Real</th>
                          <th className="py-3 px-4 text-left font-semibold text-center">Prioridad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentPedidos.map((pedido, index) => (
                          <tr key={pedido.id} className="border-b border-gray-200 hover:bg-blue-50 transition-all">
                            <td className="py-3 px-4 text-gray-700 font-medium">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getEstadoColor(pedido.estado)}`}>
                                {getEstadoIcon(pedido.estado)} {pedido.estado}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600 flex items-center gap-2">
                              <FaMapMarkerAlt className="text-gray-400" /> {pedido.direccion_entrega || "Sin dirección"}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {pedido.fecha_pedido ? new Date(pedido.fecha_pedido).toLocaleDateString() : "-"}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {pedido.fecha_entrega_estimada ? new Date(pedido.fecha_entrega_estimada).toLocaleDateString() : "-"}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {pedido.fecha_entrega_real ? new Date(pedido.fecha_entrega_real).toLocaleDateString() : "-"}
                            </td>
                            <td className="py-3 px-4 text-gray-700 font-semibold text-center">{pedido.prioridad}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <Paginacion
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(page) => setCurrentPage(page)}
                    />
                  )}
                </>
              ) : (
                <div className="text-center py-10 text-gray-600">
                  <FaTimesCircle className="text-4xl mx-auto text-gray-400 mb-3" />
                  <p>No tienes pedidos registrados todavía.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Historial;
