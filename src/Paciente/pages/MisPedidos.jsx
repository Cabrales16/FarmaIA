import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ButtonNuevoPedido from "../components/Mis-pedidos/ButtonNuevoPedido";
import Pagination from "../components/Mis-pedidos/Paginacion";
import {
  FaTruck,
  FaPills,
  FaSpinner,
} from "react-icons/fa";
import supabase from "../../api/supabase";
import UseAuth from "../../context/UseAuth";

const MisPedidos = () => {
  const navigate = useNavigate();
  const { userId } = UseAuth();

  // 🔹 Estados principales
  const [nombre, setNombre] = useState("");
  const [pacienteId, setPacienteId] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPaginas = Math.ceil(pedidos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pedidosActuales = pedidos.slice(startIndex, startIndex + itemsPerPage);

  const cambiarPagina = (page) => {
    if (page >= 1 && page <= totalPaginas) setCurrentPage(page);
  };

  // 🔹 Cargar usuario y paciente
  useEffect(() => {
    if (!userId) return;

    const loadPaciente = async () => {
      try {
        const { data: usuarioData, error: usuarioError } = await supabase
          .from("usuario")
          .select("id, nombre")
          .eq("auth_id", userId)
          .single();

        if (usuarioError) throw usuarioError;
        if (!usuarioData) throw new Error("Usuario no encontrado.");

        setNombre(usuarioData.nombre);

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
      }
    };

    loadPaciente();
  }, [userId]);

  // 🔹 Cargar pedidos del paciente
  useEffect(() => {
    if (!pacienteId) return;

    const loadPedidos = async () => {
      try {
        const { data, error } = await supabase
          .from("pedidos")
          .select("*")
          .eq("paciente_id", pacienteId)
          .order("fecha_pedido", { ascending: false });

        if (error) throw error;
        setPedidos(data || []);
      } catch (err) {
        console.error("Error al cargar pedidos:", err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPedidos();
  }, [pacienteId]);

  // 🔹 Mostrar spinner si está cargando
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <FaSpinner className="text-4xl text-blue-600 animate-spin" />
        <p className="mt-2 text-gray-600 font-medium">
          Cargando tus pedidos...
        </p>
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen flex-1">
      {/* Encabezado */}
      <div className="border-b border-gray-300 flex items-center justify-between p-6 bg-white shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-800">Mis pedidos</h1>
      </div>

      {/* Bienvenida */}
      <div className="text-white bg-blue-500 m-6 p-6 rounded-2xl shadow-md">
        <p className="text-lg font-medium">
          Bienvenido, paciente <span className="font-bold">{nombre}</span>.
        </p>
        <p className="mt-2 text-sm text-blue-100">
          Gestione sus pedidos de medicamentos y consulte el estado de entregas.
        </p>
        <div className="mt-4 flex gap-3">
          <ButtonNuevoPedido />
        </div>
      </div>

      {/* Pedidos actuales */}
      <div className="m-6 mt-10 bg-white p-6 rounded-2xl shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FaPills className="text-blue-500" /> Pedidos actuales
          </h2>
          <button
            onClick={() => navigate("/inicio/historial")}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            Ver historial completo →
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {pedidosActuales.map((pedido) => (
            <div
              key={pedido.id}
              onClick={() => navigate(`/inicio/mis-pedidos/${pedido.id}`)}
              className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:shadow-md hover:bg-blue-50 transition-all cursor-pointer"
            >
              <div>
                <p className="font-semibold text-gray-800">
                  Pedido #{pedido.id}
                </p>
                <p className="text-sm text-gray-500">
                  Estado:{" "}
                  <span
                    className={`font-medium ${
                      pedido.estado === "entregado"
                        ? "text-green-600"
                        : pedido.estado === "en_ruta"
                        ? "text-blue-600"
                        : pedido.estado === "pendiente"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {pedido.estado}
                  </span>
                </p>
              </div>
              <div className="text-sm text-gray-600 mt-2 sm:mt-0">
                <span className="font-medium">Fecha Pedido:</span>{" "}
                {pedido.fecha_pedido
                  ? new Date(pedido.fecha_pedido).toLocaleString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Sin fecha"}
              </div>
            </div>
          ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPaginas}
          onPageChange={cambiarPagina}
        />
      </div>
    </div>
  );
};

export default MisPedidos;