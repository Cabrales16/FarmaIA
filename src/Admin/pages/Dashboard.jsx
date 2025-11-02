import { useEffect, useState } from "react";
import {
  FaTruck,
  FaClipboardList,
  FaUsers,
  FaRoute,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import supabase from "../../api/supabase";
import UseAuth from "../../context/UseAuth";

const Dashboard = () => {
  const navigate = useNavigate();
  const { userId } = UseAuth();

  // Estados
  const [adminName, setAdminName] = useState("");
  const [pedidosActivos, setPedidosActivos] = useState(0);
  const [pedidosEntregados, setPedidosEntregados] = useState(0);
  const [totalPacientes, setTotalPacientes] = useState(0);
  const [pedidosRecientes, setPedidosRecientes] = useState([]);

  // 🔹 Obtener nombre del administrador autenticado
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const { data, error } = await supabase
          .from("usuario")
          .select("nombre")
          .eq("auth_id", userId)
          .single();

        if (error) throw error;
        setAdminName(data?.nombre || "Administrador");
      } catch (err) {
        console.error("Error al obtener datos del admin:", err);
        toast.error("Error al cargar el nombre del administrador");
      }
    };
    if (userId) fetchAdmin();
  }, [userId]);

  // 🔹 Obtener estadísticas
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: activos } = await supabase
          .from("pedidos")
          .select("*", { count: "exact", head: true })
          .neq("estado", "entregado");

        const { count: entregados } = await supabase
          .from("pedidos")
          .select("*", { count: "exact", head: true })
          .eq("estado", "entregado");

        const { count: pacientes } = await supabase
          .from("pacientes")
          .select("*", { count: "exact", head: true });

        setPedidosActivos(activos || 0);
        setPedidosEntregados(entregados || 0);
        setTotalPacientes(pacientes || 0);
      } catch (err) {
        console.error("Error al obtener estadísticas:", err);
        toast.error("No se pudieron cargar las estadísticas.");
      }
    };
    fetchStats();
  }, []);

  // 🔹 Obtener pedidos recientes con join anidado correcto
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const { data, error } = await supabase
          .from("pedidos")
          .select(`
            id,
            estado,
            fecha_pedido,
            pacientes (
              usuario (
                nombre
              )
            ),
            pedido_detalle (
              medicamentos (
                nombre
              )
            )
          `)
          .order("fecha_pedido", { ascending: false })
          .limit(5);

        if (error) throw error;

        const pedidosFormateados = data.map((p) => ({
          id: p.id,
          paciente: p.pacientes?.usuario?.nombre || "Desconocido",
          medicamento: p.pedido_detalle?.[0]?.medicamentos?.nombre || "Medicamento no especificado",
          estado: p.estado,
          fecha: new Date(p.fecha_pedido).toLocaleDateString("es-CO"),
        }));

        setPedidosRecientes(pedidosFormateados);
      } catch (err) {
        console.error("Error al obtener pedidos recientes:", err);
        toast.error("Error al cargar pedidos recientes");
      }
    };
    fetchPedidos();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen flex-1">
      {/* Header */}
      <div className="border-b border-gray-300 flex items-center justify-between p-6 bg-white shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-800">Panel de control</h1>
      </div>

      {/* Bienvenida */}
      <div className="text-white bg-blue-600 m-6 p-6 rounded-2xl shadow-md">
        <p className="text-lg font-medium">
          Bienvenido, Administrador<span className="font-bold"> {adminName}</span>.
        </p>
        <p className="mt-2 text-sm text-blue-100">
          Supervise pedidos, rutas de entrega y el estado general del sistema FarmaIA.
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-6">
        <div className="bg-white p-6 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <h2 className="text-gray-500 text-sm uppercase font-semibold">Pedidos Activos</h2>
            <p className="text-3xl font-bold text-gray-800 mt-1">{pedidosActivos}</p>
          </div>
          <div className="bg-blue-500 h-14 w-14 rounded-xl flex items-center justify-center text-white text-2xl">
            <FaClipboardList />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <h2 className="text-gray-500 text-sm uppercase font-semibold">Pacientes</h2>
            <p className="text-3xl font-bold text-gray-800 mt-1">{totalPacientes}</p>
          </div>
          <div className="bg-green-500 h-14 w-14 rounded-xl flex items-center justify-center text-white text-2xl">
            <FaUsers />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <h2 className="text-gray-500 text-sm uppercase font-semibold">Entregados</h2>
            <p className="text-3xl font-bold text-gray-800 mt-1">{pedidosEntregados}</p>
          </div>
          <div className="bg-yellow-500 h-14 w-14 rounded-xl flex items-center justify-center text-white text-2xl">
            <FaTruck />
          </div>
        </div>
      </div>

      {/* Pedidos recientes */}
      <div className="m-6 mt-10 bg-white p-6 rounded-2xl shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FaClipboardList className="text-blue-500" /> Pedidos recientes
          </h2>
          <button
            onClick={() => navigate("/admin/pedidos")}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            Ver todos →
          </button>
        </div>

        {pedidosRecientes.length > 0 ? (
          <div className="flex flex-col gap-4">
            {pedidosRecientes.map((pedido) => (
              <div
                key={pedido.id}
                className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-blue-50 transition-all"
              >
                <div>
                  <p className="font-semibold text-gray-800">{pedido.medicamento}</p>
                  <p className="text-sm text-gray-500">
                    Paciente: <span className="font-medium">{pedido.paciente}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Estado:{" "}
                    <span
                      className={`font-medium ${
                        pedido.estado === "entregado"
                          ? "text-green-600"
                          : pedido.estado === "en camino"
                          ? "text-blue-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {pedido.estado}
                    </span>
                  </p>
                </div>

                <div className="text-sm text-gray-600 mt-2 sm:mt-0">
                  <span className="font-medium">Fecha:</span> {pedido.fecha}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No hay pedidos recientes.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;