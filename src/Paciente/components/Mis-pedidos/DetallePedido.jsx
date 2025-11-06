import SideBar from "../SideBar";
import { useNavigate } from "react-router-dom";
import { CheckCircle, MapPin, Truck, ClipboardList, Package, Phone } from "lucide-react";

const DetallePedido = () => {
  const navigate = useNavigate();

  const pedido = {
    id: "001",
    fechaSolicitud: "20 de octubre de 2025",
    estadoGeneral: "En ruta",
    direccionEntrega: "Calle 45 #23-10, Bogotá",
    fechaEntregaEstimada: "21 de octubre de 2025, 16:00",
    etapas: [
      { nombre: "Solicitud Recibida", descripcion: "Su pedido ha sido registrado", completado: true },
      { nombre: "En preparación", descripcion: "Preparando medicamentos", completado: true },
      { nombre: "En Camino", descripcion: "Operador en ruta de entrega", completado: true },
      { nombre: "Entregado", descripcion: "Pedido entregado exitosamente", completado: false },
    ],
    medicamentos: [
      { nombre: "Losartán 50 mg" },
      { nombre: "Metformina 850 mg" },
      { nombre: "Atorvastatina 20 mg" },
    ],
    operador: {
      nombre: "Carlos López",
      telefono: "+57 300 123 4567",
    },
  };

  return (
    <div className="flex">
      <div className="flex-1 bg-gray-50 min-h-screen">
        {/* Encabezado */}
        <div className="border-b border-gray-300 flex items-center justify-between p-6 bg-white shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-800">
            Pedido #{pedido.id}
          </h1>
          <p className="text-gray-500">
            Solicitado el {pedido.fechaSolicitud}
          </p>
        </div>

        {/* Contenido del Detalle del Pedido */}

        <div className="p-6">
        {/* Estado principal */}
        <div className="bg-blue-100 text-blue-800 font-semibold rounded-xl px-4 py-3 inline-block mb-6">
          {pedido.estadoGeneral}
        </div>

        {/* Sección de información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white shadow-sm rounded-xl p-5">
            <h2 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <MapPin size={20} /> Dirección de Entrega
            </h2>
            <p className="text-gray-600">{pedido.direccionEntrega}</p>
          </div>

          <div className="bg-white shadow-sm rounded-xl p-5">
            <h2 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Truck size={20} /> Entrega Estimada
            </h2>
            <p className="text-gray-600">{pedido.fechaEntregaEstimada}</p>
          </div>
        </div>

        {/* Estado del pedido */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Estado del Pedido
          </h2>
          <p className="text-gray-500 mb-6">
            Seguimiento del proceso de entrega
          </p>

          <div className="space-y-6">
            {pedido.etapas.map((etapa, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle
                  className={`mt-1 ${
                    etapa.completado ? "text-green-500" : "text-gray-400"
                  }`}
                />
                <div>
                  <p className="font-semibold text-gray-700">{etapa.nombre}</p>
                  <p className="text-gray-500 text-sm">{etapa.descripcion}</p>
                  <p
                    className={`text-sm font-medium ${
                      etapa.completado ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {etapa.completado ? "✓ Completado" : "En progreso"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Medicamentos */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Package size={20} /> Medicamentos en el Pedido
          </h2>
          <ul className="list-disc ml-6 text-gray-600">
            {pedido.medicamentos.map((m, i) => (
              <li key={i}>{m.nombre}</li>
            ))}
          </ul>
        </div>

        {/* Información del operador */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ClipboardList size={20} /> Información del Operador
          </h2>
          <p className="text-gray-700 font-medium mb-1">
            Operador asignado: {pedido.operador.nombre}
          </p>
          <p className="flex items-center gap-2 text-gray-600">
            <Phone size={18} /> {pedido.operador.telefono}
          </p>
        </div>

        {/* Mapa y botones */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Ubicación Aproximada
          </h2>
          <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center text-gray-500">
            Mapa de seguimiento en tiempo real
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/inicio/mis-pedidos")}
            className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium transition mb-10"
          >
            Volver al Panel
          </button>
          <button className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition mb-10">
            Confirmar Recepción
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default DetallePedido;