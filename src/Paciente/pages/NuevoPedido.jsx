import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../api/supabase";
import UseAuth from "../../context/UseAuth";
import toast from "react-hot-toast";
import DireccionConMapa from "../components/NuevoPedido/DireccionConMapa";

const NuevoPedido = () => {
  const navigate = useNavigate();
  const { userId } = UseAuth();

  const [pacienteId, setPacienteId] = useState(null);
  const [medicamentos, setMedicamentos] = useState([]);
  const [medicamentoSeleccionado, setMedicamentoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [direccion, setDireccion] = useState("");
  const [latitud, setLatitud] = useState(null);
  const [longitud, setLongitud] = useState(null);
  const [observaciones, setObservaciones] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Obtener paciente_id según el usuario autenticado
  useEffect(() => {
    const fetchPaciente = async () => {
      if (!userId) return;

      const { data: usuarioData, error: usuarioError } = await supabase
        .from("usuario")
        .select("id")
        .eq("auth_id", userId)
        .single();

      if (usuarioError) {
        console.error(usuarioError);
        toast.error("No se pudo obtener el usuario.");
        return;
      }

      const { data: pacienteData, error: pacienteError } = await supabase
        .from("pacientes")
        .select("id")
        .eq("usuario_id", usuarioData.id)
        .single();

      if (pacienteError) {
        console.error(pacienteError);
        toast.error("No se pudo obtener el paciente.");
        return;
      }

      setPacienteId(pacienteData.id);
    };

    fetchPaciente();
  }, [userId]);

  // 🔹 Cargar medicamentos desde Supabase
  useEffect(() => {
    const fetchMedicamentos = async () => {
      const { data, error } = await supabase.from("medicamentos").select("*");
      if (error) {
        console.error("Error al cargar medicamentos:", error);
        toast.error("Error al cargar medicamentos.");
      } else {
        setMedicamentos(data);
      }
    };

    fetchMedicamentos();
  }, []);

  // 🔹 Agregar medicamento a la lista
  const agregarMedicamento = () => {
    if (!medicamentoSeleccionado) return toast.error("Seleccione un medicamento.");

    if (items.length >= 3)
      return toast.error("Solo puede agregar un máximo de 3 medicamentos.");

    if (items.find((item) => item.medicamento_id === parseInt(medicamentoSeleccionado)))
      return toast.error("Ese medicamento ya fue agregado.");

    const med = medicamentos.find((m) => m.id === parseInt(medicamentoSeleccionado));
    setItems([...items, { medicamento_id: med.id, nombre: med.nombre, cantidad }]);
    setMedicamentoSeleccionado("");
    setCantidad(1);
  };

  // 🔹 Eliminar medicamento
  const eliminarMedicamento = (id) => {
    setItems(items.filter((item) => item.medicamento_id !== id));
  };

  // 🔹 Enviar pedido a Supabase
  const enviarPedido = async () => {
    if (!direccion && (!latitud || !longitud))
      return toast.error("Debe ingresar o seleccionar una dirección de entrega.");
    if (items.length === 0) return toast.error("Agregue al menos un medicamento.");
    if (!pacienteId) return toast.error("Paciente no encontrado.");

    setLoading(true);

    try {
      // Insertar pedido principal
      const { data: pedidoData, error: pedidoError } = await supabase
        .from("pedidos")
        .insert([
          {
            paciente_id: pacienteId,
            estado: "pendiente",
            direccion_entrega: direccion,
            latitud: latitud,
            longitud: longitud,
            prioridad: 2,
            fecha_pedido: new Date(),
          },
        ])
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      // Insertar los medicamentos asociados
      const detalles = items.map((item) => ({
        pedido_id: pedidoData.id,
        medicamento_id: item.medicamento_id,
        cantidad: item.cantidad,
      }));

      const { error: detalleError } = await supabase
        .from("pedido_detalle")
        .insert(detalles);

      if (detalleError) throw detalleError;

      toast.success("Pedido registrado correctamente.");
      navigate("/inicio/mis-pedidos");
    } catch (err) {
      console.error(err);
      toast.error("Error al registrar el pedido.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Controles de cantidad
  const aumentarCantidad = () => setCantidad((prev) => prev + 1);
  const disminuirCantidad = () => setCantidad((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="flex">
      <div className="bg-gray-50 min-h-screen flex-1">
        {/* Encabezado */}
        <div className="border-b border-gray-300 flex items-center justify-between p-6 bg-white shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-800">Nuevo pedido</h1>
        </div>

        {/* Sección principal */}
        <div className="bg-white shadow-md rounded-xl p-6 m-6">
          <h2 className="text-xl font-semibold text-blue-600 mb-1">
            Nuevo pedido de medicamentos
          </h2>
          <p className="text-gray-600 mb-6">
            Seleccione los medicamentos que desea solicitar y complete los datos de entrega.
          </p>

          {/* Agregar medicamento */}
          <div className="border border-gray-300 rounded-xl p-4 mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Agregar medicamentos</h3>

            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={medicamentoSeleccionado}
                onChange={(e) => setMedicamentoSeleccionado(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-2 h-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Seleccione un medicamento</option>
                {medicamentos.map((med) => (
                  <option key={med.id} value={med.id}>
                    {med.nombre}
                  </option>
                ))}
              </select>

              <div className="flex items-center border border-gray-300 rounded-lg px-2 h-10">
                <button
                  onClick={disminuirCantidad}
                  className="px-2 text-gray-600 hover:text-blue-600 text-lg"
                >
                  –
                </button>
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                  className="w-16 text-center outline-none"
                  min="1"
                />
                <button
                  onClick={aumentarCantidad}
                  className="px-2 text-gray-600 hover:text-blue-600 text-lg"
                >
                  +
                </button>
              </div>

              <button
                onClick={agregarMedicamento}
                disabled={items.length >= 3}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 h-10 rounded-lg font-medium disabled:opacity-50"
              >
                Agregar
              </button>
            </div>

            {items.length > 0 && (
              <ul className="mt-4 border-t pt-4 space-y-2">
                {items.map((item) => (
                  <li
                    key={item.medicamento_id}
                    className="flex justify-between items-center border border-gray-200 p-2 rounded-lg"
                  >
                    <span className="text-gray-700 font-medium">
                      {item.nombre} (x{item.cantidad})
                    </span>
                    <button
                      onClick={() => eliminarMedicamento(item.medicamento_id)}
                      className="text-red-500 hover:text-red-700 text-sm font-semibold"
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Datos de entrega */}
          <div className="space-y-5">
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <DireccionConMapa
                direccion={direccion}
                setDireccion={setDireccion}
                setLatitud={setLatitud}
                setLongitud={setLongitud}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Observaciones
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ej: Entregar en portería o llamar antes de llegar"
                rows="3"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none placeholder-gray-400 focus:ring-2 focus:ring-blue-400"
              ></textarea>
            </div>
          </div>

          {/* Botones finales */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              onClick={() => navigate("/inicio/mis-pedidos")}
              className="border border-gray-400 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={enviarPedido}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar solicitud"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuevoPedido;